/**
 * Controlador de vehículos
 * Usa Prisma + Supabase si DATABASE_URL está configurada, sino datos mock en memoria
 */

import { type Request, type Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { mockVehicles, type MockVehicle } from '../data/mockVehicles.js';
import { normalizePrice } from '../utils/priceUtils.js';

const useDatabase = Boolean(process.env.DATABASE_URL);

/** Copia mutable para modo MOCK: create/update/delete sin DATABASE_URL */
function getInMemoryVehicles(): MockVehicle[] {
  const key = '__inMemoryVehicles';
  const g = globalThis as unknown as { [k: string]: MockVehicle[] };
  if (!g[key]) {
    g[key] = JSON.parse(JSON.stringify(mockVehicles)).map((v: MockVehicle & { createdAt: string; updatedAt: string }) => ({
      ...v,
      createdAt: new Date(v.createdAt),
      updatedAt: new Date(v.updatedAt),
    }));
  }
  return g[key];
}

interface VehicleCreateBody {
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
  specifications?: Record<string, { key: string; value: string }[]>;
  status?: string;
}

function generateVehicleId(): string {
  return `vehicle_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** Formatea vehículo para la API (frontend espera createdAt/updatedAt como string ISO) */
function formatVehicle(
  vehicle: {
    id: string;
    title: string;
    year: number;
    mileage: string;
    price: string;
    priceSubtext: string | null;
    fuelType: string | null;
    seats: string | null;
    description: string | null;
    images: string[];
    tags: string[];
    specifications: unknown;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
  },
  enrichment?: { leads?: number; views?: number; clicks?: number; status?: string; priority?: number }
) {
  const status = (vehicle as { status?: string }).status ?? enrichment?.status ?? 'available';
  return {
    ...vehicle,
    priceSubtext: vehicle.priceSubtext ?? undefined,
    fuelType: vehicle.fuelType ?? undefined,
    seats: vehicle.seats ?? undefined,
    description: vehicle.description ?? undefined,
    specifications: vehicle.specifications ?? undefined,
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString(),
    leads: enrichment?.leads ?? 0,
    views: enrichment?.views ?? 0,
    clicks: enrichment?.clicks ?? 0,
    status,
    priority: enrichment?.priority ?? 0,
  };
}

/**
 * Obtiene el número de leads por vehicleId (contact + test-drive) para estadísticas.
 */
async function getLeadCountsByVehicleId(): Promise<Record<string, number>> {
  const [contactCounts, testDriveCounts] = await Promise.all([
    prisma.contactSubmission.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { not: null } },
      _count: { id: true },
    }),
    prisma.testDriveSubmission.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { not: null } },
      _count: { id: true },
    }),
  ]);
  const map: Record<string, number> = {};
  for (const row of contactCounts) {
    if (row.vehicleId) map[row.vehicleId] = (map[row.vehicleId] ?? 0) + row._count.id;
  }
  for (const row of testDriveCounts) {
    if (row.vehicleId) map[row.vehicleId] = (map[row.vehicleId] ?? 0) + row._count.id;
  }
  return map;
}

/**
 * GET /api/vehicles
 */
export const getAllVehicles = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (useDatabase) {
      const [vehicles, leadCounts] = await Promise.all([
        prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } }),
        getLeadCountsByVehicleId(),
      ]);
      const vWithStats = (v: { id: string; views?: number; clicks?: number; status?: string }) => ({
        views: (v as { views?: number }).views ?? 0,
        clicks: (v as { clicks?: number }).clicks ?? 0,
        status: (v as { status?: string }).status ?? 'available',
      });
      res.json(
        vehicles.map((v, i) =>
          formatVehicle(v, {
            leads: leadCounts[v.id] ?? 0,
            views: vWithStats(v).views,
            clicks: vWithStats(v).clicks,
            status: vWithStats(v).status,
            priority: i + 1,
          })
        )
      );
      return;
    }
    res.json(
      getInMemoryVehicles().map((v) => ({
        ...v,
        status: v.status ?? 'available',
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('[vehicleController] Error fetching vehicles:', error);
    if (useDatabase) {
      res.status(200).json([]);
      return;
    }
    res.status(500).json({
      error: { message: 'Failed to fetch vehicles', code: 'INTERNAL_ERROR' },
    });
  }
};

/**
 * POST /api/vehicles/:id/track - Registrar vista o clic desde la web (público, sin auth).
 * Body: { type: 'view' | 'click' }
 */
export const trackVehicle = async (req: Request, res: Response): Promise<void> => {
  if (!useDatabase) {
    res.status(204).send();
    return;
  }
  try {
    const { id } = req.params;
    const type = (req.body?.type ?? '').toString().toLowerCase();
    if (!id || (type !== 'view' && type !== 'click')) {
      res.status(400).json({ error: 'Invalid request. Body: { type: "view" | "click" }' });
      return;
    }
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      res.status(204).send();
      return;
    }
    const currentViews = (vehicle as { views?: number }).views ?? 0;
    const currentClicks = (vehicle as { clicks?: number }).clicks ?? 0;
    if (type === 'view') {
      await prisma.vehicle.update({
        where: { id },
        data: { views: currentViews + 1 },
      });
    } else {
      await prisma.vehicle.update({
        where: { id },
        data: { clicks: currentClicks + 1 },
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('[vehicleController] Error tracking vehicle:', error);
    res.status(500).json({ error: 'Failed to track' });
  }
};

/**
 * GET /api/vehicles/:id
 */
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (useDatabase) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id } });
      if (!vehicle) {
        res.status(404).json({ error: 'Vehicle not found' });
        return;
      }
      const [contactCount, testDriveCount] = await Promise.all([
        prisma.contactSubmission.count({ where: { vehicleId: id } }),
        prisma.testDriveSubmission.count({ where: { vehicleId: id } }),
      ]);
      const views = (vehicle as { views?: number }).views ?? 0;
      const clicks = (vehicle as { clicks?: number }).clicks ?? 0;
      const status = (vehicle as { status?: string }).status ?? 'available';
      res.json(
        formatVehicle(vehicle, {
          leads: contactCount + testDriveCount,
          views,
          clicks,
          status,
          priority: 0,
        })
      );
      return;
    }

    const vehicle = getInMemoryVehicles().find((v) => v.id === id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json({
      ...vehicle,
      status: vehicle.status ?? 'available',
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[vehicleController] Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

/**
 * POST /api/vehicles - Crear vehículo. Requiere auth. Con DATABASE_URL persiste en DB; sin ella usa memoria.
 */
export const createVehicle = async (
  req: Request<object, object, VehicleCreateBody>,
  res: Response
): Promise<void> => {
  const body = req.body ?? {};
  const title = String(body.title ?? '').trim();
  const year = Number(body.year);
  const mileage = String(body.mileage ?? '').trim();
  const rawPrice = String(body.price ?? '').trim();
  if (!title || !mileage || !rawPrice) {
    res.status(400).json({ error: 'title, mileage and price are required' });
    return;
  }
  const price = normalizePrice(rawPrice);
  if (Number.isNaN(year) || year < 1900 || year > 2100) {
    res.status(400).json({
      error: {
        message: 'year must be a valid number between 1900 and 2100',
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  if (!useDatabase) {
    const now = new Date();
    const newVehicle: MockVehicle = {
      id: generateVehicleId(),
      title,
      year,
      mileage,
      price,
      priceSubtext: body.priceSubtext?.trim() || undefined,
      fuelType: body.fuelType?.trim() || undefined,
      seats: body.seats?.trim() || undefined,
      description: body.description?.trim() || undefined,
      images: Array.isArray(body.images) ? body.images : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      specifications: (body.specifications as unknown as MockVehicle['specifications']) ?? { general: [], motor: [], seguridad: [], tecnologia: [] },
      status: (body.status as string)?.trim() || 'available',
      createdAt: now,
      updatedAt: now,
    };
    getInMemoryVehicles().unshift(newVehicle);
    res.status(201).json({
      ...newVehicle,
      createdAt: newVehicle.createdAt.toISOString(),
      updatedAt: newVehicle.updatedAt.toISOString(),
    });
    return;
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        id: generateVehicleId(),
        title,
        year,
        mileage,
        price,
        priceSubtext: body.priceSubtext?.trim() || null,
        fuelType: body.fuelType?.trim() || null,
        seats: body.seats?.trim() || null,
        description: body.description?.trim() || null,
        images: Array.isArray(body.images) ? body.images : [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        specifications: body.specifications ?? undefined,
        status: (body.status as string)?.trim() || 'available',
      },
    });
    res.status(201).json(formatVehicle(vehicle));
  } catch (error) {
    console.error('[vehicleController] Error creating vehicle:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create vehicle',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * PATCH /api/vehicles/:id - Actualizar vehículo. Requiere auth. Con DATABASE_URL persiste en DB; sin ella usa memoria.
 */
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const body = req.body ?? {};
  const data: Partial<MockVehicle> = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.year !== undefined) {
    const y = Number(body.year);
    if (!Number.isNaN(y) && y >= 1900 && y <= 2100) data.year = y;
  }
  if (body.mileage !== undefined) data.mileage = String(body.mileage).trim();
  if (body.price !== undefined) data.price = normalizePrice(String(body.price).trim());
  if (body.priceSubtext !== undefined) data.priceSubtext = body.priceSubtext?.trim() || undefined;
  if (body.fuelType !== undefined) data.fuelType = body.fuelType?.trim() || undefined;
  if (body.seats !== undefined) data.seats = body.seats?.trim() || undefined;
  if (body.description !== undefined) data.description = body.description?.trim() || undefined;
  if (body.images !== undefined) data.images = Array.isArray(body.images) ? body.images : [];
  if (body.tags !== undefined) data.tags = Array.isArray(body.tags) ? body.tags : [];
  if (body.specifications !== undefined) data.specifications = body.specifications as MockVehicle['specifications'];
  if (body.status !== undefined) data.status = String(body.status).trim() || 'available';

  if (!useDatabase) {
    const list = getInMemoryVehicles();
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) {
      res.status(404).json({
        error: {
          message: 'Vehicle not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    const now = new Date();
    const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Partial<MockVehicle>;
    const updated: MockVehicle = { ...list[idx], ...cleanData, updatedAt: now };
    list[idx] = updated;
    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
    return;
  }

  try {
    const updatePayload = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.year !== undefined && { year: data.year }),
      ...(data.mileage !== undefined && { mileage: data.mileage }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.priceSubtext !== undefined && { priceSubtext: data.priceSubtext }),
      ...(data.fuelType !== undefined && { fuelType: data.fuelType }),
      ...(data.seats !== undefined && { seats: data.seats }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.specifications !== undefined && { specifications: data.specifications as unknown as Prisma.InputJsonValue }),
      ...(data.status !== undefined && { status: data.status }),
    } as Prisma.VehicleUpdateInput;
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updatePayload,
    });
    res.json(formatVehicle(vehicle));
  } catch (error) {
    console.error('[vehicleController] Error updating vehicle:', error);
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({
        error: {
          message: 'Vehicle not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    res.status(500).json({
      error: {
        message: 'Failed to update vehicle',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * DELETE /api/vehicles/:id - Eliminar vehículo. Requiere auth. Con DATABASE_URL persiste en DB; sin ella usa memoria.
 */
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!useDatabase) {
    const list = getInMemoryVehicles();
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) {
      res.status(404).json({
        error: {
          message: 'Vehicle not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    list.splice(idx, 1);
    res.status(204).send();
    return;
  }

  try {
    await prisma.vehicle.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('[vehicleController] Error deleting vehicle:', error);
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({
        error: {
          message: 'Vehicle not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    res.status(500).json({
      error: {
        message: 'Failed to delete vehicle',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};
