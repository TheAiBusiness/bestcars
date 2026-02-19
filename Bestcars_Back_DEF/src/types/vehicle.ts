/**
 * Tipos TypeScript para el dominio de vehículos
 * Alineados con el schema de Prisma (models Vehicle, Specification)
 */

export interface SpecificationItem {
  key: string;
  value: string;
}

/** Especificaciones agrupadas por categoría (general, motor, seguridad, tecnología) */
export interface VehicleSpecifications {
  general: SpecificationItem[];
  motor: SpecificationItem[];
  seguridad: SpecificationItem[];
  tecnologia: SpecificationItem[];
}

export interface VehicleStats {
  fuel: string;
  mileage: string;
  seats: string;
  year: string;
}

export interface Vehicle {
  id: string;
  title: string;
  year: number;
  mileage: string;
  price: string;
  priceSubtext?: string | null;
  fuelType?: string | null;
  seats?: string | null;
  description?: string | null;
  images: string[];
  tags: string[];
  stats?: VehicleStats | null;
  specifications?: VehicleSpecifications | null;
  createdAt: Date;
  updatedAt: Date;
}
