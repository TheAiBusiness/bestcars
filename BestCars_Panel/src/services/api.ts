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

  const res = await fetch(`${API}${endpoint}`, { ...init, headers });
  if (res.status === 401) {
    setStoredToken(null);
    throw new Error('Sesión expirada. Inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
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
