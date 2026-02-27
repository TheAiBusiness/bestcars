/**
 * Editor de escenas con hotspots ilimitados.
 * Sin posiciones fijas (rampa, etc.): lista de hotspots add/move/delete.
 * Sincroniza con iframe de preview por postMessage.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Save, RotateCcw, Image as ImageIcon, Lock, MapPin } from "lucide-react";

import { Vehicle } from "../data/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLocalStorageState } from "../hooks/use-local-storage-state";
import { useSceneEditorApi, apiSceneToEditorScene } from "../../hooks/useSceneEditorApi";
import { createScene as apiCreateScene, getVehicleImageUrl } from "../../services/api";
import {
  type Hotspot,
  type Scene,
  type SceneEditorStorage,
  createEmptyScene,
  generateHotspotId,
  migrateSceneEditorStorage,
} from "../types/scene-editor";
import "./scene-editor-hotspot.css";

type SceneEditorSectionProps = {
  vehicles: Vehicle[];
  searchQuery?: string;
  apiMode?: boolean;
  isAuthenticated?: boolean;
};

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_PREVIEW_URL = "http://localhost:5173/scene-preview";
const SCENE_PRINCIPAL_IMAGE_URL = "/scene-principal-bestcars.png";
const DRAG_THRESHOLD_PX = 5;

export function SceneEditorSection({
  vehicles,
  searchQuery = "",
  apiMode = false,
  isAuthenticated = false,
}: SceneEditorSectionProps) {
  const initialStorage: SceneEditorStorage = useMemo(() => {
    const scene = createEmptyScene({
      name: "Escena 1",
      backgroundUrl: SCENE_PRINCIPAL_IMAGE_URL,
    });
    return {
      scenes: [scene],
      activeSceneId: scene.id,
      activeHotspotId: null,
      previewUrl: DEFAULT_PREVIEW_URL,
      webActiveSceneId: null,
    };
  }, []);

  const [storage, setStorage] = useLocalStorageState<SceneEditorStorage>(
    "bestcars_scene_editor_state",
    initialStorage,
    { migrate: (raw) => migrateSceneEditorStorage(raw, initialStorage) }
  );

  const { persistScene, deleteSceneApi, setActiveSceneApi, duplicateSceneApi } = useSceneEditorApi(
    apiMode,
    isAuthenticated,
    storage,
    setStorage
  );

  const scenes = Array.isArray(storage.scenes) ? storage.scenes : [];
  const activeScene = scenes.find((s) => s.id === storage.activeSceneId) ?? scenes[0];
  const activeHotspots = Array.isArray(activeScene?.hotspots) ? activeScene.hotspots : [];
  const webActiveScene = storage.webActiveSceneId
    ? scenes.find((s) => s.id === storage.webActiveSceneId) ?? null
    : null;

  const scenesForList = useMemo(() => {
    if (!webActiveScene) return scenes;
    const rest = scenes.filter((s) => s.id !== storage.webActiveSceneId);
    return [webActiveScene, ...rest];
  }, [scenes, storage.webActiveSceneId, webActiveScene]);

  const [addHotspotMode, setAddHotspotMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewConnected, setPreviewConnected] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    hotspotId: string;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (!activeScene) {
      const fallback = createEmptyScene({ name: "Escena 1", backgroundUrl: "" });
      setStorage((prev) => ({
        scenes: [fallback],
        activeSceneId: fallback.id,
        activeHotspotId: null,
        previewUrl: prev.previewUrl ?? DEFAULT_PREVIEW_URL,
        webActiveSceneId: prev.webActiveSceneId ?? null,
      }));
    }
  }, [activeScene, setStorage, storage.previewUrl, storage.webActiveSceneId]);

  const displayBackgroundUrl =
    activeScene?.backgroundUrl ||
    (webActiveScene?.backgroundUrl ?? "") ||
    (storage.webActiveSceneId === activeScene?.id ? SCENE_PRINCIPAL_IMAGE_URL : "");

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const selectedVehicle = useMemo(
    () => (selectedVehicleId ? vehicles.find((v) => v.id === selectedVehicleId) ?? null : null),
    [selectedVehicleId, vehicles]
  );

  const filteredVehiclesForPicker = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );
  }, [vehicles, searchQuery]);

  const updateSceneHotspots = useCallback(
    (updater: (prev: Hotspot[]) => Hotspot[]) => {
      if (!activeScene) return;
      const prevHotspots = Array.isArray(activeScene.hotspots) ? activeScene.hotspots : [];
      const next = updater(prevHotspots);
      const updated: Scene = {
        ...activeScene,
        hotspots: next,
        updatedAt: nowIso(),
      };
      setStorage((prev) => ({
        ...prev,
        scenes: prev.scenes.map((s) => (s.id === activeScene.id ? updated : s)),
      }));
      setIsDirty(true);
    },
    [activeScene, setStorage]
  );

  const selectScene = (sceneId: string) => {
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Descartar?")) return;
    setStorage((prev) => ({ ...prev, activeSceneId: sceneId, activeHotspotId: null }));
    setIsDirty(false);
  };

  const createScene = async (name: string, backgroundUrl: string) => {
    const sceneName = name.trim() || `Escena ${scenes.length + 1}`;
    const sceneBg = backgroundUrl.trim();
    if (apiMode && isAuthenticated) {
      try {
        const created = await apiCreateScene({
          name: sceneName,
          backgroundUrl: sceneBg,
          hotspots: [],
        });
        const editorScene = apiSceneToEditorScene(created);
        setStorage((prev) => ({
          ...prev,
          scenes: [...prev.scenes, editorScene],
          activeSceneId: editorScene.id,
          activeHotspotId: null,
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
      activeHotspotId: null,
    }));
  };

  const handleDuplicateScene = async () => {
    if (!activeScene) return;
    if (apiMode && isAuthenticated) {
      if (isDirty) {
        const ok = await persistScene(activeScene);
        if (!ok) {
          toast.error("No se pudo guardar la escena antes de duplicar.");
          return;
        }
        setIsDirty(false);
      }
      await duplicateSceneApi(activeScene.id);
      return;
    }
    // Modo local sin API: duplicación en memoria
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Descartar antes de duplicar?")) return;
    const copy: Scene = {
      ...activeScene,
      id: `scene_${Date.now()}`,
      name: `Copia de ${activeScene.name}`,
      hotspots: activeHotspots.map((h) => ({ ...h, id: generateHotspotId() })),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setStorage((prev) => ({
      ...prev,
      scenes: [...prev.scenes, copy],
      activeSceneId: copy.id,
      activeHotspotId: null,
    }));
  };

  const deleteActiveScene = () => {
    if (!activeScene) return;
    if (storage.webActiveSceneId && activeScene.id === storage.webActiveSceneId) {
      toast.error("No se puede eliminar la escena visible en la web.");
      return;
    }
    if (!window.confirm(`¿Eliminar la escena "${activeScene.name}"?`)) return;
    if (apiMode && isAuthenticated) {
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
          activeHotspotId: null,
        };
      }
      return {
        ...prev,
        scenes: nextScenes,
        activeSceneId: nextScenes[0].id,
        activeHotspotId: null,
      };
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!addHotspotMode) return;
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest(".scene-editor-hotspot")) return;
    if (!selectedVehicleId) {
      toast.error("Selecciona un coche primero");
      return;
    }
    const rect = (canvasRef.current ?? e.currentTarget).getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const newHotspot: Hotspot = {
      id: generateHotspotId(),
      vehicleId: selectedVehicleId,
      x,
      y,
      createdAt: nowIso(),
    };
    updateSceneHotspots((prev) => [...prev, newHotspot]);
    setStorage((prev) => ({ ...prev, activeHotspotId: newHotspot.id }));
  };

  const onHotspotPointerDown = (e: React.PointerEvent, h: Hotspot) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      hotspotId: h.id,
      startX: e.clientX,
      startY: e.clientY,
      baseX: h.x,
      baseY: h.y,
      moved: false,
    };
  };

  const onHotspotPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) dragRef.current.moved = true;
    updateSceneHotspots((prev) =>
      prev.map((p) =>
        p.id === dragRef.current!.hotspotId
          ? { ...p, x: dragRef.current!.baseX + dx, y: dragRef.current!.baseY + dy }
          : p
      )
    );
  };

  const onHotspotPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      if (!dragRef.current.moved) {
        setStorage((prev) => ({ ...prev, activeHotspotId: dragRef.current!.hotspotId }));
      }
      dragRef.current = null;
    }
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const onHotspotClick = (e: React.MouseEvent, h: Hotspot) => {
    e.stopPropagation();
    setStorage((prev) => ({ ...prev, activeHotspotId: h.id }));
  };

  const centerHotspot = (h: Hotspot) => {
    updateSceneHotspots((prev) =>
      prev.map((p) => (p.id === h.id ? { ...p, x: 0, y: 0 } : p))
    );
  };

  const removeHotspot = (h: Hotspot) => {
    if (!window.confirm(`¿Eliminar hotspot de este vehículo?`)) return;
    updateSceneHotspots((prev) => prev.filter((p) => p.id !== h.id));
    if (storage.activeHotspotId === h.id) {
      setStorage((prev) => ({ ...prev, activeHotspotId: null }));
    }
  };

  const changeHotspotVehicle = (h: Hotspot, vehicleId: string) => {
    updateSceneHotspots((prev) =>
      prev.map((p) => (p.id === h.id ? { ...p, vehicleId } : p))
    );
  };

  const handleSaveAndPublish = async () => {
    if (!activeScene) return;
    const ok = await persistScene(activeScene);
    setIsDirty(!ok);
    if (!ok) return;
    const finalSceneId = storage.activeSceneId;
    const activated = await setActiveSceneApi(finalSceneId);
    if (activated) {
      setStorage((prev) => ({ ...prev, webActiveSceneId: finalSceneId }));
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddHotspotMode(false);
      if (e.key === "Delete" || e.key === "Backspace") {
        if (storage.activeHotspotId && activeScene) {
          const h = activeHotspots.find((p) => p.id === storage.activeHotspotId);
          if (h && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
            e.preventDefault();
            removeHotspot(h);
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [storage.activeHotspotId, activeScene, activeHotspots]);

  const buildPreviewPayload = useCallback(() => {
    const sceneForPreview = activeScene
      ? {
          id: activeScene.id,
          name: activeScene.name,
          backgroundUrl: displayBackgroundUrl,
          hotspots: activeHotspots,
        }
      : null;
    const vehicleIds = new Set(activeHotspots.map((h) => h.vehicleId));
    const vehiclesForPreview = vehicles.filter((v) => vehicleIds.has(v.id));
    return {
      type: "BESTCARS_SCENE_EDITOR_STATE",
      payload: {
        activeSceneId: storage.activeSceneId,
        scene: sceneForPreview,
        vehicles: vehiclesForPreview,
      },
    };
  }, [activeScene, displayBackgroundUrl, storage.activeSceneId, vehicles]);

  const sendPreviewState = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(buildPreviewPayload(), "*");
    } catch {
      // ignore
    }
  }, [buildPreviewPayload]);

  useEffect(() => {
    sendPreviewState();
  }, [sendPreviewState, activeHotspots, activeScene?.backgroundUrl]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string };
      if (!data?.type) return;
      if (data.type === "BESTCARS_SCENE_EDITOR_REQUEST_STATE") {
        sendPreviewState();
        setPreviewConnected(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendPreviewState]);

  const [newSceneName, setNewSceneName] = useState("");
  const [newSceneBg, setNewSceneBg] = useState("");

  const isPotentiallyInvalidBackgroundUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    // Permitimos URLs http/https y paths absolutos (/imagen.png) o data URLs.
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("data:")
    ) {
      return false;
    }
    return true;
  };

  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  return (
    <div className="p-8 space-y-6">
      {/* Barra superior: estado + acciones */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-white/50">Escena activa</p>
          <h3 className="text-xl text-white/90">{activeScene?.name ?? "Sin escena"}</h3>
          <p className="text-sm text-white/40 flex items-center gap-2 flex-wrap">
            {isDirty ? (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300 border border-amber-500/20">
                Cambios sin guardar
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 border border-emerald-500/20">
                Guardado ✓
              </span>
            )}
            {previewConnected ? (
              <span className="text-emerald-400/80 text-xs">Preview conectado</span>
            ) : (
              <span className="text-white/40 text-xs">Preview no conectado</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {apiMode && isAuthenticated && activeScene && (
            <button
              onClick={() => {
                setActiveSceneApi(activeScene.id).then((ok) => {
                  if (ok) {
                    setStorage((prev) => ({ ...prev, webActiveSceneId: activeScene.id }));
                  }
                });
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-200 text-sm flex items-center gap-2"
              title="Mostrar esta escena en la web"
            >
              Activar en web
            </button>
          )}
          <button
            onClick={handleDuplicateScene}
            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center gap-2"
            title="Duplicar escena"
          >
            <Copy className="w-4 h-4" />
            Duplicar
          </button>
          <button
            onClick={deleteActiveScene}
            disabled={storage.webActiveSceneId === activeScene?.id}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-200 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={storage.webActiveSceneId === activeScene?.id ? "No se puede eliminar la escena visible en la web" : "Eliminar escena"}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Izquierda: lista de escenas + nueva + duplicar */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white/80 text-sm">Escenas</h4>
              <span className="text-xs text-white/40">{scenes.length}</span>
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
                        title="Fondo actual de la web"
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
                          {isWebActive ? "Escena principal" : scene.name}
                        </span>
                      </div>
                      <div className="text-xs mt-1 text-white/35">
                        {Array.isArray(scene.hotspots) ? scene.hotspots.length : 0} hotspot{(Array.isArray(scene.hotspots) ? scene.hotspots.length : 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Nueva escena</h4>
            <input
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              placeholder="Nombre (ej. Garaje 2)"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <input
              value={newSceneBg}
              onChange={(e) => setNewSceneBg(e.target.value)}
              placeholder="URL del fondo (opcional)"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={() => {
                createScene(newSceneName, newSceneBg);
                setNewSceneName("");
                setNewSceneBg("");
              }}
              className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva escena
            </button>
          </div>
        </div>

        {/* Centro: canvas + barra de herramientas */}
        <div className="col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            {storage.webActiveSceneId === activeScene?.id && (
              <div className="px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-100">
                  Escena visible en la web. No se puede eliminar.
                </p>
              </div>
            )}
            <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedVehicleId ?? ""}
                  onChange={(e) => setSelectedVehicleId(e.target.value || null)}
                  className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 text-sm focus:outline-none focus:border-blue-500/50 appearance-none pr-8"
                  title="Vehículo para nuevo hotspot"
                >
                  <option value="" className="bg-black text-white">(Seleccionar coche)</option>
                  {filteredVehiclesForPicker.map((v) => (
                    <option key={v.id} value={v.id} className="bg-black text-white">
                      {v.brand} {v.model} — {v.year}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setAddHotspotMode((b) => !b)}
                  className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-2 transition-all ${
                    addHotspotMode
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-200"
                      : "bg-white/[0.03] border-white/10 text-white/70 hover:border-white/20"
                  }`}
                  title="Activar para añadir hotspot con clic en el canvas"
                >
                  <MapPin className="w-4 h-4" />
                  Añadir hotspot
                </button>
                <button
                  onClick={handleSaveAndPublish}
                  className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all text-white/80 text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar y publicar
                </button>
              </div>
            </div>
            <p className="px-4 pb-2 text-xs text-white/40" title="Flujo recomendado">
              1) Selecciona coche 2) Activa &quot;Añadir hotspot&quot; 3) Clic en escena 4) Arrastra para ajustar
            </p>
            <div
              ref={canvasRef}
              className="relative w-full aspect-[16/9] bg-black cursor-crosshair"
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
              {activeHotspots.map((h) => {
                const vehicle = vehicleMap.get(h.vehicleId);
                const isSelected = h.id === storage.activeHotspotId;
                return (
                  <div
                    key={h.id}
                    className={`absolute left-1/2 top-1/2 select-none scene-editor-hotspot ${isSelected ? "scene-editor-hotspot--selected" : ""}`}
                    style={{
                      transform: `translate(-50%, -50%) translate(${h.x}px, ${h.y}px)`,
                      cursor: "grab",
                    }}
                    onPointerDown={(e) => onHotspotPointerDown(e, h)}
                    onPointerMove={onHotspotPointerMove}
                    onPointerUp={onHotspotPointerUp}
                    onClick={(e) => onHotspotClick(e, h)}
                  >
                    <span className="scene-editor-hotspot-hitarea" aria-hidden="true" />
                    <span className="scene-editor-hotspot-label">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : h.vehicleId}
                    </span>
                    <span className="scene-editor-hotspot-dot" />
                    <span className="scene-editor-hotspot-ring" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Derecha: lista de hotspots + fondo + preview */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Hotspots</h4>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {activeHotspots.map((h, idx) => {
                const vehicle = vehicleMap.get(h.vehicleId);
                const isSelected = h.id === storage.activeHotspotId;
                return (
                  <div
                    key={h.id}
                    className={`rounded-xl border p-2 transition-all ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/50 shrink-0">#{idx + 1}</span>
                      {vehicle?.images?.[0] ? (
                        <ImageWithFallback
                          src={typeof vehicle.images[0] === "string" && !vehicle.images[0].startsWith("http") && !vehicle.images[0].startsWith("data:")
                            ? getVehicleImageUrl(vehicle.images[0])
                            : vehicle.images[0]}
                          alt=""
                          className="w-10 h-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/10 shrink-0" />
                      )}
                      <span className="text-sm text-white/80 truncate flex-1">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : h.vehicleId}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <select
                        value={h.vehicleId}
                        onChange={(e) => changeHotspotVehicle(h, e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-white/70 text-xs focus:outline-none focus:border-blue-500/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id} className="bg-black text-white">
                            {v.brand} {v.model}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => centerHotspot(h)}
                        className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white/70"
                        title="Centrar"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHotspot(h)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {activeHotspots.length === 0 && (
              <p className="text-xs text-white/40">Añade hotspots desde el canvas (modo Añadir hotspot + clic).</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Fondo de la escena</h4>
            <input
              value={activeScene?.backgroundUrl ?? ""}
              onChange={(e) => {
                if (!activeScene) return;
                const url = e.target.value;
                const updated: Scene = {
                  ...activeScene,
                  backgroundUrl: url,
                  updatedAt: nowIso(),
                };
                setStorage((prev) => ({
                  ...prev,
                  scenes: prev.scenes.map((s) => (s.id === activeScene.id ? updated : s)),
                }));
                setIsDirty(true);
                if (isPotentiallyInvalidBackgroundUrl(url)) {
                  toast.warning("Para producción usa una URL http(s) o un path absoluto (ej. /mi-fondo.png).");
                }
              }}
              placeholder="URL del fondo"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm space-y-3">
            <h4 className="text-white/80 text-sm">Vista previa (iframe)</h4>
            <input
              value={storage.previewUrl ?? ""}
              onChange={(e) => setStorage((prev) => ({ ...prev, previewUrl: e.target.value }))}
              placeholder="URL del preview"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <div className="rounded-xl overflow-hidden border border-white/10">
              <iframe
                ref={iframeRef}
                src={storage.previewUrl}
                className="w-full aspect-[16/10] bg-black"
                title="Vista previa"
              />
            </div>
            <button
              type="button"
              onClick={sendPreviewState}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] text-white/70 text-sm"
            >
              Reenviar al preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
