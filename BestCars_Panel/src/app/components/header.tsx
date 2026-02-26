/**
 * Cabecera del panel con título de sección, búsqueda y acciones.
 * El valor de búsqueda se delega al padre (controled component).
 */
import { Search } from "lucide-react";

interface HeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
}

export function Header({ title, searchPlaceholder = 'Buscar...', searchValue = '', onSearch }: HeaderProps) {
  return (
    <header className="h-20 border-b border-white/5 relative flex-shrink-0">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-xl" />
      
      <div className="relative h-full flex items-center justify-between px-4 md:px-8 gap-4">
        {/* Title */}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl truncate bg-gradient-to-br from-white via-white/95 to-white/80 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              aria-label="Buscar"
              className="w-64 md:w-80 pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/[0.05] transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}