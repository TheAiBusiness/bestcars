import React, { useState } from 'react';
import { Calendar, Gauge, Share2, Car } from 'lucide-react';
import { toast } from 'sonner';
interface ProductHeaderProps {
  title: string;
  year: number;
  mileage: string;
  price: string;
  priceSubtext: string;
  tags: string[];
  onRequestTestDrive?: () => void;
  vehicleId?: string;
  vehicleTitle?: string;
}

export function ProductHeader({ title, year, mileage, price, priceSubtext, tags, onRequestTestDrive, vehicleId: _vehicleId, vehicleTitle: _vehicleTitle }: ProductHeaderProps) {
  const [isInstagramActive, setIsInstagramActive] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${title} - Best Cars Iberica`,
      text: `Echa un vistazo a este ${title} ${year} en Best Cars Iberica`,
      url: url,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success('URL copiada al portapapeles');
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        // Fallback: Copy to clipboard if share fails
        try {
          await navigator.clipboard.writeText(url);
          toast.success('URL copiada al portapapeles');
        } catch {
          toast.error('No se pudo compartir. Por favor, copia la URL manualmente.');
        }
      }
    }
  };
  return (
    <>
      <article
        className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[.06] shadow-xl shadow-black/20 backdrop-blur-sm p-3 sm:p-6 md:p-8"
        aria-label="Ficha principal"
      >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6 lg:gap-8">
        <div className="flex-1 min-w-0 w-full">
          <h1
            className="m-0 mb-3 md:mb-4 text-white"
            style={{
              fontSize: 'clamp(28px, 6vw, 56px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.08,
            }}
          >
            {title}
          </h1>

          <div
            className="flex flex-wrap gap-3 sm:gap-4 mb-3 md:mb-4"
            style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 500, color: 'rgba(255, 255, 255, 0.55)' }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              {year}
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <Gauge className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              {mileage}
            </span>
          </div>

          <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap mb-3 sm:mb-4 md:mb-6 justify-around lg:justify-start">
            {(Array.isArray(tags) ? tags : []).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/[0.08] bg-white/[.04] text-white/70 text-[10px] sm:text-xs"
                style={{ fontWeight: 600 }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 items-center justify-center lg:justify-start">
            {onRequestTestDrive && (
              <button
                type="button"
                onClick={onRequestTestDrive}
                className="h-9 sm:h-10 md:h-11 px-2.5 sm:px-3 md:px-6 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 transition-all duration-200 select-none text-xs sm:text-sm md:text-base flex-shrink-0 whitespace-nowrap"
                style={{ fontWeight: 600 }}
              >
                <Car className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                Solicitar prueba de manejo
              </button>
            )}
            <a
              href="tel:+34659164104"
              className="h-9 sm:h-10 md:h-11 px-2.5 sm:px-3 md:px-6 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-lg shadow-blue-600/20 transition-all duration-200 select-none text-xs sm:text-sm md:text-base flex-shrink-0 whitespace-nowrap"
              style={{ fontWeight: 600 }}
            >
              Contactar
            </a>
            <a
              href="https://www.instagram.com/bestcarsiberica/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[.04] hover:bg-white/[.06] text-white/90 inline-flex items-center justify-center cursor-pointer transition-all duration-200 select-none group flex-shrink-0"
              aria-label="Síguenos en Instagram"
              title="Síguenos en Instagram"
              onMouseDown={() => setIsInstagramActive(true)}
              onMouseUp={() => setIsInstagramActive(false)}
              onMouseLeave={() => setIsInstagramActive(false)}
            >
              <svg
                className="w-[14px] h-[14px] sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] group-hover:scale-110 group-active:scale-95 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#833AB4" />
                    <stop offset="50%" stopColor="#E1306C" />
                    <stop offset="100%" stopColor="#FCAF45" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  fill={isInstagramActive ? "url(#instagram-gradient)" : "currentColor"}
                />
              </svg>
            </a>
            <button
              onClick={handleShare}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[.04] hover:bg-white/[.06] text-white/90 inline-flex items-center justify-center cursor-pointer transition-all duration-200 select-none flex-shrink-0"
              aria-label="Compartir"
              title="Compartir"
            >
              <Share2 className="w-[14px] h-[14px] sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
            </button>
          </div>
        </div>

        <div className="text-left lg:text-right w-full lg:w-auto flex-shrink-0 mt-2 lg:mt-0">
          <div
            className="uppercase mb-1.5 sm:mb-2"
            style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', fontWeight: 500, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.05em' }}
          >
            PRECIO
          </div>
          <div
            className="text-blue-400 mb-1"
            style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {price}
          </div>
          <div style={{ fontSize: 'clamp(11px, 1.2vw, 12px)', fontWeight: 500, color: 'rgba(255, 255, 255, 0.4)' }}>
            {priceSubtext}
          </div>
        </div>
      </div>
    </article>
    </>
  );
}