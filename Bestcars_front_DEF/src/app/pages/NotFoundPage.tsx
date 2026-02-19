import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Header } from '../components/Header';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Header />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-68px)] px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-[180px] md:text-[240px] font-black leading-none text-white/90 animate-pulse">
              404
            </h1>
          </div>

          {/* Message */}
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
              Página no encontrada
            </h2>
            <p className="text-white/70 text-lg md:text-xl">
              Parece que este vehículo se ha ido a dar una vuelta...
            </p>
            <p className="text-white/50 text-sm md:text-base">
              La página que buscas no existe o ha sido movida.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#0B0F19] font-semibold text-base hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-white/20"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </button>

          {/* Decorative elements */}
          <div className="mt-16 flex justify-center gap-2 opacity-30">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </main>
    </div>
  );
}
