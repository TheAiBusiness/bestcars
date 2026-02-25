/**
 * Cliente API para el panel de administración.
 * Conecta con BestCars_Back-updated (vehículos, contactos, test-drive, auth).
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API = `${API_BASE}/api`;

const TOKEN_KEY = 'bestcars_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { skipAuth, ...init } = options ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  const token = getStoredToken();
  if (!skipAuth && token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API}${endpoint}`, { ...init, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new Error(msg === 'Failed to fetch' ? 'No se pudo conectar al servidor. Comprueba que el backend esté en marcha.' : msg);
  }
  if (res.status === 401) {
    setStoredToken(null);
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    throw new Error('Sesión expirada. Inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const text = await res.text();
    let err: { error?: string } = { error: 'Error desconocido' };
    try {
      err = JSON.parse(text);
    } catch {
      err = { error: text || `Error ${res.status}` };
    }
    throw new Error(err.error || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return JSON.parse(await res.text()) as T;
}

/** Login: devuelve el token JWT */
export async function login(username: string, password: string): Promise<{ token: string }> {
  const data = await fetchApi<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
  return data;
}

/** Obtener todos los vehículos */
export async function getVehicles(): Promise<ApiVehicle[]> {
  return fetchApi<ApiVehicle[]>('/vehicles');
}

/** Obtener un vehículo por ID */
export async function getVehicle(id: string): Promise<ApiVehicle> {
  return fetchApi<ApiVehicle>(`/vehicles/${id}`);
}

/** Crear vehículo */
export async function createVehicle(body: ApiVehicleCreate): Promise<ApiVehicle> {
  return fetchApi<ApiVehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Actualizar vehículo */
export async function updateVehicle(id: string, body: ApiVehicleUpdate): Promise<ApiVehicle> {
  return fetchApi<ApiVehicle>(`/vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Eliminar vehículo */
export async function deleteVehicle(id: string): Promise<void> {
  return fetchApi<void>(`/vehicles/${id}`, { method: 'DELETE' });
}

/** Obtener contactos (leads de formulario) */
export async function getContacts(): Promise<ApiContact[]> {
  return fetchApi<ApiContact[]>('/contact');
}

/** Actualizar contacto */
export async function updateContact(id: number, body: { status?: string; notes?: string }): Promise<ApiContact> {
  return fetchApi<ApiContact>(`/contact/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Obtener solicitudes de prueba de manejo */
export async function getTestDrives(): Promise<ApiTestDrive[]> {
  return fetchApi<ApiTestDrive[]>('/test-drive');
}

/** Actualizar solicitud de prueba de manejo */
export async function updateTestDrive(id: number, body: { status?: string; notes?: string }): Promise<ApiTestDrive> {
  return fetchApi<ApiTestDrive>(`/test-drive/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Obtener todas las escenas */
export async function getScenes(): Promise<ApiScene[]> {
  return fetchApi<ApiScene[]>('/scenes');
}

/** Obtener escena activa (para la web) */
export async function getActiveScene(): Promise<ApiScene | null> {
  return fetchApi<ApiScene | null>('/scenes/active');
}

/** Crear escena */
export async function createScene(body: ApiSceneCreate): Promise<ApiScene> {
  return fetchApi<ApiScene>('/scenes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Actualizar escena */
export async function updateScene(id: string, body: ApiSceneUpdate): Promise<ApiScene> {
  return fetchApi<ApiScene>(`/scenes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Activar escena (mostrar en la web) */
export async function setActiveScene(id: string): Promise<ApiScene> {
  return fetchApi<ApiScene>(`/scenes/${id}/activate`, {
    method: 'PATCH',
  });
}

/** Eliminar escena */
export async function deleteScene(id: string): Promise<void> {
  return fetchApi<void>(`/scenes/${id}`, { method: 'DELETE' });
}

// Tipos de la API
export interface ApiVehicle {
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
  specifications?: {
    general?: { key: string; value: string }[];
    motor?: { key: string; value: string }[];
    seguridad?: { key: string; value: string }[];
    tecnologia?: { key: string; value: string }[];
  } | null;
  status?: string;
  priority?: number;
  views?: number;
  clicks?: number;
  leads?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiVehicleCreate {
  title: string;
  year: number;
  mileage: string;
  price: string;
  priceSubtext?: string;
  fuelType?: string;
  seats?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  status?: string;
  specifications?: Record<string, { key: string; value: string }[]>;
}

export type ApiVehicleUpdate = Partial<ApiVehicleCreate>;

export interface ApiContact {
  id: number;
  vehicleId: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTestDrive {
  id: number;
  vehicleId: string | null;
  name: string;
  age: string;
  lastVehicle: string;
  interests: string;
  mainUse: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiScene {
  id: string;
  name: string;
  backgroundUrl: string;
  positions: Record<string, { vehicleId: string | null; transform: { x: number; y: number; scale: number; rotation: number }; updatedAt: string }>;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSceneCreate {
  name: string;
  backgroundUrl?: string;
  positions?: Record<string, unknown>;
  isActive?: boolean;
}

export type ApiSceneUpdate = Partial<ApiSceneCreate>;
