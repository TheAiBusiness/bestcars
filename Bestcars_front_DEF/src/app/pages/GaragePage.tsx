import React from "react";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
// @ts-expect-error - Importación de imagen con espacios en el nombre
import garageImage from "../../assets/Ilustración_sin_título 103.jpg";
import logoImage from "../../assets/IMG_2007.PNG";
import { StockMenu } from "../components/StockMenu";
import SceneHotspots from "../components/SceneHotspots";
import { api, getVehicleImageUrl, type Scene, sceneHotspots } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import "./GaragePage.css";

const MOBILE_START_POSITION = 50;

export default function GaragePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sceneParam = searchParams.get("scene");
  const sceneIndexFromUrl = sceneParam !== null ? Math.max(0, parseInt(sceneParam, 10) || 0) : null;

  const [garageImageLoaded, setGarageImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [garageImageError, setGarageImageError] = useState(false);
  const [, setLogoImageError] = useState(false);
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(true);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneFromApi, setActiveSceneFromApi] = useState<Scene | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  const loadScenesData = () => {
    Promise.all([api.getScenes(), api.getActiveScene(), api.getAllVehicles()])
      .then(([sceneList, active, vList]) => {
        const list = Array.isArray(sceneList) ? sceneList : [];
        setScenes(list.length === 0 && active ? [active] : list);
        setActiveSceneFromApi(active ?? null);
        setVehicles(Array.isArray(vList) ? vList : []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadScenesData();
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadScenesData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Escena a mostrar:
  // - Sin ?scene= → escena activa del API (GET /api/scenes/active); si no hay, fallback a scenes[0].
  // - Con ?scene=N → escena por índice, con fallback a activa o scenes[0].
  const activeScene: Scene | null =
    sceneIndexFromUrl === null
      ? (activeSceneFromApi ?? scenes[0] ?? null)
      : (scenes[Math.min(sceneIndexFromUrl, Math.max(0, scenes.length - 1))] ?? activeSceneFromApi ?? scenes[0] ?? null);

  useEffect(() => {
    if (pageRef.current) {
      const page = pageRef.current;
      const maxScroll = page.scrollWidth - page.clientWidth;
      const scrollLeft = (maxScroll * MOBILE_START_POSITION) / 100;
      page.scrollLeft = scrollLeft;
    }
  }, [garageImageLoaded, activeScene]);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const vehicleMap = new Map(safeVehicles.map((v) => [v.id, v]));
  const hotspots = sceneHotspots(activeScene);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  // Fondo: scene.backgroundUrl si existe; si no, ilustración local.
  const garageBackground =
    activeScene?.backgroundUrl?.trim()
      ? activeScene.backgroundUrl
      : garageImage;
  const showScene = !!activeScene;

  useEffect(() => {
    if (showScene || activeScene) setGarageImageLoaded(true);
  }, [showScene, activeScene]);

  return (
    <div className="garage-page" ref={pageRef}>
      <div className="image-wrapper">
        {!garageImageLoaded && !garageImageError && (
          <div className="image-loader-overlay">
            <div className="image-loader-content">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-white/70 text-sm">Cargando imágenes...</p>
            </div>
          </div>
        )}
        <div
          className={`garage-image ${garageImageLoaded ? "loaded" : ""}`}
          style={{
            backgroundImage: `url(${garageBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            width: "100%",
            position: "relative",
          }}
        >
          {showScene && (
            <SceneHotspots hotspots={safeHotspots} vehicles={safeVehicles} />
          )}
          {!activeScene && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
              <p className="text-white/80 text-sm px-4 text-center">
                No hay escena publicada. Publica una desde el panel.
              </p>
            </div>
          )}
        </div>
        <img
          src={logoImage}
          alt="BEST CARS IBERICA Logo"
          className={`garage-logo ${logoImageLoaded ? "loaded" : ""}`}
          loading="eager"
          fetchpriority="high"
          decoding="async"
          onLoad={() => setLogoImageLoaded(true)}
          onError={() => {
            setLogoImageError(true);
            setLogoImageLoaded(true);
          }}
        />
      </div>
      {/* Home Button - same style and position as Nuestro Stock button */}
      <Link
        to="/"
        className="fixed bottom-6 md:top-6 md:bottom-auto left-6 px-6 py-3 border border-white text-white bg-transparent rounded-sm transition-all duration-200 hover:bg-white/10 z-50"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          fontSize: '15px',
          fontWeight: 500,
          letterSpacing: '0.3px',
          textDecoration: 'none',
        }}
      >
        Volver al Inicio
      </Link>
      {/* Actualizar escena: refetch para ver cambios del panel (temporal) */}
      <button
        type="button"
        onClick={() => loadScenesData()}
        className="fixed top-14 right-6 px-4 py-2 border border-white/60 text-white/90 bg-transparent rounded-sm transition-all duration-200 hover:bg-white/10 text-sm z-50"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
        aria-label="Actualizar escena"
      >
        Actualizar escena
      </button>
      {!isStockMenuOpen && (
        <button
          type="button"
          onClick={() => setIsStockMenuOpen(true)}
          className="fixed top-6 right-6 px-6 py-3 border border-white text-white bg-transparent rounded-sm transition-all duration-200 hover:bg-white/10 z-50"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 500,
            letterSpacing: '0.3px',
          }}
        >
          Nuestro Stock
        </button>
      )}
      <StockMenu isOpen={isStockMenuOpen} onOpenChange={setIsStockMenuOpen} hideButton={true} disableClose={false} />
    </div>
  );
}
