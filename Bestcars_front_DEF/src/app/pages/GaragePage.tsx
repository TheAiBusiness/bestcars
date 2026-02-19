import React from "react";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
// @ts-expect-error - Importación de imagen con espacios en el nombre
import garageImage from "../../assets/Ilustración_sin_título 103.jpg";
import logoImage from "../../assets/IMG_2007.PNG";
import { StockMenu } from "../components/StockMenu";
import { api, type Scene, type ScenePosition } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import { getImageUrl } from "../../utils/imageMap.js";
import "./GaragePage.css";

const MOBILE_START_POSITION = 50;

export default function GaragePage() {
  const [garageImageLoaded, setGarageImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [garageImageError, setGarageImageError] = useState(false);
  const [, setLogoImageError] = useState(false);
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(false);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getActiveScene().then((scene) => {
      if (scene?.backgroundUrl) setActiveScene(scene);
    }).catch(() => {});
    api.getAllVehicles().then(setVehicles).catch(() => {});
  }, []);

  useEffect(() => {
    if (pageRef.current) {
      const page = pageRef.current;
      const maxScroll = page.scrollWidth - page.clientWidth;
      const scrollLeft = (maxScroll * MOBILE_START_POSITION) / 100;
      page.scrollLeft = scrollLeft;
    }
  }, [garageImageLoaded, activeScene]);

  useEffect(() => {
    setIsStockMenuOpen(true);
  }, []);

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
                const imgSrc = vehicle.images?.[0] ? getImageUrl(vehicle.images[0]) : vehicle.images?.[0] ?? "";
                const t = slot.transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };
                return (
                  <div
                    key={posId}
                    className="absolute left-1/2 top-1/2 select-none"
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
              fetchPriority="high"
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
              fetchPriority="high"
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
      <StockMenu isOpen={isStockMenuOpen} onOpenChange={setIsStockMenuOpen} hideButton={true} disableClose={true} />
    </div>
  );
}
