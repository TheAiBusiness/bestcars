import React from "react";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import houseImage from "../../assets/Bestcars-home.png";
import CarHotspots from "../components/CarHotspots";
import GarageArrow from "../components/GarageArrow";
import { NextSceneButton } from "../components/NextSceneButton";
import { StockMenu } from "../components/StockMenu";
import { TermsAndConditions } from "../components/TermsAndConditions";
import { api, sceneHotspots, type Scene } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import "./HomePage.css";

// ========== ADJUST MOBILE START POSITION ==========
// Percentage of image to show initially on mobile (0-100)
// 0 = left edge, 50 = center, 100 = right edge
const MOBILE_START_POSITION = 33;
// ==================================================

export function HomePage() {
  const [houseImageLoaded, setHouseImageLoaded] = useState(false);
  const [houseImageError, setHouseImageError] = useState(false);
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [scenesCount, setScenesCount] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [hotspots, setHotspots] = useState<ReturnType<typeof sceneHotspots>>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getScenes(), api.getActiveScene(), api.getAllVehicles()])
      .then(([list, active, vList]) => {
        if (cancelled) return;
        const scenes = Array.isArray(list) ? (list as Scene[]) : [];
        setScenesCount(scenes.length);
        const vehiclesSafe = Array.isArray(vList) ? vList : [];
        setVehicles(vehiclesSafe);
        if (scenes.length === 0 || !active?.id) {
          setHotspots([]);
          setActiveSceneIndex(0);
          return;
        }
        const idx = scenes.findIndex((s) => s.id === active.id);
        const index = idx >= 0 ? idx : 0;
        setActiveSceneIndex(index);
        const h = sceneHotspots(active as Scene);
        setHotspots(Array.isArray(h) ? h : []);
      })
      .catch(() => {
        if (!cancelled) {
          setHotspots([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allImagesLoaded = houseImageLoaded;
  const hasError = houseImageError;

  // Set initial viewport position on mobile
  useEffect(() => {
    if (pageRef.current) {
      const page = pageRef.current;
      // Calculate scroll position based on percentage
      const maxScroll = page.scrollWidth - page.clientWidth;
      const scrollLeft = (maxScroll * MOBILE_START_POSITION) / 100;
      page.scrollLeft = scrollLeft;
    }
  }, [allImagesLoaded]);

  return (
    <div className="home-page" ref={pageRef}>
      <div className="image-wrapper">
        {/* Loading overlay */}
        {!allImagesLoaded && !hasError && (
          <div className="image-loader-overlay">
            <div className="image-loader-content">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-white/70 text-sm">Cargando imágenes...</p>
            </div>
          </div>
        )}

        <img 
          src={houseImage} 
          alt="Luxurious modern house with architectural lighting" 
          className={`home-image ${allImagesLoaded ? 'loaded' : ''}`}
          loading="eager"
          fetchpriority="high"
          decoding="async"
          onLoad={() => setHouseImageLoaded(true)}
          onError={() => {
            setHouseImageError(true);
            setHouseImageLoaded(true);
          }}
        />
        {allImagesLoaded && (
          <>
            <CarHotspots hotspots={hotspots} vehicles={vehicles} />
            <GarageArrow isMenuOpen={isStockMenuOpen} isTermsOpen={isTermsOpen} />
          </>
        )}
      </div>
      <StockMenu isOpen={isStockMenuOpen} onOpenChange={setIsStockMenuOpen} />
      {allImagesLoaded && (
        <>
          <NextSceneButton
            sceneIndex={activeSceneIndex}
            totalScenes={scenesCount}
            isStockMenuOpen={isStockMenuOpen}
            isTermsOpen={isTermsOpen}
          />
          <TermsAndConditions isStockMenuOpen={isStockMenuOpen} onOpenChange={setIsTermsOpen} />
        </>
      )}
    </div>
  );
}

export default HomePage;
