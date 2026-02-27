/**
 * Modal para crear un nuevo vehículo.
 * Formulario completo con datos básicos, especificaciones, imágenes y etiquetas.
 */
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";
import { Vehicle } from "../data/mock-data";

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'priority'>) => void;
}

export function CreateVehicleModal({ isOpen, onClose, onSave }: CreateVehicleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    status: 'disponible' as 'disponible' | 'reservado' | 'vendido',
    image: '',
    images: [] as string[],
    specs: {
      motor: '',
      potencia: '',
      combustible: '',
      transmision: '',
      kilometros: 0,
      color: '',
    },
    description: '',
    tags: [] as string[],
    views: 0,
    clicks: 0,
    leads: 0,
    videoUrl: '',
    videoDuration: '',
    videoViews: 0,
    priceHistory: [] as { date: string; price: number }[],
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!formData.name?.trim() || !formData.brand?.trim() || !formData.model?.trim() || !formData.price) {
      toast.error("Completa los campos obligatorios: Nombre, Marca, Modelo y Precio");
      return;
    }

    const vehicle = {
      ...formData,
      image: formData.images[0] || formData.image || 'https://images.unsplash.com/photo-1696581084306-591db2e1af14?w=1080',
      priceHistory: [{ date: new Date().toISOString().split('T')[0], price: formData.price }],
    };

    onSave(vehicle);
    onClose();
    resetForm();
  }, [formData, onClose, onSave]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      status: 'disponible',
      image: '',
      images: [],
      specs: {
        motor: '',
        potencia: '',
        combustible: '',
        transmision: '',
        kilometros: 0,
        color: '',
      },
      description: '',
      tags: [],
      views: 0,
      clicks: 0,
      leads: 0,
      videoUrl: '',
      videoDuration: '',
      videoViews: 0,
      priceHistory: [],
    });
    setCurrentTag("");
    setCurrentImage("");
  }, []);

  const addTag = useCallback(() => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      setCurrentTag("");
    }
  }, [currentTag, formData.tags]);

  const removeTag = useCallback((tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }, []);

  const addImage = useCallback(() => {
    if (currentImage.trim() && !formData.images.includes(currentImage.trim())) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, currentImage.trim()] }));
      setCurrentImage("");
    }
  }, [currentImage, formData.images]);

  const removeImage = useCallback((index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-black/90 to-black/80 backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <h2 className="text-2xl text-white">Crear Vehículo Nuevo</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Información Básica</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Porsche 911 Carrera S"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Marca *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ej: Porsche"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Modelo *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ej: 911 Carrera S"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Año</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Precio (€) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="125000"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 appearance-none pr-10"
                  >
                    <option value="disponible" className="bg-black text-white">Disponible</option>
                    <option value="reservado" className="bg-black text-white">Reservado</option>
                    <option value="vendido" className="bg-black text-white">Vendido</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Especificaciones</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Motor</label>
                  <input
                    type="text"
                    value={formData.specs.motor}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, motor: e.target.value } })}
                    placeholder="Ej: 3.0L Twin-Turbo"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Potencia</label>
                  <input
                    type="text"
                    value={formData.specs.potencia}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, potencia: e.target.value } })}
                    placeholder="Ej: 450 CV"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Combustible</label>
                  <input
                    type="text"
                    value={formData.specs.combustible}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, combustible: e.target.value } })}
                    placeholder="Ej: Gasolina"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Transmisión</label>
                  <input
                    type="text"
                    value={formData.specs.transmision}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, transmision: e.target.value } })}
                    placeholder="Ej: Automática PDK"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Kilómetros</label>
                  <input
                    type="number"
                    value={formData.specs.kilometros}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, kilometros: parseInt(e.target.value) } })}
                    placeholder="5200"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Color</label>
                  <input
                    type="text"
                    value={formData.specs.color}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, color: e.target.value } })}
                    placeholder="Ej: Negro Metálico"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Descripción</h3>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del vehículo..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Imágenes</h3>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentImage}
                  onChange={(e) => setCurrentImage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  placeholder="URL de imagen (Unsplash, etc.)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10">
                      <img src={img} alt={`Imagen ${index + 1}`} className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Tags</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Añadir etiqueta..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Video (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Video (Opcional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">URL del Video</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="video_nombre.mp4"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Duración</label>
                  <input
                    type="text"
                    value={formData.videoDuration}
                    onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                    placeholder="2:34"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all shadow-lg shadow-blue-500/25"
              >
                Crear Vehículo
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
