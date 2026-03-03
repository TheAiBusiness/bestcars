import React from "react";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
// @ts-expect-error - Importación de imagen con espacios en el nombre
import garageImage from "../../assets/Ilustración_sin_título 103.jpg";
import logoImage from "../../assets/IMG_2007.PNG";
import { StockMenu } from "../components/StockMenu";
import "./GaragePage.css";

const MOBILE_START_POSITION = 50;

export default function GaragePage() {
  const [garageImageLoaded, setGarageImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [garageImageError, setGarageImageError] = useState(false);
  const [, setLogoImageError] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      const page = pageRef.current;
      const maxScroll = page.scrollWidth - page.clientWidth;
      const scrollLeft = (maxScroll * MOBILE_START_POSITION) / 100;
      page.scrollLeft = scrollLeft;
    }
  }, [garageImageLoaded]);

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

  const showLoader = !garageImageLoaded && !garageImageError;

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
              <p className="text-white/70 text-sm">Cargando imagen…</p>
            </div>
          </div>
        )}
        <div
          className={`garage-image ${garageImageLoaded ? "loaded" : ""}`}
          style={{
            backgroundImage: `url(${garageImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
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
      <StockMenu isOpen={true} hideButton={true} disableClose={true} instagramCorner="bottom-right" />
    </div>
  );
}
