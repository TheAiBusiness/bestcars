import { type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { VehicleSpecifications, VehicleUpdateBody } from '../types/vehicle.js';

type SpecsInput = VehicleSpecifications;

function groupSpecifications(
  specs: Array<{ key: string; value: string; order: number; category: { name: string } }>
): VehicleSpecifications {
  const base: VehicleSpecifications = { general: [], motor: [], seguridad: [], tecnologia: [] };
  for (const s of specs) {
    const cat = s.category.name as keyof VehicleSpecifications;
    if (!base[cat]) continue;
    base[cat].push({ key: s.key, value: s.value });
  }
  return base;
}

async function ensureCategories(): Promise<Map<string, string>> {
  const desired = [
    { name: 'general', displayName: 'General', icon: 'Settings', order: 1 },
    { name: 'motor', displayName: 'Motor', icon: 'Zap', order: 2 },
    { name: 'seguridad', displayName: 'Seguridad', icon: 'Shield', order: 3 },
    { name: 'tecnologia', displayName: 'Tecnología', icon: 'Cpu', order: 4 },
  ];

  const existing = await prisma.specificationCategory.findMany({});
  const byName = new Map(existing.map(c => [c.name, c.id] as const));

  for (const c of desired) {
    if (!byName.has(c.name)) {
      const created = await prisma.specificationCategory.create({ data: c });
      byName.set(created.name, created.id);
    }
  }
  return byName;
}

function pickUpdatableVehicleFields(body: VehicleUpdateBody | Record<string, unknown>) {
  const {
    title,
    year,
    mileage,
    price,
    priceSubtext,
    fuelType,
    seats,
    description,
    images,
    tags,
    status,
    priority,
    views,
    clicks,
    leads,
  } = body ?? {};

  return {
    ...(title !== undefined && { title: String(title) }),
    ...(year !== undefined && { year: Number(year) }),
    ...(mileage !== undefined && { mileage: String(mileage) }),
    ...(price !== undefined && { price: String(price) }),
    ...(priceSubtext !== undefined && { priceSubtext: priceSubtext === null ? null : String(priceSubtext) }),
    ...(fuelType !== undefined && { fuelType: fuelType === null ? null : String(fuelType) }),
    ...(seats !== undefined && { seats: seats === null ? null : String(seats) }),
    ...(description !== undefined && { description: description === null ? null : String(description) }),
    ...(images !== undefined && { images: Array.isArray(images) ? images.map(String) : [] }),
    ...(tags !== undefined && { tags: Array.isArray(tags) ? tags.map(String) : [] }),
    ...(status !== undefined && { status: String(status) }),
    ...(priority !== undefined && { priority: Number(priority) }),
    ...(views !== undefined && { views: Number(views) }),
    ...(clicks !== undefined && { clicks: Number(clicks) }),
    ...(leads !== undefined && { leads: Number(leads) }),
  };
}

export const getAllVehicles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      include: {
        specifications: {
          orderBy: { order: 'asc' },
          include: { category: true },
        },
      },
    });

    const payload = vehicles.map(v => ({
      ...v,
      specifications: groupSpecifications(v.specifications),
    }));

    res.json(payload);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        specifications: {
          orderBy: { order: 'asc' },
          include: { category: true },
        },
      },
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    res.json({ ...vehicle, specifications: groupSpecifications(vehicle.specifications) });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body ?? {};
    const specs = (body.specifications ?? null) as SpecsInput | null;

    if (!body.title || body.year === undefined || !body.mileage || !body.price) {
      res.status(400).json({ error: 'title, year, mileage and price are required' });
      return;
    }

    const categoryMap = await ensureCategories();

    const updatable = pickUpdatableVehicleFields(body);
    const created = await prisma.vehicle.create({
      data: {
        ...updatable,
        title: String(body.title),
        year: Number(body.year),
        mileage: String(body.mileage),
        price: String(body.price),
        images: Array.isArray(body.images) ? body.images.map(String) : [],
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      },
    });

    if (specs) {
      const specRows: Array<{ vehicleId: string; categoryId: string; key: string; value: string; order: number }> = [];
      (Object.keys(specs) as Array<keyof VehicleSpecifications>).forEach(cat => {
        const categoryId = categoryMap.get(cat);
        if (!categoryId) return;
        specs[cat].forEach((item, idx) => {
          specRows.push({
            vehicleId: created.id,
            categoryId,
            key: String(item.key),
            value: String(item.value),
            order: idx,
          });
        });
      });
      if (specRows.length) {
        await prisma.specification.createMany({ data: specRows });
      }
    }

    const withSpecs = await prisma.vehicle.findUnique({
      where: { id: created.id },
      include: { specifications: { orderBy: { order: 'asc' }, include: { category: true } } },
    });

    res.status(201).json({ ...withSpecs, specifications: groupSpecifications(withSpecs?.specifications ?? []) });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};
    const specs = (body.specifications ?? undefined) as SpecsInput | undefined;

    const updated = await prisma.vehicle.update({
      where: { id },
      data: pickUpdatableVehicleFields(body),
    });

    if (specs) {
      const categoryMap = await ensureCategories();
      await prisma.specification.deleteMany({ where: { vehicleId: id } });

      const specRows: Array<{ vehicleId: string; categoryId: string; key: string; value: string; order: number }> = [];
      (Object.keys(specs) as Array<keyof VehicleSpecifications>).forEach(cat => {
        const categoryId = categoryMap.get(cat);
        if (!categoryId) return;
        specs[cat].forEach((item, idx) => {
          specRows.push({
            vehicleId: updated.id,
            categoryId,
            key: String(item.key),
            value: String(item.value),
            order: idx,
          });
        });
      });
      if (specRows.length) {
        await prisma.specification.createMany({ data: specRows });
      }
    }

    const withSpecs = await prisma.vehicle.findUnique({
      where: { id },
      include: { specifications: { orderBy: { order: 'asc' }, include: { category: true } } },
    });

    res.json({ ...withSpecs, specifications: groupSpecifications(withSpecs?.specifications ?? []) });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};
