import React from "react";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import houseImage from "../../assets/Bestcars-home.png";
import CarHotspots from "../components/CarHotspots";
import GarageArrow from "../components/GarageArrow";
import { NextSceneButton } from "../components/NextSceneButton";
import { StockMenu } from "../components/StockMenu";
import { TermsAndConditions } from "../components/TermsAndConditions";
import { api } from "../../services/api.js";
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
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getScenes().then((list) => setScenesCount(list.length)).catch(() => {});
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
            <CarHotspots />
            <GarageArrow isMenuOpen={isStockMenuOpen} isTermsOpen={isTermsOpen} />
          </>
        )}
      </div>
      <StockMenu isOpen={isStockMenuOpen} onOpenChange={setIsStockMenuOpen} />
      {allImagesLoaded && (
        <>
          <NextSceneButton
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
