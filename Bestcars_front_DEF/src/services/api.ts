import type { Vehicle, ContactFormData, ContactSubmissionResponse, TestDriveFormData, TestDriveSubmissionResponse } from '../types/vehicle.js';
import { getCachedVehicle, setCachedVehicle } from './vehicleCache.js';

// Sin barra final para evitar ...dominio.com//api/... (404)
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const API_VEHICLES_IMAGES = `${API_BASE_URL}/api/vehicles/images`;

/**
 * URL de imagen de vehículo: misma fuente que el panel (API/backend).
 * - Si el valor es una URL (http/https/data) se devuelve tal cual.
 * - Si es un nombre de archivo, se resuelve contra el backend (/api/vehicles/images/).
 * Así el stock en la web muestra exactamente las mismas imágenes que el stock del panel.
 */
export function getVehicleImageUrl(filenameOrUrl: string): string {
  if (!filenameOrUrl || typeof filenameOrUrl !== 'string') return '';
  const s = filenameOrUrl.trim();
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
  return `${API_VEHICLES_IMAGES}/${encodeURIComponent(s)}`;
}

/** URL absoluta para fondo de escena (panorámica). Si es relativa, se resuelve contra el API. */
export function getSceneBackgroundUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const s = url.trim();
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
  return `${API_BASE_URL}/${s.replace(/^\//, '')}`;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = errorData?.error;
      const message =
        (typeof err === 'object' && err?.message) ? String(err.message)
          : typeof err === 'string' ? err
          : typeof errorData?.message === 'string' ? errorData.message
          : `Error ${response.status}`;
      throw new ApiError(response.status, message);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  /**
   * Get all vehicles.
   * Acepta respuesta como array o como { data: Vehicle[] }.
   */
  async getAllVehicles(): Promise<Vehicle[]> {
    const raw = await fetchApi<Vehicle[] | { data: Vehicle[] }>('/api/vehicles');
    return Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
  },

  /**
   * Get a single vehicle by ID.
   * Normaliza la respuesta: images/tags arrays, y campos primitivos (evita Decimal/Date/objetos que causan React #310).
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    const raw = await fetchApi<Vehicle>(`/api/vehicles/${id}`);
    const toStr = (v: unknown) => (v != null ? String(v) : '');
    const images = Array.isArray(raw.images) ? raw.images : [];
    const tags = Array.isArray(raw.tags) ? raw.tags : [];
    const yearVal = raw.year;
    const year =
      typeof yearVal === 'number' && !Number.isNaN(yearVal)
        ? yearVal
        : yearVal instanceof Date
          ? yearVal.getFullYear()
          : parseInt(String(yearVal ?? ''), 10) || new Date().getFullYear();

    // Normalizar specifications para evitar objetos complejos en JSX
    const specifications = (() => {
      if (!raw.specifications || typeof raw.specifications !== 'object') return null;
      const specs = raw.specifications as Record<string, unknown>;
      const normalized: Record<string, any> = {};
      for (const key of Object.keys(specs)) {
        const val = specs[key];
        if (!Array.isArray(val)) continue;
        normalized[key] = val.map((item: unknown) => {
          if (typeof item === 'object' && item != null && 'key' in item && 'value' in item) {
            return {
              key: toStr((item as { key?: unknown }).key),
              value: toStr((item as { value?: unknown }).value),
            };
          }
          return { key: '', value: '' };
        });
      }
      return Object.keys(normalized).length > 0 ? normalized : null;
    })();

    return {
      id: toStr(raw.id) || id,
      title: toStr(raw.title),
      year,
      mileage: toStr(raw.mileage),
      price: toStr(raw.price),
      priceSubtext: raw.priceSubtext != null ? toStr(raw.priceSubtext) : null,
      fuelType: raw.fuelType != null ? toStr(raw.fuelType) : null,
      seats: raw.seats != null ? toStr(raw.seats) : null,
      description: raw.description != null ? toStr(raw.description) : null,
      images: images.map((img) => (typeof img === 'string' ? img : toStr(img))),
      tags: tags.map((t) => (typeof t === 'string' ? t : (typeof (t as { name?: string })?.name === 'string' ? (t as { name: string }).name : toStr(t)))),
      specifications: specifications,
      status: typeof raw.status === 'string' ? raw.status : undefined,
      createdAt: toStr(raw.createdAt),
      updatedAt: toStr(raw.updatedAt),
    };
  },

  /**
   * Prefetch silencioso: carga el vehículo en segundo plano y lo guarda en caché.
   * No afecta la UI. Usar en onMouseEnter/onTouchStart para navegación instantánea.
   */
  async prefetchVehicle(id: string): Promise<void> {
    if (getCachedVehicle(id)) return;
    try {
      const vehicle = await this.getVehicleById(id);
      setCachedVehicle(vehicle);
    } catch {
      // Silenciar errores (no afectar UX)
    }
  },

  /**
   * Submit contact form
   */
  async submitContact(data: ContactFormData): Promise<ContactSubmissionResponse> {
    return fetchApi<ContactSubmissionResponse>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Submit test drive request
   */
  async submitTestDrive(data: TestDriveFormData): Promise<TestDriveSubmissionResponse> {
    return fetchApi<TestDriveSubmissionResponse>('/api/test-drive', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all scenes (for navigating between scenes on the web).
   */
  async getScenes(): Promise<Scene[]> {
    const raw = await fetchApi<Scene[]>('/api/scenes');
    return Array.isArray(raw) ? raw : [];
  },

  /**
   * Get active scene (for homepage/garage composition).
   * Cache-bust para que los cambios de hotspots del panel se vean al refrescar o al volver a la pestaña.
   */
  async getActiveScene(): Promise<Scene | null> {
    return fetchApi<Scene | null>(`/api/scenes/active?_t=${Date.now()}`);
  },

  /**
   * Registrar vista de ficha de vehículo (para estadísticas del panel).
   * Llamar cuando el usuario entra en la página de detalle.
   */
  async trackVehicleView(vehicleId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/vehicles/${encodeURIComponent(vehicleId)}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view' }),
        cache: 'no-store',
      });
    } catch {
      // Silenciar errores de tracking (no afectar UX)
    }
  },

  /**
   * Registrar clic en CTA (contacto / prueba de manejo) para estadísticas del panel.
   */
  async trackVehicleClick(vehicleId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/vehicles/${encodeURIComponent(vehicleId)}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' }),
        cache: 'no-store',
      });
    } catch {
      // Silenciar errores de tracking
    }
  },
};

export interface Hotspot {
  id: string;
  vehicleId: string;
  x: number;
  y: number;
  createdAt?: string;
}

export interface Scene {
  id: string;
  name: string;
  backgroundUrl: string;
  /** Lista de hotspots (siempre presente en respuestas del API) */
  hotspots?: Hotspot[];
  /** @deprecated Legacy: objeto por slot; si no hay hotspots, normalizar desde aquí */
  positions?: Record<string, ScenePosition>;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScenePosition {
  vehicleId: string | null;
  transform: { x: number; y: number; scale: number; rotation: number };
  updatedAt: string;
}

/**
 * Escenas para /experiencia: solo las del editor. La escena principal efectiva NUNCA entra aquí.
 * @param list - Lista completa de escenas
 * @param principalSceneId - Id de la escena principal efectiva (Home); si se pasa, se excluye por id
 * - Excluye la escena con id === principalSceneId
 * - Excluye nombre garaje|garage
 * - Excluye sin backgroundUrl válido
 * - Sin fallback: si no hay ninguna válida, devuelve []
 */
export function getScenesForExperiencia(list: Scene[], principalSceneId?: string | null): Scene[] {
  const arr = Array.isArray(list) ? list : [];
  return arr.filter((s) => {
    if (!s?.name?.trim()) return false;
    if (principalSceneId != null && s.id === principalSceneId) return false;
    if (/garaje|garage/i.test(s.name.trim())) return false;
    if (!s.backgroundUrl?.trim()) return false;
    return true;
  });
}

/** Convierte scene.positions (legacy) a Hotspot[] si no hay scene.hotspots */
export function sceneHotspots(scene: Scene | null | undefined): Hotspot[] {
  if (!scene) return [];
  if (Array.isArray(scene.hotspots)) return scene.hotspots;
  const pos = scene.positions;
  if (!pos || typeof pos !== 'object' || Array.isArray(pos)) return [];
  const out: Hotspot[] = [];
  for (const [slotId, slot] of Object.entries(pos)) {
    if (!slot?.vehicleId) continue;
    const t = slot.transform ?? { x: 0, y: 0 };
    out.push({
      id: `legacy-${slotId}-${slot.vehicleId}`,
      vehicleId: slot.vehicleId,
      x: Number(t.x) || 0,
      y: Number(t.y) || 0,
      createdAt: slot.updatedAt,
    });
  }
  return out;
}
