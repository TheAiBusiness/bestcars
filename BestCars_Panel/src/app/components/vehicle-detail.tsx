/**
 * Modal de detalle completo de un vehículo.
 * Permite editar descripción, estado, reordenar imágenes y ver métricas.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Pencil, Save, Calendar, TrendingDown, TrendingUp, Video, Play, Eye, Trash2, Plus } from 'lucide-react';
import { Vehicle } from '../data/mock-data';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate: (vehicleId: string, updates: Partial<Vehicle>) => void;
  onWebPreview: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void | Promise<void>;
}

/** Imagen arrastrable para reordenar en la galería, con opción de borrar */
interface DraggableImageProps {
  image: string;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  onRemove?: (index: number) => void;
}

function DraggableImage({ image, index, moveImage, onRemove }: DraggableImageProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => {
        if (node) {
          drag(drop(node));
        }
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative aspect-video rounded-xl overflow-hidden border border-white/10 cursor-move group"
    >
      <ImageWithFallback src={image} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2">
        <span className="text-xs text-white/80 self-end">Arrastra para reordenar</span>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
            title="Eliminar imagen"
            aria-label="Eliminar imagen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

const defaultSpecs = {
  motor: '',
  potencia: '',
  combustible: '',
  transmision: '',
  kilometros: 0,
  color: '',
};

export function VehicleDetail({ vehicle, onClose, onUpdate, onWebPreview, onDelete }: VehicleDetailProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(vehicle.description);
  const [status, setStatus] = useState(vehicle.status);
  const [images, setImages] = useState(vehicle.images);
  const [name, setName] = useState(vehicle.name);
  const [brand, setBrand] = useState(vehicle.brand);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(vehicle.year);
  const [price, setPrice] = useState(vehicle.price);
  const [specs, setSpecs] = useState(vehicle.specs ?? defaultSpecs);
  const [tags, setTags] = useState<string[]>(vehicle.tags ?? []);
  const [showAddImage, setShowAddImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Sincroniza estado local cuando cambia el vehículo (ej. tras actualización desde fuera)
  useEffect(() => {
    setDescription(vehicle.description);
    setStatus(vehicle.status);
    setImages(vehicle.images?.length ? vehicle.images : [vehicle.image]);
    setName(vehicle.name);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(vehicle.year);
    setPrice(vehicle.price);
    setSpecs(vehicle.specs ?? defaultSpecs);
    setTags(vehicle.tags ?? []);
  }, [vehicle]);

  /** Reordena las imágenes de la galería */
  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const updatedImages = [...images];
    const [draggedItem] = updatedImages.splice(dragIndex, 1);
    updatedImages.splice(hoverIndex, 0, draggedItem);
    setImages(updatedImages);
    onUpdate(vehicle.id, { images: updatedImages });
  };

  /** Elimina una imagen de la galería */
  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUpdate(vehicle.id, { images: updated });
  };

  /** Añade una imagen por URL */
  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    const updated = [...images, url];
    setImages(updated);
    setNewImageUrl('');
    setShowAddImage(false);
    onUpdate(vehicle.id, { images: updated });
  };

  const handleSaveDescription = () => {
    onUpdate(vehicle.id, { description });
    setIsEditingDescription(false);
  };

  const handleStatusChange = (newStatus: Vehicle['status']) => {
    setStatus(newStatus);
    onUpdate(vehicle.id, { status: newStatus });
  };

  const handleSaveBasic = () => {
    const numYear = Number(year);
    onUpdate(vehicle.id, {
      name,
      brand,
      model,
      year: !Number.isNaN(numYear) && numYear >= 1900 && numYear <= 2100 ? numYear : vehicle.year,
    });
  };

  const handleSavePrice = () => {
    const numPrice = Number(price);
    if (!Number.isNaN(numPrice) && numPrice >= 0) {
      onUpdate(vehicle.id, {
        price: numPrice,
        priceHistory: [...vehicle.priceHistory, { date: new Date().toISOString(), price: numPrice }],
      });
    }
  };

  const handleSaveSpecs = () => {
    onUpdate(vehicle.id, {
      specs: {
        ...specs,
        kilometros: Number(specs.kilometros) || 0,
      },
    });
  };

  const handleSaveTags = () => {
    onUpdate(vehicle.id, { tags: tags.filter(Boolean) });
  };

  const addTag = () => setTags((t) => [...t, '']);
  const removeTag = (index: number) => setTags((t) => t.filter((_, i) => i !== index));
  const setTag = (index: number, value: string) =>
    setTags((t) => t.map((tag, i) => (i === index ? value : tag)));

  const statusOptions: Vehicle["status"][] = ["disponible", "reservado", "vendido"];
  const statusLabels: Record<Vehicle["status"], string> = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    vendido: "Vendido",
  };

  // Datos formateados para el gráfico de histórico de precios
  const chartData = useMemo(
    () =>
      vehicle.priceHistory.map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        precio: entry.price,
      })),
    [vehicle.priceHistory]
  );

  const conversionRate = vehicle.views > 0
    ? ((vehicle.leads / vehicle.views) * 100).toFixed(2)
    : "0";

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-black via-black/95 to-black backdrop-blur-2xl"
        >
          {/* Header: nombre, marca, modelo y año editables */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl p-6 flex items-center justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveBasic}
                className="w-full text-2xl font-semibold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue-500/50 focus:outline-none pb-1"
                placeholder="Nombre del vehículo"
              />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  onBlur={handleSaveBasic}
                  className="w-28 px-2 py-1 rounded bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  placeholder="Marca"
                />
                <span className="text-white/40">•</span>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  onBlur={handleSaveBasic}
                  className="flex-1 min-w-[120px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  placeholder="Modelo"
                />
                <span className="text-white/40">•</span>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || 0)}
                  onBlur={handleSaveBasic}
                  min={1900}
                  max={2100}
                  className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el vehículo "${vehicle.name}"? Esta acción no se puede deshacer.`)) {
                      void onDelete(vehicle.id);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-200 transition-colors"
                  title="Eliminar vehículo"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar vehículo
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white/70" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column - Images */}
              <div className="col-span-2 space-y-6">
                {/* Main Image */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                  <ImageWithFallback src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                </div>

                {/* Gallery */}
                <div>
                  <h3 className="text-sm text-white/70 mb-3">Galería de imágenes (arrastra para reordenar)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <DraggableImage
                        key={image}
                        image={image}
                        index={index}
                        moveImage={moveImage}
                        onRemove={handleRemoveImage}
                      />
                    ))}
                    {/* Botón + para añadir imagen */}
                    {showAddImage ? (
                      <div className="aspect-video rounded-xl border border-dashed border-white/30 bg-white/[0.02] p-3 flex flex-col gap-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="URL de la imagen"
                          className="flex-1 min-h-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddImage}
                            disabled={!newImageUrl.trim()}
                            className="flex-1 px-3 py-2 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 disabled:opacity-50 text-white text-sm"
                          >
                            Añadir
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddImage(false);
                              setNewImageUrl('');
                            }}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddImage(true)}
                        className="aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                        title="Añadir imagen"
                      >
                        <Plus className="w-10 h-10 text-white/50" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Price History Chart */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Histórico de Precio</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
                      <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: 'white',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="precio"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ fill: '#60a5fa', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Description */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg text-white">Descripción Comercial</h3>
                    {!isEditingDescription && (
                      <button
                        onClick={() => setIsEditingDescription(true)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-white/50" />
                      </button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-3">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
                      />
                      <button
                        onClick={handleSaveDescription}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 hover:border-white/20 text-white/90 transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Guardar cambios
                      </button>
                    </div>
                  ) : (
                    <p className="text-white/70 leading-relaxed">{description}</p>
                  )}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Price: editable */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.08] backdrop-blur-xl p-6">
                  <p className="text-sm text-white/50 mb-2">Precio Actual</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      onBlur={handleSavePrice}
                      className="text-4xl font-semibold text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-40 focus:outline-none focus:border-blue-500/50"
                    />
                    <span className="text-2xl text-white/70">€</span>
                  </div>
                  {vehicle.priceHistory.length >= 2 && (
                    <div className="flex items-center gap-2 mt-2">
                      {vehicle.price < vehicle.priceHistory[vehicle.priceHistory.length - 2].price ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">
                            -{(vehicle.priceHistory[vehicle.priceHistory.length - 2].price - vehicle.price).toLocaleString()}€
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">
                            +{(vehicle.price - vehicle.priceHistory[vehicle.priceHistory.length - 2].price).toLocaleString()}€
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <p className="text-sm text-white/50 mb-3">Estado del vehículo</p>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleStatusChange(option)}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-all text-left ${
                          status === option
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/20'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-white/90">{statusLabels[option]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specs: editables */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg text-white">Especificaciones</h3>
                    <button
                      type="button"
                      onClick={handleSaveSpecs}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-sm flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Guardar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(['motor', 'potencia', 'combustible', 'transmision', 'color'] as const).map((key) => (
                      <div key={key} className="flex justify-between items-center gap-3">
                        <span className="text-sm text-white/50 capitalize shrink-0 w-24">{key}</span>
                        <input
                          value={specs[key] ?? ''}
                          onChange={(e) =>
                            setSpecs((s) => ({ ...s, [key]: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    ))}
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-sm text-white/50 shrink-0 w-24">kilometros</span>
                      <input
                        type="number"
                        min={0}
                        value={specs.kilometros ?? ''}
                        onChange={(e) =>
                          setSpecs((s) => ({ ...s, kilometros: Number(e.target.value) || 0 }))
                        }
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Video */}
                {vehicle.videoUrl && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                    <h3 className="text-lg text-white mb-4">Vídeo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Video className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white/90">{vehicle.videoUrl}</p>
                          <p className="text-xs text-white/50">{vehicle.videoDuration}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Reproducciones</span>
                        <span className="text-white/90">{vehicle.videoViews?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Rendimiento</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/50">Vistas</span>
                        <span className="text-sm text-white/90">{vehicle.views.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/50">Clics</span>
                        <span className="text-sm text-white/90">{vehicle.clicks.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: '45%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/50">Leads</span>
                        <span className="text-sm text-white/90">{vehicle.leads}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: '30%' }}
                        />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/50">Tasa de conversión</span>
                        <span className="text-lg text-green-400">{conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags: editables */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg text-white">Etiquetas</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-sm"
                      >
                        + Añadir
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTags}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-sm flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Guardar
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                      >
                        <input
                          value={tag}
                          onChange={(e) => setTag(idx, e.target.value)}
                          className="bg-transparent text-white/90 text-sm w-24 focus:outline-none placeholder:text-white/40"
                          placeholder="Etiqueta"
                        />
                        <button
                          type="button"
                          onClick={() => removeTag(idx)}
                          className="p-0.5 rounded hover:bg-white/20 text-white/50 hover:text-white"
                          aria-label="Quitar etiqueta"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Información</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <div className="flex-1">
                        <p className="text-xs text-white/40">Creado</p>
                        <p className="text-sm text-white/70">
                          {new Date(vehicle.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <div className="flex-1">
                        <p className="text-xs text-white/40">Última actualización</p>
                        <p className="text-sm text-white/70">
                          {new Date(vehicle.updatedAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Web Preview Button */}
                <button
                  onClick={() => onWebPreview(vehicle)}
                  className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 hover:border-green-500/30 text-white transition-all backdrop-blur-sm flex items-center justify-center gap-3 hover:scale-105"
                >
                  <Eye className="w-5 h-5 text-green-400" />
                  <span className="text-lg">Vista Previa Web</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DndProvider>
  );
}