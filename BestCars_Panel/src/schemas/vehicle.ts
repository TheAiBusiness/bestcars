import { z } from "zod";

export const vehicleSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").trim(),
  brand: z.string().min(1, "La marca es obligatoria").trim(),
  model: z.string().min(1, "El modelo es obligatorio").trim(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  price: z.number().positive("El precio debe ser mayor que 0"),
  status: z.enum(["disponible", "reservado", "vendido"]),
  image: z.string(),
  images: z.array(z.string()),
  specs: z.object({
    motor: z.string(),
    potencia: z.string(),
    combustible: z.string(),
    transmision: z.string(),
    kilometros: z.number().min(0),
    color: z.string(),
  }),
  description: z.string(),
  tags: z.array(z.string()),
  views: z.number(),
  clicks: z.number(),
  leads: z.number(),
  videoUrl: z.string(),
  videoDuration: z.string(),
  videoViews: z.number(),
  priceHistory: z.array(z.object({ date: z.string(), price: z.number() })),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
