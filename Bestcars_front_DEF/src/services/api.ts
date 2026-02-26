import type { Vehicle, ContactFormData, ContactSubmissionResponse, TestDriveFormData, TestDriveSubmissionResponse } from '../types/vehicle.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, errorData.error || `HTTP error! status: ${response.status}`);
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
   * Normaliza la respuesta para que images y tags sean siempre arrays.
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    const raw = await fetchApi<Vehicle>(`/api/vehicles/${id}`);
    return {
      ...raw,
      images: Array.isArray(raw.images) ? raw.images : [],
      tags: Array.isArray(raw.tags) ? raw.tags : [],
    };
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
   * Get active scene (for homepage/garage composition)
   */
  async getActiveScene(): Promise<Scene | null> {
    return fetchApi<Scene | null>('/api/scenes/active');
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

export interface Scene {
  id: string;
  name: string;
  backgroundUrl: string;
  positions: Record<string, ScenePosition>;
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
