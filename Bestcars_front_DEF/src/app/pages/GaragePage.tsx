import React from "react";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
// @ts-expect-error - Importación de imagen con espacios en el nombre
import garageImage from "../../assets/Ilustración_sin_título 103.jpg";
import logoImage from "../../assets/IMG_2007.PNG";
import { StockMenu } from "../components/StockMenu";
import "./GaragePage.css";

// ========== ADJUST MOBILE START POSITION ==========
// Percentage of image to show initially on mobile (0-100)
// 0 = left edge, 50 = center, 100 = right edge
const MOBILE_START_POSITION = 50;
// ==================================================

export default function GaragePage() {
  const [garageImageLoaded, setGarageImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [garageImageError, setGarageImageError] = useState(false);
  const [, setLogoImageError] = useState(false);
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Set initial viewport position on mobile
  useEffect(() => {
    if (pageRef.current) {
      const page = pageRef.current;
      // Calculate scroll position based on percentage
      const maxScroll = page.scrollWidth - page.clientWidth;
      const scrollLeft = (maxScroll * MOBILE_START_POSITION) / 100;
      page.scrollLeft = scrollLeft;
    }
  }, [garageImageLoaded]);

  // Auto-open stock menu when garage page loads
  useEffect(() => {
    setIsStockMenuOpen(true);
  }, []);

  return (
    <div className="garage-page" ref={pageRef}>
      <div className="image-wrapper">
        {/* Loading overlay */}
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
          className={`garage-image ${garageImageLoaded ? 'loaded' : ''}`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setGarageImageLoaded(true)}
          onError={(e) => {
            console.error("Failed to load garage image:", e);
            setGarageImageError(true);
            setGarageImageLoaded(true); // Allow page to show even if image fails
          }}
        />
        <img 
          src={logoImage} 
          alt="BEST CARS IBERICA Logo" 
          className={`garage-logo ${logoImageLoaded ? 'loaded' : ''}`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLogoImageLoaded(true)}
          onError={(e) => {
            console.error("Failed to load logo image:", e);
            setLogoImageError(true);
            setLogoImageLoaded(true); // Allow page to show even if image fails
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
      <StockMenu isOpen={isStockMenuOpen} onOpenChange={setIsStockMenuOpen} hideButton={true} disableClose={true} />
    </div>
  );
}
