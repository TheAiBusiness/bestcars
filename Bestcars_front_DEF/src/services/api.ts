import type { Vehicle, ContactFormData, ContactSubmissionResponse, TestDriveFormData, TestDriveSubmissionResponse } from '../types/vehicle.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
   * Get all vehicles
   */
  async getAllVehicles(): Promise<Vehicle[]> {
    return fetchApi<Vehicle[]>('/api/vehicles');
  },

  /**
   * Get a single vehicle by ID
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    return fetchApi<Vehicle>(`/api/vehicles/${id}`);
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
};
