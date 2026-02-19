export interface SpecificationItem {
  key: string;
  value: string;
}

export interface VehicleSpecifications {
  general?: SpecificationItem[];
  motor?: SpecificationItem[];
  seguridad?: SpecificationItem[];
  tecnologia?: SpecificationItem[];
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
  specifications?: VehicleSpecifications | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  id: number;
}

export interface TestDriveFormData {
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  age: string;
  lastVehicle: string;
  interests: string;
  mainUse: string;
}

export interface TestDriveSubmissionResponse {
  success: boolean;
  message: string;
  id: number;
}
