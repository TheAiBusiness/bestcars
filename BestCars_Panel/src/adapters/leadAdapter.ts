/**
 * Adapta contactos y test-drives de la API al formato Lead del Panel.
 */
import type { Lead } from '../app/data/mock-data';
import type { ApiContact, ApiTestDrive } from '../services/api';

function mapApiStatusToLead(status: string): Lead['status'] {
  const m: Record<string, Lead['status']> = {
    new: 'nuevo',
    nuevo: 'nuevo',
    contacted: 'contactado',
    contactado: 'contactado',
    follow_up: 'seguimiento',
    seguimiento: 'seguimiento',
    converted: 'convertido',
    convertido: 'convertido',
    lost: 'perdido',
    perdido: 'perdido',
  };
  return m[status?.toLowerCase() ?? ''] ?? 'nuevo';
}

/** Convierte un contacto de la API a Lead del Panel */
export function apiContactToLead(c: ApiContact): Lead {
  return {
    id: `contact-${c.id}`,
    vehicleId: c.vehicleId ?? '',
    name: c.name,
    email: c.email,
    phone: c.phone ?? '',
    origin: 'web',
    status: mapApiStatusToLead(c.status),
    notes: c.notes ?? c.message ?? '',
    date: c.createdAt,
  };
}

/** Convierte una solicitud de test-drive a Lead del Panel */
export function apiTestDriveToLead(t: ApiTestDrive): Lead {
  return {
    id: `testdrive-${t.id}`,
    vehicleId: t.vehicleId ?? '',
    name: t.name,
    email: '', // TestDrive no tiene email en el schema
    phone: '',
    origin: 'web',
    status: mapApiStatusToLead(t.status),
    notes: `Prueba de manejo. Último vehículo: ${t.lastVehicle ?? ''}. Intereses: ${t.interests ?? ''}. Uso principal: ${t.mainUse ?? ''}. Edad: ${t.age ?? ''}. ${t.notes ?? ''}`.trim(),
    date: t.createdAt,
  };
}

/** Mapea status del Panel al de la API */
export function leadStatusToApi(status: Lead['status']): string {
  const m: Record<Lead['status'], string> = {
    nuevo: 'new',
    contactado: 'contacted',
    seguimiento: 'follow_up',
    convertido: 'converted',
    perdido: 'lost',
  };
  return m[status] ?? 'new';
}
