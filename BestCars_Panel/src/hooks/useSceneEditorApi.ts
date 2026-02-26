import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SceneEditorStorage } from "../app/types/scene-editor";
import {
  createEmptyScene,
  createEmptySlot,
} from "../app/types/scene-editor";
import {
  getScenes,
  getActiveScene,
  createScene as apiCreateScene,
  updateScene as apiUpdateScene,
  deleteScene as apiDeleteScene,
  setActiveScene as apiSetActiveScene,
} from "../services/api";

export function apiSceneToEditorScene(api: {
  id: string;
  name: string;
  backgroundUrl: string;
  positions: Record<string, unknown>;
}) {
  const positions = api.positions as Record<string, { vehicleId: string | null; transform: { x: number; y: number; scale: number; rotation: number }; updatedAt: string }>;
  const defaultPositions = ["parking-1", "parking-2", "parking-3", "rampa", "parking-4"].reduce(
    (acc, pos) => {
      acc[pos] = positions?.[pos] ?? createEmptySlot();
      return acc;
    },
    {} as Record<string, { vehicleId: string | null; transform: { x: number; y: number; scale: number; rotation: number }; updatedAt: string }>
  );
  return {
    id: api.id,
    name: api.name,
    backgroundUrl: api.backgroundUrl ?? "",
    positions: defaultPositions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
      .then(([scenes, activeSceneFromWeb]) => {
        if (cancelled) return;
        if (scenes.length === 0) return;

        const editorScenes = scenes.map(apiSceneToEditorScene);
        // Poner primero la escena que está cargada en la web (Escena 1 = lo que ve el usuario en la web)
        const activeId = activeSceneFromWeb?.id ?? scenes.find((s) => s.isActive)?.id ?? scenes[0]?.id;
        const ordered =
          activeId != null && editorScenes.length > 1
            ? [
                ...editorScenes.filter((s) => s.id === activeId),
                ...editorScenes.filter((s) => s.id !== activeId),
              ]
            : editorScenes;
        const firstId = ordered[0]?.id;
        setStorage((prev) => ({
          ...prev,
          scenes: ordered,
          activeSceneId: firstId ?? prev.activeSceneId,
          previewUrl: prev.previewUrl,
          webActiveSceneId: activeId ?? null,
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

  const persistScene = useCallback(
    async (scene: { id: string; name: string; backgroundUrl: string; positions: Record<string, unknown> }) => {
      if (!apiMode || !isAuthenticated) return;

      const isApiId = !scene.id.startsWith("scene_");
      try {
        if (isApiId) {
          await apiUpdateScene(scene.id, {
            name: scene.name,
            backgroundUrl: scene.backgroundUrl,
            positions: scene.positions,
          });
          toast.success("Escena guardada");
        } else {
          const created = await apiCreateScene({
            name: scene.name,
            backgroundUrl: scene.backgroundUrl,
            positions: scene.positions,
          });
          setStorage((prev) => ({
            ...prev,
            scenes: prev.scenes.map((s) =>
              s.id === scene.id ? apiSceneToEditorScene(created) : s
            ),
            activeSceneId: prev.activeSceneId === scene.id ? created.id : prev.activeSceneId,
          }));
          toast.success("Escena creada");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al guardar");
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  const deleteSceneApi = useCallback(
    async (sceneId: string) => {
      if (!apiMode || !isAuthenticated) return;
      if (sceneId.startsWith("scene_")) return; // Local only

      try {
        await apiDeleteScene(sceneId);
        setStorage((prev) => {
          const next = prev.scenes.filter((s) => s.id !== sceneId);
          if (next.length === 0) {
            const fallback = createEmptyScene({ name: "Escena 1", backgroundUrl: "" });
            return {
              ...prev,
              scenes: [fallback],
              activeSceneId: fallback.id,
            };
          }
          return {
            ...prev,
            scenes: next,
            activeSceneId: prev.activeSceneId === sceneId ? next[0].id : prev.activeSceneId,
          };
        });
        toast.success("Escena eliminada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al eliminar");
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  const setActiveSceneApi = useCallback(
    async (sceneId: string) => {
      if (!apiMode || !isAuthenticated) return;
      if (sceneId.startsWith("scene_")) {
        toast.error("Guarda la escena primero para activarla");
        return;
      }

      try {
        await apiSetActiveScene(sceneId);
        toast.success("Escena activada en la web");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al activar");
      }
    },
    [apiMode, isAuthenticated]
  );

  return { loading, persistScene, deleteSceneApi, setActiveSceneApi };
}
