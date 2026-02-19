

export interface SpecificationItem {
  key: string;
  value: string;
}

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

export interface VehicleUpdateBody {
  title?: string;
  year?: number;
  mileage?: string;
  price?: string;
  priceSubtext?: string | null;
  fuelType?: string | null;
  seats?: string | null;
  description?: string | null;
  images?: string[];
  tags?: string[];
  status?: string;
  priority?: number;
  views?: number;
  clicks?: number;
  leads?: number;
}
