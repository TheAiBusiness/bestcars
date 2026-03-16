import React, { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api, getSceneBackgroundUrl, getScenesForExperiencia, type Scene, sceneHotspots } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import SceneHotspots from "../components/SceneHotspots";
import NextSceneButton from "../components/NextSceneButton";
import { BreadcrumbJsonLd } from "../components/BreadcrumbJsonLd";
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
  const [sceneViewKey, setSceneViewKey] = useState(0);

  const currentIndex = indexParam !== null ? Math.max(0, parseInt(indexParam, 10) || 0) : 0;

  // Cada vez que cambia la escena (incl. volver a la principal), nueva key → remontaje y src distinto → repintado
  useEffect(() => {
    setSceneViewKey((k) => k + 1);
  }, [currentIndex]);

  const loadSceneData = useCallback((index: string | null) => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([api.getScenes(), api.getActiveScene(), api.getAllVehicles()])
      .then(([list, activeScene, vList]) => {
        if (cancelled) return;
        const rawList = Array.isArray(list) ? (list as Scene[]) : [];
        const effectivePrincipal = activeScene ?? rawList[0] ?? null;
        const sceneList = getScenesForExperiencia(rawList, effectivePrincipal?.id);
        setScenes(sceneList);
        setVehicles(Array.isArray(vList) ? vList : []);

        const byIndex =
          index !== null && index !== ""
            ? Math.max(0, parseInt(index, 10) || 0)
            : null;

        let chosen: Scene | null = null;
        if (byIndex !== null && sceneList[byIndex]) {
          chosen = sceneList[byIndex];
        } else if (sceneList.length > 0) {
          chosen = sceneList[0];
        }
        if (chosen && !chosen.backgroundUrl?.trim()) chosen = null;
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
  }, []);

  useEffect(() => {
    const cancel = loadSceneData(indexParam);
    return cancel;
  }, [indexParam, loadSceneData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadSceneData(indexParam);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [indexParam, loadSceneData]);

  const goToScene = useCallback((idx: number) => {
    if (idx < 0 || idx >= scenes.length) {
      navigate("/");
    } else {
      navigate(`/experiencia?index=${idx}`);
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
      if (currentIndex === scenes.length - 1) {
        navigate("/");
      } else {
        goToScene(currentIndex + 1);
      }
    } else if (dx > SWIPE_MIN) {
      if (currentIndex === 0) {
        navigate("/");
      } else {
        goToScene(currentIndex - 1);
      }
    }
  }, [currentIndex, scenes.length, goToScene, navigate]);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const hotspots = sceneHotspots(activeScene);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  const background =
    activeScene?.backgroundUrl?.trim()
      ? activeScene.backgroundUrl
      : fallbackImage;
  const imgSrc =
    activeScene?.backgroundUrl?.trim()
      ? getSceneBackgroundUrl(activeScene.backgroundUrl)
      : fallbackImage;
  const imgSrcWithKey = `${imgSrc}${imgSrc.includes("?") ? "&" : "?"}_v=${sceneViewKey}`;

  if (loading) {
    return (
      <div className="dynamic-scene-page dynamic-scene-page--loading">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !activeScene || !activeScene.backgroundUrl?.trim()) {
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

  const BASE_URL = "https://bestcarsiberica.com";

  return (
    <div
      className="dynamic-scene-page"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${BASE_URL}/` },
          { name: "Experiencia", url: `${BASE_URL}/experiencia` },
        ]}
      />
      <Helmet>
        <link rel="canonical" href={`${BASE_URL}/experiencia`} />
        <title>Showroom virtual 360° — Coches de lujo Madrid | Best Cars Ibérica</title>
        <meta name="description" content="Vive la experiencia 360° de nuestros vehículos premium en Madrid. Audi, BMW, Porsche. Recorre nuestro showroom virtual." />
        <meta property="og:title" content="Showroom virtual 360° — Coches de lujo Madrid | Best Cars Ibérica" />
        <meta property="og:description" content="Vive la experiencia 360° de nuestros vehículos premium en Madrid. Audi, BMW, Porsche. Recorre nuestro showroom virtual." />
        <meta property="og:image" content={background.startsWith("http") ? background : new URL(fallbackImage, BASE_URL).href} />
        <meta property="og:url" content={`${BASE_URL}/experiencia`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Showroom virtual 360° — Coches de lujo Madrid | Best Cars Ibérica" />
        <meta name="twitter:description" content="Vive la experiencia 360° de nuestros vehículos premium en Madrid. Audi, BMW, Porsche. Recorre nuestro showroom virtual." />
        <meta name="twitter:image" content={background.startsWith("http") ? background : new URL(fallbackImage, BASE_URL).href} />
      </Helmet>
      <h1
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 text-white text-sm md:text-base font-medium tracking-wide pointer-events-none text-center"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
      >
        Experiencia Visual
      </h1>
      <div key={`${activeScene.id}-${sceneViewKey}`} className="dynamic-scene-page__canvas">
        <img
          key={`${activeScene.id}-${sceneViewKey}`}
          src={imgSrcWithKey}
          alt=""
          className="dynamic-scene-page__canvas-img"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const el = e.currentTarget;
            if (!el.src.includes(fallbackImage)) {
              el.src = fallbackImage;
            }
          }}
        />
        <SceneHotspots key={`hotspots-${activeScene.id}`} hotspots={safeHotspots} vehicles={safeVehicles} />
      </div>
      <Link
        to="/"
        className="dynamic-scene-page__home-link"
        aria-label="Volver a inicio"
      >
        Volver a inicio
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
