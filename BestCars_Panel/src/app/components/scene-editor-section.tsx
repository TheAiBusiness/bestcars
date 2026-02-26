/**
 * Editor de escenas para definir una única imagen de escena (URL)
 * y los puntos clicables de cada coche sobre esa imagen.
 * Sincroniza el estado con un iframe de vista previa mediante postMessage.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Save, RotateCcw, Image as ImageIcon, Lock } from "lucide-react";

import { Vehicle } from "../data/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLocalStorageState } from "../hooks/use-local-storage-state";
import { useSceneEditorApi, apiSceneToEditorScene } from "../../hooks/useSceneEditorApi";
import { createScene as apiCreateScene } from "../../services/api";
import {
  POSITION_LABEL,
  POSITION_ORDER,
  SceneEditorStorage,
  SceneSlot,
  createEmptyScene,
  createEmptySlot,
} from "../types/scene-editor";
import "./scene-editor-hotspot.css";

type SceneEditorSectionProps = {
  vehicles: Vehicle[];
  searchQuery?: string;
  apiMode?: boolean;
  isAuthenticated?: boolean;
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_PREVIEW_URL = "http://localhost:5173/scene-preview";

/** Imagen de la escena principal (Best Cars Ibérica) — no editable. Colocar el archivo en public/scene-principal-bestcars.png en web y panel. */
const SCENE_PRINCIPAL_IMAGE_URL = "/scene-principal-bestcars.png";

export function SceneEditorSection({ vehicles, searchQuery = "", apiMode = false, isAuthenticated = false }: SceneEditorSectionProps) {
  const initialStorage: SceneEditorStorage = useMemo(() => {
    const scene = createEmptyScene({
      name: "Escena 1",
      backgroundUrl: SCENE_PRINCIPAL_IMAGE_URL,
    });
    return {
      scenes: [scene],
      activeSceneId: scene.id,
      activePositionId: "parking-1",
      previewUrl: DEFAULT_PREVIEW_URL,
      webActiveSceneId: null,
    };
  }, []);

  const [storage, setStorage] = useLocalStorageState<SceneEditorStorage>(
    "bestcars_scene_editor_state",
    initialStorage,
  );

  const { persistScene, deleteSceneApi, setActiveSceneApi } = useSceneEditorApi(
    apiMode,
    isAuthenticated,
    storage,
    setStorage,
  );

  // Aseguramos que siempre haya una escena activa válida.
  const activeScene =
    storage.scenes.find((s) => s.id === storage.activeSceneId) ?? storage.scenes[0];

  // Escena que está ahora mismo en la web (Best Cars Ibérica) — siempre la mostramos como referencia.
  const webActiveScene = storage.webActiveSceneId
    ? storage.scenes.find((s) => s.id === storage.webActiveSceneId) ?? null
    : null;

  // Lista de escenas con la escena de la web siempre primera (Escena 1 = lo que ve el usuario en best cars).
  const scenesForList = useMemo(() => {
    if (!webActiveScene) return storage.scenes;
    const rest = storage.scenes.filter((s) => s.id !== storage.webActiveSceneId);
    return [webActiveScene, ...rest];
  }, [storage.scenes, storage.webActiveSceneId, webActiveScene]);

  useEffect(() => {
    if (!activeScene) {
      const fallback = createEmptyScene({ name: "Escena 1", backgroundUrl: "" });
      setStorage({
        scenes: [fallback],
        activeSceneId: fallback.id,
        activePositionId: "parking-1",
        previewUrl: storage.previewUrl ?? DEFAULT_PREVIEW_URL,
        webActiveSceneId: storage.webActiveSceneId ?? null,
      });
      return;
    }

    if (activeScene.id !== storage.activeSceneId) {
      setStorage((prev) => ({ ...prev, activeSceneId: activeScene.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene?.id]);

  const savedSlot = activeScene.positions[storage.activePositionId];

  // Borrador del slot (para permitir Guardar / Restablecer).
  const [draftSlot, setDraftSlot] = useState<SceneSlot>(savedSlot ?? createEmptySlot());

  // Borrador del fondo (es por escena, no por posición).
  const [draftBackgroundUrl, setDraftBackgroundUrl] = useState<string>(
    activeScene?.backgroundUrl ?? "",
  );

  const displayBackgroundUrl =
    draftBackgroundUrl ||
    (activeScene?.backgroundUrl ?? "") ||
    (webActiveScene?.backgroundUrl ?? "") ||
    (storage.webActiveSceneId === activeScene?.id ? SCENE_PRINCIPAL_IMAGE_URL : "");

  // Cada vez que cambiamos de escena/posición, “cargamos” borradores desde lo guardado.
  useEffect(() => {
    setDraftSlot(savedSlot ?? createEmptySlot());
    setDraftBackgroundUrl(activeScene?.backgroundUrl ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage.activeSceneId, storage.activePositionId]);

  const slotDirty = useMemo(() => {
    try {
      return JSON.stringify(draftSlot) !== JSON.stringify(savedSlot);
    } catch {
      return true;
    }
  }, [draftSlot, savedSlot]);

  const backgroundDirty = draftBackgroundUrl !== (activeScene?.backgroundUrl ?? "");

  const isDirty = slotDirty || backgroundDirty;

  const activeVehicle = useMemo(() => {
    if (!draftSlot.vehicleId) return null;
    return vehicles.find((v) => v.id === draftSlot.vehicleId) ?? null;
  }, [draftSlot.vehicleId, vehicles]);

  const filteredVehiclesForPicker = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q),
    );
  }, [vehicles, searchQuery]);

  // --------- UI actions ---------

  const confirmDiscardIfDirty = (): boolean => {
    if (!isDirty) return true;
    return window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?");
  };

  const selectScene = (sceneId: string) => {
    if (!confirmDiscardIfDirty()) return;
    setStorage((prev) => ({ ...prev, activeSceneId: sceneId }));
  };

  const selectPosition = (posId: SceneEditorStorage["activePositionId"]) => {
    if (!confirmDiscardIfDirty()) return;
    setStorage((prev) => ({ ...prev, activePositionId: posId }));
  };

  const createScene = async (name: string, backgroundUrl: string) => {
    const sceneName = name.trim() || `Escena ${storage.scenes.length + 1}`;
    const sceneBg = backgroundUrl.trim();

    if (apiMode && isAuthenticated) {
      try {
        const created = await apiCreateScene({
          name: sceneName,
          backgroundUrl: sceneBg,
          positions: {
            "parking-1": createEmptySlot(),
            "parking-2": createEmptySlot(),
            "parking-3": createEmptySlot(),
            rampa: createEmptySlot(),
            "parking-4": createEmptySlot(),
          },
        });
        const editorScene = apiSceneToEditorScene(created);
        setStorage((prev) => ({
          ...prev,
          scenes: [...prev.scenes, editorScene],
          activeSceneId: editorScene.id,
          activePositionId: "parking-1",
        }));
        toast.success("Escena creada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al crear");
      }
      return;
    }

    const newScene = createEmptyScene({ name: sceneName, backgroundUrl: sceneBg });
    setStorage((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
      activeSceneId: newScene.id,
      activePositionId: "parking-1",
    }));
  };

  const duplicateActiveScene = () => {
    if (!activeScene) return;
    if (!confirmDiscardIfDirty()) return;

    const copy = deepClone(activeScene);
    copy.id = `scene_${Date.now()}`;
    copy.name = `${activeScene.name} (copia)`;
    copy.createdAt = nowIso();
    copy.updatedAt = nowIso();

    setStorage((prev) => ({
      ...prev,
      scenes: [...prev.scenes, copy],
      activeSceneId: copy.id,
      activePositionId: prev.activePositionId,
    }));
  };

  const deleteActiveScene = () => {
    if (!activeScene) return;
    if (storage.webActiveSceneId && activeScene.id === storage.webActiveSceneId) {
      toast.error("No se puede eliminar la escena visible en la web (bloqueada).");
      return;
    }
    if (!window.confirm(`¿Eliminar la escena "${activeScene.name}"?`)) return;

    if (apiMode && isAuthenticated && !activeScene.id.startsWith("scene_")) {
      deleteSceneApi(activeScene.id);
      return;
    }

    setStorage((prev) => {
      const nextScenes = prev.scenes.filter((s) => s.id !== activeScene.id);
      if (nextScenes.length === 0) {
        const fallback = createEmptyScene({ name: "Escena 1", backgroundUrl: "" });
        return {
          ...prev,
          scenes: [fallback],
          activeSceneId: fallback.id,
          activePositionId: "parking-1",
        };
      }
      const nextActive = nextScenes[0];
      return {
        ...prev,
        scenes: nextScenes,
        activeSceneId: nextActive.id,
        activePositionId: "parking-1",
      };
    });
  };

  const saveBackground = () => {
    if (!activeScene) return;
    const updated = {
      ...activeScene,
      backgroundUrl: draftBackgroundUrl.trim(),
      updatedAt: nowIso(),
    };
    setStorage((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id !== activeScene.id ? s : updated)),
    }));
    if (apiMode && isAuthenticated) persistScene(updated);
  };

  const resetBackgroundDraft = () => {
    setDraftBackgroundUrl(activeScene?.backgroundUrl ?? "");
  };

  const saveSlot = () => {
    if (!activeScene) return;
    const slotWithTime = { ...draftSlot, updatedAt: nowIso() };
    const updated = {
      ...activeScene,
      updatedAt: nowIso(),
      positions: {
        ...activeScene.positions,
        [storage.activePositionId]: slotWithTime,
      },
    };
    setStorage((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id !== activeScene.id ? s : updated)),
    }));
    if (apiMode && isAuthenticated) persistScene(updated);
  };

  const resetSlotDraft = () => {
    setDraftSlot(savedSlot ?? createEmptySlot());
  };

  const setVehicleForSlot = (vehicleId: string | null) => {
    setDraftSlot((prev) => ({
      ...prev,
      vehicleId,
      updatedAt: nowIso(),
    }));
  };

  const resetTransform = () => {
    setDraftSlot((prev) => ({
      ...prev,
      // En el nuevo flujo solo nos interesa la posición (x, y) como punto clicable.
      // Escala y rotación se fijan a valores neutros.
      transform: { x: 0, y: 0, scale: 1, rotation: 0 },
      updatedAt: nowIso(),
    }));
  };

  // --------- Drag support (vehicle on canvas) ---------
  const draggingRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

  const onVehiclePointerDown = (e: React.PointerEvent) => {
    if (!activeVehicle) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    draggingRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: draftSlot.transform.x,
      baseY: draftSlot.transform.y,
    };
  };

  const onVehiclePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current.isDragging) return;

    const dx = e.clientX - draggingRef.current.startX;
    const dy = e.clientY - draggingRef.current.startY;

    setDraftSlot((prev) => ({
      ...prev,
      transform: {
        ...prev.transform,
        x: draggingRef.current.baseX + dx,
        y: draggingRef.current.baseY + dy,
      },
      updatedAt: nowIso(),
    }));
  };

  const onVehiclePointerUp = () => {
    draggingRef.current.isDragging = false;
  };

  // Permite hacer clic en el lienzo para colocar el hotspot del vehículo seleccionado
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draftSlot.vehicleId) {
      toast.error("Selecciona primero un vehículo para esta posición.");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    // Coordenadas relativas al centro del canvas (coherentes con translate(-50%, -50%))
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    setDraftSlot((prev) => ({
      ...prev,
      transform: {
        ...prev.transform,
        x: offsetX,
        y: offsetY,
      },
      updatedAt: nowIso(),
    }));
  };

  // --------- Preview sync via postMessage ---------
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const buildPreviewPayload = () => {
    const sceneForPreview = activeScene
      ? {
          ...activeScene,
          backgroundUrl: draftBackgroundUrl,
          positions: {
            ...activeScene.positions,
            [storage.activePositionId]: draftSlot,
          },
        }
      : null;

    return {
      type: "BESTCARS_SCENE_EDITOR_STATE",
      payload: {
        activeSceneId: storage.activeSceneId,
        activePositionId: storage.activePositionId,
        scene: sceneForPreview,
      },
    };
  };

  const sendPreviewState = () => {
    try {
      iframeRef.current?.contentWindow?.postMessage(buildPreviewPayload(), "*");
    } catch {
      // Nada: el iframe puede no estar cargado o la URL puede fallar.
    }
  };

  // Enviamos estado en caliente (incluye borradores).
  useEffect(() => {
    sendPreviewState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage.activeSceneId, storage.activePositionId, draftSlot, draftBackgroundUrl]);

  // Handshake: si la web pide el estado, respondemos.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as any;
      if (!data || typeof data !== "object") return;

      if (data.type === "BESTCARS_SCENE_EDITOR_REQUEST_STATE") {
        sendPreviewState();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage.activeSceneId, storage.activePositionId, draftSlot, draftBackgroundUrl]);

  // --------- Scene creation form (simple) ---------
  const [newSceneName, setNewSceneName] = useState("");
  const [newSceneBg, setNewSceneBg] = useState("");

  const handleCreateSceneClick = () => {
    createScene(newSceneName, newSceneBg);
    setNewSceneName("");
    setNewSceneBg("");
  };

  const setPreviewUrl = (url: string) => {
    setStorage((prev) => ({ ...prev, previewUrl: url }));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top status */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">Escena activa</p>
          <h3 className="text-xl text-white/90">{activeScene?.name ?? "Sin escena"}</h3>
          <p className="text-sm text-white/40">
            Posición: <span className="text-white/70">{POSITION_LABEL[storage.activePositionId]}</span>
            {isDirty ? (
              <span className="ml-3 inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300 border border-amber-500/20">
                Sin guardar
              </span>
            ) : (
              <span className="ml-3 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 border border-emerald-500/20">
                Guardado
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {apiMode && isAuthenticated && activeScene && !activeScene.id.startsWith("scene_") && (
            <button
              onClick={() => {
                setStorage((prev) => ({ ...prev, webActiveSceneId: activeScene.id }));
                setActiveSceneApi(activeScene.id);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-200 text-sm flex items-center gap-2"
              title="Mostrar esta escena en la web (pasará a ser la escena bloqueada)"
            >
              Activar en web
            </button>
          )}
          <button
            onClick={duplicateActiveScene}
            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center gap-2"
            title="Duplicar escena"
          >
            <Copy className="w-4 h-4" />
            Duplicar
          </button>
          <button
            onClick={deleteActiveScene}
            disabled={storage.webActiveSceneId === activeScene?.id}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/15 transition-all text-red-200 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/10"
            title={storage.webActiveSceneId === activeScene?.id ? "No se puede eliminar la escena visible en la web" : "Eliminar escena"}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Scenes list */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white/80 text-sm">Escenas</h4>
              <span className="text-xs text-white/40">{storage.scenes.length}</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {scenesForList.map((scene) => {
                const isActive = scene.id === storage.activeSceneId;
                const isWebActive = scene.id === storage.webActiveSceneId;
                return (
                  <button
                    key={scene.id}
                    onClick={() => selectScene(scene.id)}
                    className={`w-full text-left rounded-xl border transition-all overflow-hidden ${
                      isActive
                        ? "bg-blue-500/10 border-blue-500/30 text-white ring-1 ring-blue-500/30"
                        : isWebActive
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-100"
                          : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    {isWebActive && scene.backgroundUrl && (
                      <div
                        className="w-full aspect-video bg-black/40 bg-cover bg-center border-b border-amber-500/20"
                        style={{ backgroundImage: `url(${scene.backgroundUrl})` }}
                        title="Fondo actual de la web (Best Cars Ibérica)"
                      />
                    )}
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {isWebActive ? (
                          <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                        ) : (
                          <ImageIcon className="w-4 h-4 opacity-70" />
                        )}
                        <span className="text-sm font-medium">
                          {isWebActive ? "Escena principal — Best Cars Ibérica" : scene.name}
                        </span>
                      </div>
                      <div className="text-xs mt-1 flex items-center gap-1 flex-wrap">
                        {isWebActive && (
                          <span className="shrink-0 text-amber-400/90">Lo que se ve en la web · No se puede eliminar</span>
                        )}
                        {!isWebActive && (
                          <span className="text-white/35 truncate">
                            {scene.backgroundUrl ? scene.backgroundUrl : "Sin fondo"}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create new scene */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Nueva escena</h4>
            <input
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              placeholder="Nombre (p. ej. Garaje 2)"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <input
              value={newSceneBg}
              onChange={(e) => setNewSceneBg(e.target.value)}
              placeholder="URL del fondo (opcional)"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleCreateSceneClick}
              className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear escena desde cero
            </button>
          </div>
        </div>

        {/* Canvas + position selector */}
        <div className="col-span-6 space-y-4">
          {/* Positions */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white/80 text-sm">Posiciones</h4>
              <span className="text-xs text-white/40">ocupadas/vacías</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POSITION_ORDER.map((pos) => {
                const isActive = pos === storage.activePositionId;
                const isOccupied = Boolean(activeScene?.positions[pos]?.vehicleId);

                return (
                  <button
                    key={pos}
                    onClick={() => selectPosition(pos)}
                    className={`px-3 py-2 rounded-xl border text-sm transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-500/10 border-blue-500/30 text-white"
                        : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isOccupied ? "bg-emerald-400" : "bg-white/20"
                      }`}
                      title={isOccupied ? "Ocupada" : "Vacía"}
                    />
                    {POSITION_LABEL[pos]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Canvas */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            {storage.webActiveSceneId === activeScene?.id && (
              <div className="px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-100">
                  <strong>Escena visible en la web.</strong> El fondo que ves aquí es el garaje de Best Cars Ibérica que ven los usuarios en la página. Puedes editar posiciones y vehículos; esta escena no se puede eliminar.
                </p>
              </div>
            )}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-white/80 text-sm">Composición</h4>
                <p className="text-xs text-white/40">
                  Pega la URL de una imagen de escena con los coches ya dibujados y
                  marca sobre qué zona se puede hacer clic para cada vehículo.
                </p>
              </div>
              <button
                onClick={resetTransform}
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-xs flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Centrar
              </button>
            </div>

            <div
              className="relative w-full aspect-[16/9] bg-black"
              style={{
                backgroundImage: displayBackgroundUrl ? `url(${displayBackgroundUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={handleCanvasClick}
            >
              {!displayBackgroundUrl && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
              )}

              {/* Hotspot del vehículo seleccionado - mismo estilo que los botones sobre los coches en la web (dot + ring + label) */}
              {activeVehicle ? (
                <div
                  className="absolute left-1/2 top-1/2 select-none scene-editor-hotspot"
                  style={{
                    transform: `translate(-50%, -50%) translate(${draftSlot.transform.x}px, ${draftSlot.transform.y}px) rotate(${draftSlot.transform.rotation}deg) scale(${draftSlot.transform.scale})`,
                    cursor: "grab",
                  }}
                  onPointerDown={onVehiclePointerDown}
                  onPointerMove={onVehiclePointerMove}
                  onPointerUp={onVehiclePointerUp}
                >
                  <span className="scene-editor-hotspot-label">{activeVehicle.name}</span>
                  <span className="scene-editor-hotspot-dot" />
                  <span className="scene-editor-hotspot-ring" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white/70">No hay vehículo asignado a esta posición</p>
                    <p className="text-sm text-white/40 mt-1">
                      Selecciona un vehículo en el panel derecho y haz clic sobre la imagen para definir su punto clicable.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls + Preview */}
        <div className="col-span-3 space-y-4">
          {/* Scene background */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Fondo de la escena</h4>
            {storage.webActiveSceneId === activeScene?.id ? (
              <>
                <p className="text-xs text-amber-400/90 mb-2">
                  Escena principal (Best Cars Ibérica). El fondo es fijo y no se puede editar.
                </p>
                <input
                  value={draftBackgroundUrl}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-amber-500/20 text-white/50 cursor-not-allowed"
                />
              </>
            ) : (
              <>
            <input
              value={draftBackgroundUrl}
              onChange={(e) => setDraftBackgroundUrl(e.target.value)}
              placeholder="URL del fondo"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <div className="flex gap-2">
              <button
                onClick={saveBackground}
                disabled={!backgroundDirty}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-white/[0.03]"
              >
                <Save className="w-4 h-4" />
                Guardar escena
              </button>
              <button
                onClick={resetBackgroundDraft}
                disabled={!backgroundDirty}
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-white/[0.03]"
                title="Restablecer fondo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
              </>
            )}
          </div>

          {/* Vehicle picker */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Vehículo</h4>

            <select
              value={draftSlot.vehicleId ?? ""}
              onChange={(e) => setVehicleForSlot(e.target.value || null)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 focus:outline-none focus:border-blue-500/50"
            >
              <option value="">(Vacío)</option>
              {filteredVehiclesForPicker.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} - {v.year}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setVehicleForSlot(null)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm"
              >
                Vaciar
              </button>
              <button
                onClick={resetTransform}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm"
              >
                Reset transform
              </button>
            </div>
          </div>

          {/* Transform controls */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-4">
            <h4 className="text-white/80 text-sm">Transformación</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40">X</label>
                <input
                  type="number"
                  value={Math.round(draftSlot.transform.x)}
                  onChange={(e) =>
                    setDraftSlot((prev) => ({
                      ...prev,
                      transform: { ...prev.transform, x: Number(e.target.value) || 0 },
                      updatedAt: nowIso(),
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-white/40">Y</label>
                <input
                  type="number"
                  value={Math.round(draftSlot.transform.y)}
                  onChange={(e) =>
                    setDraftSlot((prev) => ({
                      ...prev,
                      transform: { ...prev.transform, y: Number(e.target.value) || 0 },
                      updatedAt: nowIso(),
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40">
                Escala ({Math.round(draftSlot.transform.scale * 100)}%)
              </label>
              <input
                type="range"
                min={30}
                max={200}
                value={Math.round(draftSlot.transform.scale * 100)}
                onChange={(e) =>
                  setDraftSlot((prev) => ({
                    ...prev,
                    transform: { ...prev.transform, scale: Number(e.target.value) / 100 },
                    updatedAt: nowIso(),
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-white/40">
                Rotación ({Math.round(draftSlot.transform.rotation)}°)
              </label>
              <input
                type="range"
                min={-180}
                max={180}
                value={Math.round(draftSlot.transform.rotation)}
                onChange={(e) =>
                  setDraftSlot((prev) => ({
                    ...prev,
                    transform: { ...prev.transform, rotation: Number(e.target.value) },
                    updatedAt: nowIso(),
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveSlot}
                disabled={!slotDirty}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-white/[0.03]"
              >
                <Save className="w-4 h-4" />
                Guardar posición
              </button>
              <button
                onClick={resetSlotDraft}
                disabled={!slotDirty}
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-white/[0.03]"
                title="Restablecer cambios no guardados"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Web preview */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Vista web (sincronizada)</h4>
            <input
              value={storage.previewUrl ?? ""}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="URL del preview (iframe)"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <div className="rounded-xl overflow-hidden border border-white/10">
              <iframe
                ref={iframeRef}
                src={storage.previewUrl}
                className="w-full aspect-[16/10] bg-black"
                title="Vista web sincronizada"
              />
            </div>
            <p className="text-xs text-white/40">
              Se envía el estado al iframe con postMessage (en vivo). La web puede pedir el estado
              con BESTCARS_SCENE_EDITOR_REQUEST_STATE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
