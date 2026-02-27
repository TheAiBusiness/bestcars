import React from "react";
import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
// @ts-expect-error - Importación de imagen con espacios en el nombre
import garageImage from "../../assets/Ilustración_sin_título 103.jpg";
import logoImage from "../../assets/IMG_2007.PNG";
import { StockMenu } from "../components/StockMenu";
import { api, getVehicleImageUrl, type Scene, type ScenePosition } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import "./GaragePage.css";
import "./GaragePageSceneNav.css";

const MOBILE_START_POSITION = 50;

export default function GaragePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sceneParam = searchParams.get("scene");
  const sceneIndexFromUrl = sceneParam !== null ? Math.max(0, parseInt(sceneParam, 10) || 0) : null;

  const [garageImageLoaded, setGarageImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [garageImageError, setGarageImageError] = useState(false);
  const [, setLogoImageError] = useState(false);
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(() => sceneIndexFromUrl === null || sceneIndexFromUrl === 0);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([api.getScenes(), api.getActiveScene(), api.getAllVehicles()])
      .then(([sceneList, active, vList]) => {
        const list = Array.isArray(sceneList) ? sceneList : [];
        if (list.length === 0 && active?.backgroundUrl) {
          setScenes([active]);
          setActiveSceneId(active.id);
        } else {
          setScenes(list);
          if (active?.id) setActiveSceneId(active.id);
        }
        setVehicles(vList);
      })
      .catch(() => {});
  }, []);

  // Sin "scene" en la URL (p. ej. al pulsar "Entrar al garaje") siempre mostrar escena 0, no la escena activa del backend.
  const currentSceneIndex = sceneIndexFromUrl !== null
    ? Math.min(sceneIndexFromUrl, Math.max(0, scenes.length - 1))
    : 0;
  const activeScene = scenes[currentSceneIndex] && scenes[currentSceneIndex].backgroundUrl
    ? scenes[currentSceneIndex]
    : scenes[0]?.backgroundUrl
      ? scenes[0]
      : null;

  const goToScene = (index: number) => {
    const next = Math.max(0, Math.min(index, scenes.length - 1));
    setSearchParams(next === 0 ? {} : { scene: String(next) });
  };

  useEffect(() => {
    if (pageRef.current) {
      const page = pageRef.current;
      const maxScroll = page.scrollWidth - page.clientWidth;
      const scrollLeft = (maxScroll * MOBILE_START_POSITION) / 100;
      page.scrollLeft = scrollLeft;
    }
  }, [garageImageLoaded, activeScene]);

  // Solo abrir el listado por defecto en escena 1; en escenas 2+ empezar cerrado. Al cambiar de escena no dejar el modal "pegado".
  useEffect(() => {
    if (scenes.length === 0) return;
    setIsStockMenuOpen(currentSceneIndex === 0);
  }, [scenes.length, currentSceneIndex]);

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const positions = (activeScene?.positions ?? {}) as Record<string, ScenePosition>;
  const positionIds = ["parking-1", "parking-2", "parking-3", "rampa", "parking-4"];

  const showScene = activeScene?.backgroundUrl && vehicles.length > 0;

  useEffect(() => {
    if (showScene) setGarageImageLoaded(true);
  }, [showScene]);

  return (
    <div className="garage-page" ref={pageRef}>
      <div className="image-wrapper">
        {showScene ? (
          <>
            <div
              className="garage-image loaded"
              style={{
                backgroundImage: `url(${activeScene!.backgroundUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
                width: "100%",
                position: "relative",
              }}
            >
              {positionIds.map((posId) => {
                const slot = positions[posId];
                if (!slot?.vehicleId) return null;
                const vehicle = vehicleMap.get(slot.vehicleId);
                if (!vehicle) return null;
                const t = slot.transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };
                return (
                  <Link
                    key={posId}
                    to={`/vehicle/${vehicle.id}`}
                    className="absolute left-1/2 top-1/2 select-none"
                    style={{
                      transform: `translate(-50%, -50%) translate(${t.x}px, ${t.y}px)`,
                    }}
                    aria-label={vehicle.title}
                  >
                    {/* Área clicable transparente sobre el coche ya dibujado en la escena */}
                    <div className="w-[min(260px,45vw)] h-[min(140px,30vw)] cursor-pointer border-2 border-transparent hover:border-white/40 rounded-xl transition-colors duration-150" />
                  </Link>
                );
              })}
            </div>
            <img
              src={activeScene!.backgroundUrl}
              alt=""
              className="hidden"
              onLoad={() => setGarageImageLoaded(true)}
            />
          </>
        ) : (
          <>
            {!garageImageLoaded && !garageImageError && (
              <div className="image-loader-overlay">
                <div className="image-loader-content">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                  <p className="text-white/70 text-sm">Cargando imágenes...</p>
                </div>
              </div>
            )}
            <img
              src={garageImage}
              alt="Garage with luxury cars"
              className={`garage-image ${garageImageLoaded ? "loaded" : ""}`}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onLoad={() => setGarageImageLoaded(true)}
              onError={() => {
                setGarageImageError(true);
                setGarageImageLoaded(true);
              }}
            />
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
          </>
        )}
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
      {/* Navigate between scenes - same style as Home "Entrar al garaje" / "Siguiente escena" */}
      {scenes.length > 1 && (
        <div className="garage-scene-nav" role="navigation" aria-label="Navegación entre escenas">
          <button
            type="button"
            className="garage-scene-nav-btn"
            onClick={() => goToScene(currentSceneIndex - 1)}
            disabled={currentSceneIndex <= 0}
            aria-label="Escena anterior"
          >
            <span className="garage-scene-nav-icon">
              <ChevronLeft className="garage-scene-nav-svg" strokeWidth={2.5} />
            </span>
            <span className="garage-scene-nav-text">Escena anterior</span>
          </button>
          <button
            type="button"
            className="garage-scene-nav-btn"
            onClick={() => goToScene(currentSceneIndex + 1)}
            disabled={currentSceneIndex >= scenes.length - 1}
            aria-label="Siguiente escena"
          >
            <span className="garage-scene-nav-icon">
              <ChevronRight className="garage-scene-nav-svg" strokeWidth={2.5} />
            </span>
            <span className="garage-scene-nav-text">Siguiente escena</span>
          </button>
        </div>
      )}
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
