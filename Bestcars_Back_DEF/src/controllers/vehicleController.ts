/**
 * Controlador de vehículos
 * Usa Prisma + Supabase si DATABASE_URL está configurada, sino datos mock
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';
import { mockVehicles } from '../data/mockVehicles.js';

const useDatabase = Boolean(process.env.DATABASE_URL);

/** Formatea vehículo para la API (frontend espera createdAt/updatedAt como string ISO) */
function formatVehicle(vehicle: {
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
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...vehicle,
    priceSubtext: vehicle.priceSubtext ?? undefined,
    fuelType: vehicle.fuelType ?? undefined,
    seats: vehicle.seats ?? undefined,
    description: vehicle.description ?? undefined,
    specifications: vehicle.specifications ?? undefined,
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString(),
  };
}

/**
 * GET /api/vehicles
 */
export const getAllVehicles = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (useDatabase) {
      const vehicles = await prisma.vehicle.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json(vehicles.map(formatVehicle));
      return;
    }
    res.json(
      mockVehicles.map((v) => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('[vehicleController] Error fetching vehicles:', error);
    if (useDatabase) {
      res.status(500).json({ error: 'Failed to fetch vehicles. Run: npx prisma db push' });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch vehicles' });
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
      res.json(formatVehicle(vehicle));
      return;
    }

    const vehicle = mockVehicles.find((v) => v.id === id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json({
      ...vehicle,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[vehicleController] Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};
