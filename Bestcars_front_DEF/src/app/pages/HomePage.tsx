import React from "react";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import houseImage from "../../assets/Bestcars-home.png";
import CarHotspots from "../components/CarHotspots";
import GarageArrow from "../components/GarageArrow";
import { NextSceneButton } from "../components/NextSceneButton";
import { StockMenu } from "../components/StockMenu";
import { TermsAndConditions } from "../components/TermsAndConditions";
import { BreadcrumbJsonLd } from "../components/BreadcrumbJsonLd";
import { api, sceneHotspots, type Scene } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import "./HomePage.css";

const BASE_URL = "https://bestcarsiberica.com";

const organizationLocalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "AutoDealer"],
  name: "Best Cars Ibérica",
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  description: "Best Cars Ibérica es un concesionario de coches de lujo en Madrid. Especialistas en vehículos premium de marcas como Audi, BMW y Porsche. Stock exclusivo, asesoramiento personalizado y experiencia de compra premium.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Madrid",
    addressRegion: "Comunidad de Madrid",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.4168,
    longitude: -3.7038,
  },
  telephone: "+34659164104",
  openingHours: "Mo-Sa 10:00-20:00",
  sameAs: ["https://www.instagram.com/bestcarsiberica/"],
  image: new URL(houseImage, BASE_URL).href,
};

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
    const load = () => {
      Promise.all([api.getScenes(), api.getAllVehicles()])
        .then(([list, vList]) => {
          if (cancelled) return;
          const scenes = Array.isArray(list) ? (list as Scene[]) : [];
          setScenesCount(scenes.length);
          setVehicles(Array.isArray(vList) ? vList : []);

          const principal = scenes[0] ?? null;
          if (!principal) {
            setHotspots([]);
            setActiveSceneIndex(0);
            return;
          }
          setActiveSceneIndex(0);
          const h = sceneHotspots(principal);
          setHotspots(Array.isArray(h) ? h : []);
        })
        .catch(() => {
          if (!cancelled) setHotspots([]);
        });
    };
    load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
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
      <BreadcrumbJsonLd items={[{ name: "Inicio", url: `${BASE_URL}/` }]} />
      <Helmet>
        <link rel="canonical" href={`${BASE_URL}`} />
        <title>Coches de lujo en Madrid | Audi, BMW, Porsche | Best Cars Ibérica</title>
        <meta name="description" content="Compra y venta de vehículos premium en Madrid. Audi, BMW, Porsche. Catálogo exclusivo, asesoramiento personalizado. Visita nuestro showroom." />
        <meta property="og:title" content="Coches de lujo en Madrid | Audi, BMW, Porsche | Best Cars Ibérica" />
        <meta property="og:description" content="Compra y venta de vehículos premium en Madrid. Audi, BMW, Porsche. Catálogo exclusivo, asesoramiento personalizado. Visita nuestro showroom." />
        <meta property="og:image" content={new URL(houseImage, BASE_URL).href} />
        <meta property="og:url" content={`${BASE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Coches de lujo en Madrid | Audi, BMW, Porsche | Best Cars Ibérica" />
        <meta name="twitter:description" content="Compra y venta de vehículos premium en Madrid. Audi, BMW, Porsche. Catálogo exclusivo, asesoramiento personalizado. Visita nuestro showroom." />
        <meta name="twitter:image" content={new URL(houseImage, BASE_URL).href} />
        <script type="application/ld+json">
          {JSON.stringify(organizationLocalBusinessSchema)}
        </script>
      </Helmet>
      <h1
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 text-white text-sm md:text-base font-medium tracking-wide pointer-events-none text-center"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
      >
        Coches de lujo en Madrid — Best Cars Ibérica
      </h1>
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
          width={5803}
          height={3264}
          loading="eager"
          fetchPriority="high"
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
