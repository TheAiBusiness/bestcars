/**
 * Layout principal del dashboard con sidebar de navegación.
 * Renderiza el menú lateral y el contenido principal (children).
 */
import { ReactNode } from "react";
import { motion } from "motion/react";
import { Car, Users, ChartBar, Layers, Settings, Globe, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

/**
 * Definición de la navegación lateral.
 *
 * Consejo: si alguna vez cambias IDs, asegúrate de que App.tsx
 * tenga el mismo conjunto de secciones para no dejar pantallas "huérfanas".
 */
const menuItems = [
  { id: 'stock', label: 'Stock', icon: Car },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'stats', label: 'Estadísticas', icon: ChartBar },
  { id: 'scene', label: 'Escenas', icon: Layers },
  { id: 'settings', label: 'Ajustes', icon: Settings },
  { id: 'webpreview', label: 'Vista Web', icon: Globe },
];

export function DashboardLayout({ children, activeSection, onSectionChange, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-56 lg:w-64 flex-shrink-0 border-r border-white/5 relative"
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-xl" />
        
        <div className="relative h-full flex flex-col p-6">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-2xl tracking-tight bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              BestCars Ibérica
            </h1>
            <p className="text-xs text-white/40 mt-1">Gestión Premium</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className="w-full relative group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/*
                    Indicador de sección activa.
                    layoutId permite a Framer/Motion animar el "highlight" entre botones.
                  */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10 backdrop-blur-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Button content */}
                  <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-white/50 group-hover:text-white/70'}`} />
                    <span className={`${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                      {item.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
            {onLogout && (
              <motion.button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </motion.button>
            )}
            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/40">Usuario activo</p>
              <p className="text-sm text-white/70 mt-1">Admin</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}