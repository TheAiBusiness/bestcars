import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { api, getVehicleImageUrl } from '../../services/api.js';
import type { Vehicle } from '../../types/vehicle.js';

interface StockMenuProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideButton?: boolean;
  disableClose?: boolean;
  /** Esquina del icono Instagram: 'top-right' por defecto, 'bottom-right' para evitar solapamiento con botones superiores */
  instagramCorner?: 'top-right' | 'bottom-right';
}

export function StockMenu({ isOpen: isOpenProp, onOpenChange, hideButton = false, disableClose = false, instagramCorner = 'top-right' }: StockMenuProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    // Prevent closing if disableClose is true
    if (disableClose && !open) {
      return;
    }
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const fetchVehicles = async () => {
        try {
          setLoading(true);
          const data = await api.getAllVehicles();
          setVehicles(data);
        } catch {
          setVehicles([]);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicles();
    }
  }, [isOpen]);

  const handleSelectCar = (vehicleId: string) => {
    navigate(`/vehicle/${vehicleId}`);
    setIsOpen(false);
  };

  const getThumbnail = (vehicle: Vehicle): string => {
    if (vehicle.images && vehicle.images.length > 0) {
      return getVehicleImageUrl(vehicle.images[0]);
    }
    return '';
  };

  return (
    <>
      {/* Stock Button - hidden when hideButton is true */}
      {!hideButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-6 px-6 py-3 border border-white text-white bg-transparent rounded-sm transition-all duration-200 hover:bg-white/10 z-50"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 500,
            letterSpacing: '0.3px'
          }}
        >
          Nuestro Stock
        </button>
      )}

      {/* Instagram Button */}
      <a
        href="https://www.instagram.com/bestcarsiberica/"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-6 p-3 text-white bg-transparent transition-all duration-200 hover:opacity-70 z-50 ${
          instagramCorner === 'bottom-right' ? 'bottom-6' : 'bottom-6 md:top-6 md:bottom-auto'
        }`}
        aria-label="Síguenos en Instagram"
        title="Síguenos en Instagram"
      >
        <svg
          className="w-6 h-6 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            fill="currentColor"
          />
        </svg>
      </a>

      {/* Menu Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay - only clickable if close is enabled */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-40"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                pointerEvents: disableClose ? 'none' : 'auto',
              }}
              onClick={() => !disableClose && setIsOpen(false)}
            />

            {/* Glassmorphism menu card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ 
                duration: 0.25, 
                ease: [0.4, 0, 0.2, 1],
              }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-48px)] max-w-md z-50 rounded-3xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle noise texture overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                }}
              />

              <div className="relative p-4 max-h-[70vh] overflow-y-auto">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl"
                      >
                        {/* Skeleton thumbnail */}
                        <div 
                          className="flex-shrink-0 w-14 h-14 rounded-xl animate-pulse"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                          }}
                        />
                        
                        {/* Skeleton text */}
                        <div className="flex-1">
                          <div 
                            className="h-5 rounded-lg animate-pulse"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.12)',
                              width: index % 2 === 0 ? '75%' : '85%',
                            }}
                          />
                        </div>
                        
                        {/* Skeleton chevron */}
                        <div 
                          className="flex-shrink-0 w-5 h-5 rounded animate-pulse"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
                    <div className="text-white/80 font-medium">No hay vehículos disponibles</div>
                    <div className="text-white/50 text-sm">Comprueba que el backend esté en marcha en el puerto 3001.</div>
                  </div>
                ) : (
                  vehicles.map((vehicle, index) => {
                    const thumbnail = getThumbnail(vehicle);
                    return (
                      <motion.button
                        key={vehicle.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index, duration: 0.2 }}
                        onClick={() => handleSelectCar(vehicle.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:bg-white/10 active:bg-white/15 active:scale-[0.98]"
                        style={{
                          marginBottom: index < vehicles.length - 1 ? '8px' : '0',
                        }}
                      >
                        {/* Car thumbnail */}
                        <div 
                          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                          }}
                        >
                          {thumbnail ? (
                            <img 
                              src={thumbnail} 
                              alt={vehicle.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/10" />
                          )}
                        </div>

                        {/* Car name */}
                        <span 
                          className="flex-1 text-left text-white"
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                            fontSize: '16px',
                            fontWeight: 500,
                            letterSpacing: '0.2px',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {vehicle.title}
                        </span>

                        {/* Chevron icon */}
                        <ChevronRight 
                          className="flex-shrink-0 text-white/60" 
                          size={20}
                          strokeWidth={2.5}
                        />
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
