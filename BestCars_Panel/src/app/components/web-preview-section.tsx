/**
 * Panel de control: vista de la web pública en vivo.
 * Iframe que carga la URL de la web (Best Cars) para ver los cambios en tiempo real.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Globe, RefreshCw } from "lucide-react";
import { Vehicle } from "../data/mock-data";
import { useLocalStorageState } from "../hooks/use-local-storage-state";

// URL de la web para ver cambios en vivo (local o producción)
const DEFAULT_WEB_PREVIEW_URL =
  (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_WEB_PREVIEW_URL?: string } }).env?.VITE_WEB_PREVIEW_URL) ||
  "http://localhost:5173";

interface WebPreviewSectionProps {
  vehicles: Vehicle[];
  onVehiclePreview: (vehicle: Vehicle) => void;
}

export function WebPreviewSection({ vehicles }: WebPreviewSectionProps) {
  const [previewUrl, setPreviewUrl] = useLocalStorageState(
    "bestcars_web_preview_url",
    DEFAULT_WEB_PREVIEW_URL
  );
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const refreshIframe = () => {
    setIframeKey((k) => k + 1);
  };

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "disponible"),
    [vehicles]
  );

  const effectiveUrl = previewUrl?.trim() || DEFAULT_WEB_PREVIEW_URL;

  // La web puede pedir el estado; respondemos con los vehículos actuales
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string };
      if (data?.type === "BESTCARS_WEB_PREVIEW_REQUEST_STATE" && iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            {
              type: "BESTCARS_WEB_PREVIEW_VEHICLES",
              payload: { vehicles, filterType: "all", sortBy: "recent" },
            },
            "*"
          );
        } catch {
          // iframe puede no estar listo
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [vehicles]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Barra: URL de la web y estadísticas */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4 border-b border-white/5 bg-black/40 backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] flex flex-wrap items-center gap-2">
            <Globe className="w-4 h-4 text-white/50 shrink-0" />
            <input
              type="url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder={DEFAULT_WEB_PREVIEW_URL}
              className="flex-1 min-w-[280px] px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/90 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
            />
            <span className="text-xs text-white/40 max-w-xs">
              URL de la web (Best Cars). Usa &quot;Actualizar vista&quot; para ver los últimos cambios.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Publicados</p>
            <p className="text-xl text-white">{availableVehicles.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/[0.05] to-blue-500/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Vistas Web</p>
            <p className="text-xl text-white">{vehicles.reduce((acc, v) => acc + v.views, 0).toLocaleString()}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/[0.05] to-green-500/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Conversiones</p>
            <p className="text-xl text-white">{vehicles.reduce((acc, v) => acc + v.leads, 0)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/[0.05] to-purple-500/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Tasa CVR</p>
            <p className="text-xl text-white">
              {vehicles.reduce((acc, v) => acc + v.views, 0) > 0 
                ? ((vehicles.reduce((acc, v) => acc + v.leads, 0) / vehicles.reduce((acc, v) => acc + v.views, 0)) * 100).toFixed(1)
                : '0'}%
            </p>
          </motion.div>
        </div>
      </div>

      {/* Vista de la web en vivo */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
        <div className="flex-shrink-0 px-4 py-2 border-b border-white/5 flex items-center justify-between gap-2 text-sm text-white/50">
          <span className="flex items-center gap-2 truncate">
            <Globe className="w-4 h-4 shrink-0" />
            {effectiveUrl}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={refreshIframe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors"
              title="Recargar la web para ver los últimos cambios"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar vista
            </button>
            <a
              href={effectiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors"
            >
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={effectiveUrl}
            title="Web Best Cars en vivo"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}