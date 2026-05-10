import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Vehicle } from "../data/mock-data";
import { uploadVehicleImage } from "../../services/api";
import { vehicleSchema, type VehicleFormData } from "../../schemas/vehicle";

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'priority'>) => void;
}

const defaultValues: VehicleFormData = {
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
};

export function CreateVehicleModal({ isOpen, onClose, onSave }: CreateVehicleModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  });

  const images = watch("images");
  const tags = watch("tags");
  const status = watch("status");

  const [currentTag, setCurrentTag] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const onValid = useCallback((data: VehicleFormData) => {
    const vehicle = {
      ...data,
      image: data.images[0] || data.image || 'https://images.unsplash.com/photo-1696581084306-591db2e1af14?w=1080',
      priceHistory: [{ date: new Date().toISOString().split('T')[0], price: data.price }],
    };
    onSave(vehicle);
    onClose();
    reset(defaultValues);
    setCurrentTag("");
    setCurrentImage("");
  }, [onClose, onSave, reset]);

  const onInvalid = useCallback(() => {
    const firstError = Object.values(errors)[0];
    toast.error(firstError?.message?.toString() || "Completa los campos obligatorios");
  }, [errors]);

  const addTag = useCallback(() => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setValue("tags", [...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  }, [currentTag, tags, setValue]);

  const removeTag = useCallback((tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag));
  }, [tags, setValue]);

  const addImage = useCallback(() => {
    if (currentImage.trim() && !images.includes(currentImage.trim())) {
      setValue("images", [...images, currentImage.trim()]);
      setCurrentImage("");
    }
  }, [currentImage, images, setValue]);

  const removeImage = useCallback((index: number) => {
    setValue("images", images.filter((_, i) => i !== index));
  }, [images, setValue]);

  const handleImageFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    e.target.value = "";
    if (!list?.length) return;
    const files = Array.from(list);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} no es una imagen válida`);
      }
    }
    if (!imageFiles.length) return;
    setUploadingImage(true);
    try {
      for (const file of imageFiles) {
        const { url } = await uploadVehicleImage(file);
        const current = watch("images");
        if (!current.includes(url)) {
          setValue("images", [...current, url]);
        }
      }
      toast.success(imageFiles.length === 1 ? "Imagen subida" : `${imageFiles.length} imágenes subidas`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  }, [setValue, watch]);

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50";
  const errorClass = "text-xs text-red-400 mt-1";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-black/90 to-black/80 backdrop-blur-2xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <h2 className="text-2xl text-white">Crear Vehículo Nuevo</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onValid, onInvalid)} className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Información Básica</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Ej: Porsche 911 Carrera S"
                    className={inputClass}
                  />
                  {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Marca *</label>
                  <input
                    type="text"
                    {...register("brand")}
                    placeholder="Ej: Porsche"
                    className={inputClass}
                  />
                  {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Modelo *</label>
                  <input
                    type="text"
                    {...register("model")}
                    placeholder="Ej: 911 Carrera S"
                    className={inputClass}
                  />
                  {errors.model && <p className={errorClass}>{errors.model.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Año</label>
                  <input
                    type="number"
                    {...register("year", { valueAsNumber: true })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Precio (€) *</label>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="125000"
                    className={inputClass}
                  />
                  {errors.price && <p className={errorClass}>{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Estado</label>
                  <div className="flex gap-2">
                    {([
                      { value: "disponible", bg: "#22C55E", label: "Disponible", icon: "✓" },
                      { value: "reservado",  bg: "#F59E0B", label: "Reservado",  icon: "⏳" },
                      { value: "vendido",    bg: "#EF4444", label: "Vendido",    icon: "✕" },
                    ] as const).map((opt) => {
                      const isActive = status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setValue("status", opt.value)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all"
                          style={isActive
                            ? { backgroundColor: opt.bg, borderColor: opt.bg, color: "#fff" }
                            : { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }
                          }
                        >
                          <span style={{ fontSize: 13, lineHeight: 1 }}>{opt.icon}</span>
                          <span className="font-medium" style={{ fontSize: 12 }}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Especificaciones</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Motor</label>
                  <input
                    type="text"
                    {...register("specs.motor")}
                    placeholder="Ej: 3.0L Twin-Turbo"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Potencia</label>
                  <input
                    type="text"
                    {...register("specs.potencia")}
                    placeholder="Ej: 450 CV"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Combustible</label>
                  <input
                    type="text"
                    {...register("specs.combustible")}
                    placeholder="Ej: Gasolina"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Transmisión</label>
                  <input
                    type="text"
                    {...register("specs.transmision")}
                    placeholder="Ej: Automática PDK"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Kilómetros</label>
                  <input
                    type="number"
                    {...register("specs.kilometros", { valueAsNumber: true })}
                    placeholder="5200"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Color</label>
                  <input
                    type="text"
                    {...register("specs.color")}
                    placeholder="Ej: Negro Metálico"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Descripción</h3>
              <textarea
                {...register("description")}
                placeholder="Descripción detallada del vehículo..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Imágenes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm text-white cursor-pointer hover:bg-white/10 transition-colors ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImage}
                    onChange={handleImageFiles}
                    className="sr-only"
                    aria-label="Subir imágenes desde el ordenador"
                  />
                  {uploadingImage ? "Subiendo…" : "Subir desde ordenador"}
                </label>
                <span className="text-white/40 text-sm">o añade URL</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentImage}
                  onChange={(e) => setCurrentImage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  placeholder="URL de imagen (Unsplash, etc.)"
                  disabled={uploadingImage}
                  className={`flex-1 ${inputClass} disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={uploadingImage}
                  className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-white transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, index) => (
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

            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Tags</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Añadir etiqueta..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
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

            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Video (Opcional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">URL del Video</label>
                  <input
                    type="text"
                    {...register("videoUrl")}
                    placeholder="video_nombre.mp4"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Duración</label>
                  <input
                    type="text"
                    {...register("videoDuration")}
                    placeholder="2:34"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

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
