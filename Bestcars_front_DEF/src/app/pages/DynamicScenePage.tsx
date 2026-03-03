import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api, type Scene, sceneHotspots } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import SceneHotspots from "../components/SceneHotspots";
import NextSceneButton from "../components/NextSceneButton";
// @ts-expect-error - Imagen con espacios en el nombre (fallback de fondo)
import fallbackImage from "../../assets/Ilustración_sin_título 103.jpg";
import "./DynamicScenePage.css";

export default function DynamicScenePage() {
  const [searchParams] = useSearchParams();
  const indexParam = searchParams.get("index");
  const navigate = useNavigate();
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentIndex = indexParam !== null ? Math.max(0, parseInt(indexParam, 10) || 0) : 0;

  const loadSceneData = () => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([api.getScenes(), api.getAllVehicles()])
      .then(([list, vList]) => {
        if (cancelled) return;
        const sceneList = Array.isArray(list) ? (list as Scene[]) : [];
        setScenes(sceneList);
        setVehicles(Array.isArray(vList) ? vList : []);

        const byIndex =
          indexParam !== null && indexParam !== ""
            ? Math.max(0, parseInt(indexParam, 10) || 0)
            : null;

        let chosen: Scene | null = null;
        if (byIndex !== null && sceneList[byIndex]) {
          chosen = sceneList[byIndex];
        } else {
          chosen = sceneList[0] ?? null;
        }
        setActiveScene(chosen);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    const cancel = loadSceneData();
    return cancel;
  }, [indexParam]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadSceneData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [indexParam]);

  const goToScene = useCallback((idx: number) => {
    if (idx < 0 || idx >= scenes.length) {
      navigate("/garage");
    } else {
      navigate(`/escena?index=${idx}`);
    }
  }, [scenes.length, navigate]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchRef.current.x;
    const dy = touch.clientY - touchRef.current.y;
    const dt = Date.now() - touchRef.current.t;
    touchRef.current = null;

    const SWIPE_MIN = 60;
    const SWIPE_MAX_TIME = 400;
    if (dt > SWIPE_MAX_TIME || Math.abs(dy) > Math.abs(dx)) return;

    if (dx < -SWIPE_MIN) {
      const next = (currentIndex + 1) % scenes.length;
      goToScene(next === 0 ? -1 : next);
    } else if (dx > SWIPE_MIN) {
      const prev = currentIndex - 1;
      goToScene(prev < 0 ? -1 : prev);
    }
  }, [currentIndex, scenes.length, goToScene]);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const hotspots = sceneHotspots(activeScene);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  const background =
    activeScene?.backgroundUrl?.trim()
      ? activeScene.backgroundUrl
      : fallbackImage;

  if (loading) {
    return (
      <div className="dynamic-scene-page dynamic-scene-page--loading">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !activeScene) {
    return (
      <div className="dynamic-scene-page dynamic-scene-page--empty">
        <p className="text-white/60">
          {error ? "Error al cargar la escena." : "No hay escena disponible."}
        </p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 border border-white/30 text-white rounded-sm hover:bg-white/10 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div
      className="dynamic-scene-page"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="dynamic-scene-page__canvas"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <SceneHotspots hotspots={safeHotspots} vehicles={safeVehicles} />
      </div>
      <Link
        to="/garage"
        className="dynamic-scene-page__home-link"
        aria-label="Volver al garaje"
      >
        Volver al garaje
      </Link>
      {scenes.length >= 2 && (
        <NextSceneButton
          sceneIndex={currentIndex}
          totalScenes={scenes.length}
        />
      )}
    </div>
  );
}
