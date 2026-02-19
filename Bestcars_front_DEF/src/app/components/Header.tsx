import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
// @ts-expect-error - Importación de imagen estática
import logoImage from '../../assets/BestCars_Black.png';

interface HeaderProps {
  hideCloseButton?: boolean;
}

export function Header({ hideCloseButton = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-[100] h-[68px] bg-white/95 backdrop-blur-xl text-[#0B0F19] border-b border-black/[0.06]">
      <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer select-none"
          >
            <img 
              src={logoImage} 
              alt="BEST CARS IBERICA Logo" 
              className="h-14 w-auto pointer-events-none"
            />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-black/[0.08] bg-black/[.03] text-[#0B0F19] font-semibold text-[13px] hover:bg-black/[.06] hover:border-black/[0.12] transition-all duration-200 select-none whitespace-nowrap"
          >
            Volver a inicio
          </button>

          {!hideCloseButton && (
            <button
              type="button"
              title="Cerrar"
              aria-label="Cerrar"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl border border-black/[0.08] bg-black/[.03] grid place-items-center hover:bg-black/[.06] hover:border-black/[0.12] transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4 text-[#0B0F19] opacity-70" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}