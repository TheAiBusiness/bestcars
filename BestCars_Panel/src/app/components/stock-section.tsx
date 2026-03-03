/**
 * Sección de gestión de stock de vehículos.
 * Permite listar, reordenar (drag & drop), editar precios y crear nuevos vehículos.
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Eye, MousePointer, Users, TrendingUp, TrendingDown, Video, Pencil, Check, Plus, Car } from "lucide-react";
import { Vehicle } from "../data/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface StockSectionProps {
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
  onReorder: (vehicles: Vehicle[]) => void;
  onPriceUpdate: (vehicleId: string, newPrice: number) => void;
  onCreateVehicle: () => void;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  onVehicleClick: (vehicle: Vehicle) => void;
  onPriceUpdate: (vehicleId: string, newPrice: number) => void;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

/** Tarjeta individual de vehículo con drag & drop y edición de precio inline */
function VehicleCard({ vehicle, index, onVehicleClick, onPriceUpdate, moveCard }: VehicleCardProps) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState(vehicle.price.toString());

  // Sincroniza el precio editado cuando cambia el vehículo (ej. tras actualización desde detalle)
  useEffect(() => {
    setEditedPrice(vehicle.price.toString());
  }, [vehicle.price]);

  const [{ isDragging }, drag] = useDrag({
    type: 'vehicle',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'vehicle',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  const statusConfig: Record<Vehicle["status"], { bg: string; label: string; icon: string }> = {
    disponible: { bg: "#22C55E", label: "Disponible", icon: "✓" },
    reservado:  { bg: "#F59E0B", label: "Reservado",  icon: "⏳" },
    vendido:    { bg: "#EF4444", label: "Vendido",    icon: "✕" },
  };

  // Calcula la variación de precio respecto al anterior registro
  const priceChange =
    vehicle.priceHistory.length >= 2
      ? vehicle.price - vehicle.priceHistory[vehicle.priceHistory.length - 2].price
      : 0;

  const handlePriceSave = useCallback(() => {
    const newPrice = parseFloat(editedPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceUpdate(vehicle.id, newPrice);
      setIsEditingPrice(false);
    }
  }, [editedPrice, onPriceUpdate, vehicle.id]);

  const mainTitle = `${vehicle.brand} ${vehicle.model}`.trim();
  const subtitle = vehicle.description || vehicle.name;

  return (
    <motion.div
      ref={(node) => {
        if (node) {
          drag(drop(node));
        }
      }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="relative group cursor-move"
    >
      {/* Glassmorphism Card */}
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-white/5">
          <ImageWithFallback
            src={vehicle.image}
            alt={vehicle.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg"
              style={{ backgroundColor: statusConfig[vehicle.status].bg, minHeight: 28 }}
            >
              <span className="text-xs leading-none">{statusConfig[vehicle.status].icon}</span>
              <span className="text-xs font-semibold text-white leading-none" style={{ fontSize: 12 }}>
                {statusConfig[vehicle.status].label}
              </span>
            </div>
          </div>

          {/* Video Badge */}
          {vehicle.videoUrl && (
            <div className="absolute top-3 left-3">
              <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <Video className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-white/90">{vehicle.videoDuration}</span>
              </div>
            </div>
          )}

          {/* Priority Indicator */}
          <div className="absolute bottom-3 left-3">
            <div className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-white/70">#{vehicle.priority}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title + subtitle */}
          <h3
            className="text-base md:text-lg text-white/90 mb-1 font-semibold truncate"
            title={mainTitle}
          >
            {mainTitle}
          </h3>
          {subtitle && (
            <p
              className="text-xs text-white/60 mb-2 line-clamp-2 break-words"
              title={subtitle}
            >
              {subtitle}
            </p>
          )}
          <p className="text-xs text-white/40 mb-4">
            {vehicle.year} • {vehicle.specs.kilometros.toLocaleString()} km
          </p>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {isEditingPrice ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceSave()}
                    className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white/90 focus:outline-none focus:border-blue-500/50"
                    autoFocus
                  />
                  <button
                    onClick={handlePriceSave}
                    className="p-1 rounded-lg bg-green-500/20 border border-green-500/30 hover:bg-green-500/30"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-white">{vehicle.price.toLocaleString()}€</span>
                  <button
                    onClick={() => setIsEditingPrice(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
                  >
                    <Pencil className="w-3 h-3 text-white/50" />
                  </button>
                </div>
              )}
              {priceChange !== 0 && !isEditingPrice && (
                <div className="flex items-center gap-1 mt-1">
                  {priceChange > 0 ? (
                    <TrendingUp className="w-3 h-3 text-red-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-green-400" />
                  )}
                  <span className={`text-xs ${priceChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {Math.abs(priceChange).toLocaleString()}€
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-white/40" />
              <div>
                <p className="text-xs text-white/40">Vistas</p>
                <p className="text-sm text-white/80">{vehicle.views}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-white/40" />
              <div>
                <p className="text-xs text-white/40">Clics</p>
                <p className="text-sm text-white/80">{vehicle.clicks}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/40" />
              <div>
                <p className="text-xs text-white/40">Leads</p>
                <p className="text-sm text-white/80">{vehicle.leads}</p>
              </div>
            </div>
          </div>

          {/* Tags del vehículo */}
          <div className="flex flex-wrap gap-2 mb-4">
            {vehicle.tags.map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                className="px-2 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* View Details Button */}
          <button
            onClick={() => onVehicleClick(vehicle)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 hover:border-white/20 text-white/90 transition-all backdrop-blur-sm"
          >
            Ver detalles completos
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function StockSection({ vehicles, onVehicleClick, onReorder, onPriceUpdate, onCreateVehicle }: StockSectionProps) {
  const [localVehicles, setLocalVehicles] = useState(vehicles);

  // Sincroniza el estado local cuando cambian las props (ej. tras filtrado o reorden en padre)
  useEffect(() => {
    setLocalVehicles(vehicles);
  }, [vehicles]);

  /** Reordena las tarjetas al soltar un elemento en una nueva posición */
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    const updatedVehicles = [...localVehicles];
    const [draggedItem] = updatedVehicles.splice(dragIndex, 1);
    updatedVehicles.splice(hoverIndex, 0, draggedItem);
    setLocalVehicles(updatedVehicles);
    onReorder(updatedVehicles);
  }, [onReorder]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 md:p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
          >
            <p className="text-sm text-white/50 mb-2">Total Stock</p>
            <p className="text-3xl text-white">{vehicles.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl border backdrop-blur-xl p-6"
            style={{ borderColor: "#22C55E33", background: "linear-gradient(135deg, #22C55E0D, #22C55E05)" }}
          >
            <p className="text-sm mb-2" style={{ color: "#22C55E" }}>✓ Disponibles</p>
            <p className="text-3xl text-white">{vehicles.filter(v => v.status === 'disponible').length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl border backdrop-blur-xl p-6"
            style={{ borderColor: "#F59E0B33", background: "linear-gradient(135deg, #F59E0B0D, #F59E0B05)" }}
          >
            <p className="text-sm mb-2" style={{ color: "#F59E0B" }}>⏳ Reservados</p>
            <p className="text-3xl text-white">{vehicles.filter(v => v.status === 'reservado').length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.02] backdrop-blur-xl p-6"
          >
            <p className="text-sm text-white/50 mb-2">Valor Total</p>
            <p className="text-3xl text-white">{(vehicles.reduce((acc, v) => acc + v.price, 0) / 1000000).toFixed(1)}M€</p>
          </motion.div>
        </div>

        {/* Vehicles Grid */}
        {localVehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]"
          >
            <Car className="w-16 h-16 text-white/20 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg text-white/70 mb-2">Sin vehículos</h3>
            <p className="text-sm text-white/40 text-center max-w-sm mb-6">
              {vehicles.length === 0
                ? "Aún no hay vehículos en el stock. Añade el primero para comenzar."
                : "No hay vehículos que coincidan con la búsqueda."}
            </p>
            <motion.button
              onClick={onCreateVehicle}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 hover:border-blue-500/30 text-white transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir vehículo
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {localVehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  onVehicleClick={onVehicleClick}
                  onPriceUpdate={onPriceUpdate}
                  moveCard={moveCard}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add Vehicle Button - solo cuando hay vehículos */}
        {localVehicles.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onCreateVehicle}
            className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 hover:border-blue-500/30 text-white transition-all backdrop-blur-sm flex items-center justify-center gap-2 mx-auto hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="text-lg">Añadir Vehículo Nuevo</span>
          </motion.button>
        )}
      </div>
    </DndProvider>
  );
}