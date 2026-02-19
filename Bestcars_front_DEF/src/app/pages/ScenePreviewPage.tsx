import React, { useEffect, useState, useCallback } from "react";
import { api, type Scene, type ScenePosition } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import { getImageUrl } from "../../utils/imageMap.js";

interface SceneState {
  scene: Scene | null;
  vehicles: Vehicle[];
}

export default function ScenePreviewPage() {
  const [state, setState] = useState<SceneState>({ scene: null, vehicles: [] });
  const [loading, setLoading] = useState(true);

  const renderScene = useCallback(async (scene: Scene | null) => {
    if (!scene) {
      setState((prev) => ({ ...prev, scene: null }));
      setLoading(false);
      return;
    }

    try {
      const vehicles = await api.getAllVehicles();
      const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
      setState({ scene, vehicles });
    } catch {
      setState({ scene, vehicles: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch from API on mount
  useEffect(() => {
    let cancelled = false;

    api
      .getActiveScene()
      .then((scene) => {
        if (!cancelled) renderScene(scene);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setState({ scene: null, vehicles: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [renderScene]);

  // Listen for postMessage from panel editor (live preview)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "BESTCARS_SCENE_EDITOR_STATE") return;

      const { scene } = data.payload ?? {};
      if (scene) {
        setLoading(false);
        renderScene(scene as Scene);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [renderScene]);

  // Tell parent we're ready (panel can send state)
  useEffect(() => {
    window.parent?.postMessage({ type: "BESTCARS_SCENE_EDITOR_REQUEST_STATE" }, "*");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { scene, vehicles } = state;
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  if (!scene || !scene.backgroundUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50">
        <p>No hay escena activa. Configura una en el panel.</p>
      </div>
    );
  }

  const positions = (scene.positions ?? {}) as Record<string, ScenePosition>;
  const positionIds = ["parking-1", "parking-2", "parking-3", "rampa", "parking-4"];

  return (
    <div
      className="relative w-full min-h-screen bg-black"
      style={{
        backgroundImage: `url(${scene.backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {positionIds.map((posId) => {
        const slot = positions[posId];
        if (!slot?.vehicleId) return null;

        const vehicle = vehicleMap.get(slot.vehicleId);
        if (!vehicle) return null;

        const imgSrc = vehicle.images?.[0]
          ? getImageUrl(vehicle.images[0])
          : vehicle.images?.[0] ?? "";
        const t = slot.transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };

        return (
          <div
            key={posId}
            className="absolute left-1/2 top-1/2 select-none pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${t.x}px, ${t.y}px) rotate(${t.rotation}deg) scale(${t.scale})`,
            }}
          >
            <img
              src={imgSrc}
              alt={vehicle.title}
              className="w-[min(360px,60vw)] h-auto rounded-xl border border-white/10 shadow-2xl"
            />
          </div>
        );
      })}
    </div>
  );
}
