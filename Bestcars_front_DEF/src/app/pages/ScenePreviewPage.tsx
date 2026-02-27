import React, { useEffect, useState, useCallback } from "react";
import { api, type Scene, sceneHotspots } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import SceneHotspots from "../components/SceneHotspots";
// @ts-expect-error - Importación de imagen con espacios en el nombre (mismo fondo que Garage)
import garageImage from "../../assets/Ilustración_sin_título 103.jpg";

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

      const { scene, vehicles: payloadVehicles } = data.payload ?? {};
      if (scene) {
        setLoading(false);
        if (Array.isArray(payloadVehicles) && payloadVehicles.length > 0) {
          setState({ scene: scene as Scene, vehicles: payloadVehicles as Vehicle[] });
        } else {
          renderScene(scene as Scene);
        }
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
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const hotspots = sceneHotspots(scene);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  const background =
    scene?.backgroundUrl && scene.backgroundUrl.trim().length > 0
      ? scene.backgroundUrl
      : garageImage;

  if (!scene) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50">
        <p>No hay escena activa. Configura una en el panel.</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-screen bg-black"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <SceneHotspots hotspots={safeHotspots} vehicles={safeVehicles} />
    </div>
  );
}
