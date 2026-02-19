import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070A10] border-t border-white/10 mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Best Cars Ibérica</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Concesionario de vehículos de lujo en Ibiza. Experiencia premium en compra y venta de coches exclusivos.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">Navegación</h3>
            <nav className="flex flex-col gap-3" aria-label="Enlaces del sitio">
              <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">
                Inicio
              </Link>
              <Link to="/garage" className="text-sm text-white/60 hover:text-white transition-colors">
                Nuestro Stock
              </Link>
              <Link to="/#contacto" className="text-sm text-white/60 hover:text-white transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden />
                <a href="mailto:ventas@bestcars.com" className="hover:text-white transition-colors">
                  ventas@bestcars.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden />
                <a href="tel:+34600000000" className="hover:text-white transition-colors">
                  +34 600 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden />
                <span>Ibiza, Islas Baleares</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden />
                <a href="https://instagram.com/bestcars" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  @bestcars
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {currentYear} Best Cars Ibérica. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-white/40">
            <a href="#terminos" className="hover:text-white/60 transition-colors">
              Términos y condiciones
            </a>
            <a href="#privacidad" className="hover:text-white/60 transition-colors">
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
