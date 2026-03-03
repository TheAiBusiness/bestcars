import React from "react";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
// @ts-expect-error - Importación de imagen con espacios en el nombre
import garageImage from "../../assets/Ilustración_sin_título 103.jpg";
import logoImage from "../../assets/IMG_2007.PNG";
import { StockMenu } from "../components/StockMenu";
import SceneHotspots from "../components/SceneHotspots";
import NextSceneButton from "../components/NextSceneButton";
import { api, getVehicleImageUrl, type Scene, sceneHotspots } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import "./GaragePage.css";

const MOBILE_START_POSITION = 50;

export default function GaragePage() {
  const [garageImageLoaded, setGarageImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [garageImageError, setGarageImageError] = useState(false);
  const [, setLogoImageError] = useState(false);
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(true);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const loadScenesData = () => {
    setDataLoading(true);
    setDataError(false);
    Promise.all([api.getScenes(), api.getAllVehicles()])
      .then(([sceneList, vList]) => {
        const list = Array.isArray(sceneList) ? sceneList : [];
        setScenes(list);
        setVehicles(Array.isArray(vList) ? vList : []);
      })
      .catch(() => setDataError(true))
      .finally(() => setDataLoading(false));
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

  // El garaje siempre muestra la primera escena (la principal) con sus hotspots.
  const activeScene: Scene | null = scenes[0] ?? null;

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

  const garageBackground = garageImage;
  const showScene = !!activeScene;

  useEffect(() => {
    setGarageImageLoaded(false);
    const img = new Image();
    img.onload = () => setGarageImageLoaded(true);
    img.onerror = () => {
      setGarageImageError(true);
      setGarageImageLoaded(true);
    };
    img.src = garageImage;
    return () => {
      img.onload = null;
      img.onerror = null;
      img.src = "";
    };
  }, []);

  const showLoader = dataLoading || (!garageImageLoaded && !garageImageError);

  return (
    <div className="garage-page" ref={pageRef}>
      <Helmet>
        <title>Nuestro Garaje — Best Cars Ibérica</title>
        <meta name="description" content="Explora todos los vehículos disponibles en Best Cars Ibérica. Coches de lujo seminuevos y nuevos en Ibiza." />
      </Helmet>
      <h1
        className="fixed top-6 left-1/2 -translate-x-1/2 z-40 text-white text-sm md:text-base font-medium tracking-wide pointer-events-none text-center"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
      >
        Nuestro Garaje
      </h1>
      <div className="image-wrapper">
        {showLoader && (
          <div className="image-loader-overlay">
            <div className="image-loader-content">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" aria-hidden />
              <p className="text-white/70 text-sm">
                {dataLoading ? "Cargando escena y stock…" : "Cargando imagen…"}
              </p>
            </div>
          </div>
        )}
        {dataError && !showLoader && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/60 text-white/80 text-sm text-center max-w-[90vw]">
            No se pudo conectar. Comprueba el backend y pulsa &quot;Actualizar escena&quot;.
          </div>
        )}
        <div
          className={`garage-image ${garageImageLoaded ? "loaded" : ""}`}
          style={{
            backgroundImage: `url(${garageBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
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
        className="fixed top-20 right-6 px-4 py-2 border border-white/60 text-white/90 bg-transparent rounded-sm transition-all duration-200 hover:bg-white/10 text-sm z-50"
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
      <StockMenu isOpen={isStockMenuOpen} onOpenChange={setIsStockMenuOpen} hideButton={true} disableClose={false} instagramCorner="bottom-right" />
      {scenes.length >= 2 && activeScene && (
        <NextSceneButton
          sceneIndex={Math.max(0, scenes.findIndex((s) => s.id === activeScene.id))}
          totalScenes={scenes.length}
          isStockMenuOpen={isStockMenuOpen}
        />
      )}
    </div>
  );
}
