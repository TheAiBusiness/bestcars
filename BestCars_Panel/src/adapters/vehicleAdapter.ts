/**
 * Adaptadores entre el formato de la API y el formato del Panel.
 */
import type { Vehicle } from '../app/data/mock-data';
import type { ApiVehicle, ApiVehicleCreate, ApiVehicleUpdate } from '../services/api';
import { getVehicleImageUrl, toApiImageValue } from '../services/api';

function parsePrice(priceStr: string): number {
  const num = priceStr.replace(/[^\d,.-]/g, '').replace(',', '');
  return parseFloat(num) || 0;
}

function formatPrice(price: number): string {
  return `€${price.toLocaleString('es-ES')}`;
}

function mapStatusToPanel(status: string | undefined): Vehicle['status'] {
  const m: Record<string, Vehicle['status']> = {
    available: 'disponible',
    reserved: 'reservado',
    sold: 'vendido',
    disponible: 'disponible',
    reservado: 'reservado',
    vendido: 'vendido',
  };
  return m[status?.toLowerCase() ?? ''] ?? 'disponible';
}

function mapStatusToApi(status: Vehicle['status']): string {
  const m: Record<Vehicle['status'], string> = {
    disponible: 'available',
    reservado: 'reserved',
    vendido: 'sold',
  };
  return m[status] ?? 'available';
}

function extractSpec(specs: { key: string; value: string }[] | undefined, key: string): string {
  const item = specs?.find((s) => s.key.toLowerCase().includes(key.toLowerCase()));
  return item?.value ?? '';
}

/** Convierte un vehículo de la API al formato del Panel */
export function apiVehicleToPanel(api: ApiVehicle): Vehicle {
  const price = parsePrice(api.price);
  const specs = api.specifications ?? {};
  const motorSpecs = Array.isArray(specs.motor) ? specs.motor : [];
  const generalSpecs = Array.isArray(specs.general) ? specs.general : [];

  const kilometros = api.mileage ? parseFloat(api.mileage.replace(/[^\d]/g, '')) || 0 : 0;

  return {
    id: api.id,
    name: api.title,
    brand: (api.tags && api.tags[0]) ?? (api.title && api.title.split(' ')[0]) ?? 'N/A',
    model: api.title,
    year: api.year,
    price,
    priceHistory: [{ date: api.updatedAt, price }],
    status: mapStatusToPanel(api.status),
    image: getVehicleImageUrl((Array.isArray(api.images) && api.images[0]) ?? ''),
    images: Array.isArray(api.images) && api.images.length ? api.images.map(getVehicleImageUrl) : [],
    specs: {
      motor: (extractSpec(motorSpecs, 'Motor') || extractSpec(motorSpecs, 'motor') || api.fuelType) ?? '',
      potencia: (extractSpec(motorSpecs, 'Potencia') || extractSpec(motorSpecs, 'potencia')) ?? '',
      combustible: api.fuelType ?? extractSpec(motorSpecs, 'combustible') ?? '',
      transmision: extractSpec(motorSpecs, 'Transmisión') ?? '',
      kilometros,
      color: extractSpec(generalSpecs, 'Color') ?? '',
    },
    description: api.description ?? '',
    tags: api.tags ?? [],
    views: api.views ?? 0,
    clicks: api.clicks ?? 0,
    leads: api.leads ?? 0,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    priority: api.priority ?? 0,
  };
}

/** Convierte un vehículo del Panel al formato de la API para crear/actualizar */
export function panelVehicleToApiCreate(
  v: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'priority'>
): ApiVehicleCreate {
  const mileage = v.specs.kilometros ? `${v.specs.kilometros.toLocaleString()} km` : '0 km';
  return {
    title: v.name,
    year: v.year,
    mileage,
    price: formatPrice(v.price),
    priceSubtext: 'IVA Incluido',
    fuelType: v.specs.combustible || undefined,
    seats: undefined,
    description: v.description || undefined,
    images: (v.images?.length ? v.images : (v.image ? [v.image] : [])).map(toApiImageValue),
    tags: v.tags?.length ? v.tags : [v.brand],
    status: mapStatusToApi(v.status),
    specifications: {
      general: [
        { key: 'Color Exterior', value: v.specs.color || 'N/A' },
        { key: 'Kilometraje', value: mileage },
      ].filter((s) => s.value && s.value !== 'N/A'),
      motor: [
        { key: 'Motor', value: v.specs.motor },
        { key: 'Potencia', value: v.specs.potencia },
        { key: 'Combustible', value: v.specs.combustible },
        { key: 'Transmisión', value: v.specs.transmision },
      ].filter((s) => s.value),
    },
  };
}

export function panelVehicleToApiUpdate(updates: Partial<Vehicle>): ApiVehicleUpdate {
  const out: ApiVehicleUpdate = {};
  if (updates.name !== undefined) out.title = updates.name;
  if (updates.year !== undefined) out.year = updates.year;
  if (updates.price !== undefined) out.price = formatPrice(updates.price);
  if (updates.status !== undefined) out.status = mapStatusToApi(updates.status);
  if (updates.description !== undefined) out.description = updates.description;
  if (updates.images !== undefined) out.images = updates.images.map(toApiImageValue);
  if (updates.tags !== undefined) out.tags = updates.tags;
  if (updates.specs !== undefined) {
    const s = updates.specs;
    const mileage = s.kilometros ? `${s.kilometros.toLocaleString()} km` : undefined;
    if (mileage) out.mileage = mileage;
    out.specifications = {
      general: s.color ? [{ key: 'Color Exterior', value: s.color }] : [],
      motor: [
        { key: 'Motor', value: s.motor },
        { key: 'Potencia', value: s.potencia },
        { key: 'Combustible', value: s.combustible },
        { key: 'Transmisión', value: s.transmision },
      ].filter((x) => x.value),
    };
  }
  return out;
}
