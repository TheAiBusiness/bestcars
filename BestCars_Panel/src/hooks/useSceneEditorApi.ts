import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SceneEditorStorage, Scene, Hotspot } from "../app/types/scene-editor";
import {
  getScenes,
  getActiveScene,
  createScene as apiCreateScene,
  updateScene as apiUpdateScene,
  deleteScene as apiDeleteScene,
  setActiveScene as apiSetActiveScene,
  duplicateScene as apiDuplicateScene,
} from "../services/api";
import type { ApiScene } from "../services/api";

/** Convierte escena del API (hotspots[] o positions legacy) a escena del editor */
export function apiSceneToEditorScene(api: ApiScene): Scene {
  let hotspots: Hotspot[] = [];
  if (Array.isArray(api.hotspots) && api.hotspots.length > 0) {
    hotspots = api.hotspots.map((h) => ({
      id: h.id,
      vehicleId: h.vehicleId,
      x: Number(h.x) || 0,
      y: Number(h.y) || 0,
      createdAt: h.createdAt,
    }));
  } else if (api.positions && typeof api.positions === "object" && !Array.isArray(api.positions)) {
    for (const [slotId, slot] of Object.entries(api.positions)) {
      const s = slot as { vehicleId: string | null; transform?: { x: number; y: number }; updatedAt?: string };
      if (!s?.vehicleId) continue;
      const t = s.transform ?? { x: 0, y: 0 };
      hotspots.push({
        id: slotId,
        vehicleId: s.vehicleId,
        x: Number(t.x) || 0,
        y: Number(t.y) || 0,
        createdAt: s.updatedAt,
      });
    }
  }
  return {
    id: api.id,
    name: api.name,
    backgroundUrl: api.backgroundUrl ?? "",
    hotspots,
    createdAt: api.createdAt ?? new Date().toISOString(),
    updatedAt: api.updatedAt ?? new Date().toISOString(),
  };
}

export function useSceneEditorApi(
  apiMode: boolean,
  isAuthenticated: boolean,
  storage: SceneEditorStorage,
  setStorage: React.Dispatch<React.SetStateAction<SceneEditorStorage>>
) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiMode || !isAuthenticated) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getScenes(), getActiveScene()])
      .then(([scenes, activeScene]) => {
        if (cancelled) return;
        const editorScenes = (scenes ?? []).map(apiSceneToEditorScene);
        const webPrincipalId = activeScene?.id ?? editorScenes[0]?.id ?? null;
        const defaultSelectedId = webPrincipalId ?? editorScenes[0]?.id ?? null;
        setStorage((prev) => ({
          ...prev,
          scenes: editorScenes,
          activeSceneId: editorScenes.length > 0 ? (defaultSelectedId ?? prev.activeSceneId) : null,
          activeHotspotId: prev.activeHotspotId,
          previewUrl: prev.previewUrl,
          webActiveSceneId: webPrincipalId,
        }));
      })
      .catch((err) => {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "Error al cargar escenas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMode, isAuthenticated, setStorage]);

  type PersistOptions = { silentSuccess?: boolean };
  const persistScene = useCallback(
    async (scene: Scene, options?: PersistOptions): Promise<{ ok: true; sceneId: string } | { ok: false }> => {
      if (!apiMode || !isAuthenticated) return { ok: false };

      const payload = {
        name: scene.name,
        backgroundUrl: scene.backgroundUrl,
        hotspots: scene.hotspots ?? [],
      };

      const successToast =
        (scene.hotspots?.length ?? 0) === 0
          ? "Escena guardada sin hotspots"
          : "Escena guardada";
      const silent = options?.silentSuccess === true;

      // 1) Intentar actualizar siempre
      try {
        const updated = await apiUpdateScene(scene.id, payload);
        const editorScene = apiSceneToEditorScene(updated);
        setStorage((prev) => ({
          ...prev,
          scenes: prev.scenes.map((s) => (s.id === scene.id ? editorScene : s)),
        }));
        if (!silent) toast.success(successToast);
        return { ok: true, sceneId: updated.id };
      } catch (err) {
        const msg = err instanceof Error ? err.message || "" : String(err ?? "");
        // Si es NOT_FOUND / no existe, probamos a crearla
        if (msg.toLowerCase().includes("not found")) {
          try {
            const created = await apiCreateScene(payload);
            const editorScene = apiSceneToEditorScene(created);
            setStorage((prev) => ({
              ...prev,
              scenes: prev.scenes.map((s) =>
                s.id === scene.id ? editorScene : s
              ),
              activeSceneId:
                prev.activeSceneId === scene.id ? created.id : prev.activeSceneId,
            }));
            if (!silent) toast.success(successToast);
            return { ok: true, sceneId: created.id };
          } catch (err2) {
            toast.error(
              err2 instanceof Error
                ? err2.message || "No se pudo guardar la escena. Reintenta."
                : "No se pudo guardar la escena. Reintenta."
            );
            return { ok: false };
          }
        }
        toast.error(
          msg || "No se pudo guardar la escena. Reintenta."
        );
        return { ok: false };
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  const deleteSceneApi = useCallback(
    async (sceneId: string) => {
      if (!apiMode || !isAuthenticated) return;

      try {
        await apiDeleteScene(sceneId);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al eliminar");
        return;
      }

      setStorage((prev) => {
        const next = prev.scenes.filter((s) => s.id !== sceneId);
        const fallbackId = next[0]?.id ?? null;
        const wasWebPrincipal = prev.webActiveSceneId === sceneId;
        return {
          ...prev,
          scenes: next,
          activeSceneId: prev.activeSceneId === sceneId ? fallbackId : prev.activeSceneId,
          activeHotspotId: prev.activeSceneId === sceneId ? null : prev.activeHotspotId,
          webActiveSceneId: wasWebPrincipal ? fallbackId : prev.webActiveSceneId,
        };
      });
      toast.success("Escena eliminada");
    },
    [apiMode, isAuthenticated, setStorage]
  );

  const setActiveSceneApi = useCallback(
    async (sceneId: string, options?: { silentSuccess?: boolean }): Promise<boolean> => {
      if (!apiMode || !isAuthenticated) return false;
      try {
        await apiSetActiveScene(sceneId);
        setStorage((prev) => ({ ...prev, webActiveSceneId: sceneId }));
        if (options?.silentSuccess !== true) toast.success("Escena activada en la web");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al activar");
        return false;
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  const duplicateSceneApi = useCallback(
    async (sceneId: string) => {
      if (!apiMode || !isAuthenticated) return;
      if (sceneId.startsWith("scene_")) {
        toast.error("Guarda la escena primero para poder duplicarla");
        return;
      }
      try {
        const created = await apiDuplicateScene(sceneId);
        const editorScene = apiSceneToEditorScene(created);
        setStorage((prev) => ({
          ...prev,
          scenes: [...prev.scenes, editorScene],
          activeSceneId: editorScene.id,
          activeHotspotId: null,
        }));
        toast.success("Escena duplicada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al duplicar");
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  /** Refresca cache local: GET /api/scenes + escena activa (tras Guardar / Activar). */
  const refreshScenesFromApi = useCallback(async () => {
    if (!apiMode || !isAuthenticated) return;
    try {
      const [scenes, activeScene] = await Promise.all([getScenes(), getActiveScene()]);
      const editorScenes = (scenes ?? []).map(apiSceneToEditorScene);
      const webPrincipalId = activeScene?.id ?? editorScenes[0]?.id ?? null;
      setStorage((prev) => ({
        ...prev,
        scenes: editorScenes,
        webActiveSceneId: webPrincipalId,
      }));
    } catch {
      // silenciar
    }
  }, [apiMode, isAuthenticated, setStorage]);

  return { loading, persistScene, deleteSceneApi, setActiveSceneApi, duplicateSceneApi, refreshScenesFromApi };
}
