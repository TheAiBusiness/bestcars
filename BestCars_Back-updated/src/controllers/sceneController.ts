import { type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getAllScenes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const scenes = await prisma.scene.findMany({
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });
    res.json(scenes);
  } catch (error) {
    console.error('Error fetching scenes:', error);
    res.status(500).json({ error: 'Failed to fetch scenes' });
  }
};

export const getActiveScene = async (_req: Request, res: Response): Promise<void> => {
  try {
    const scene = await prisma.scene.findFirst({
      where: { isActive: true },
    });
    res.json(scene ?? null);
  } catch (error) {
    console.error('Error fetching active scene:', error);
    res.status(500).json({ error: 'Failed to fetch active scene' });
  }
};

export const getSceneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const scene = await prisma.scene.findUnique({ where: { id } });
    if (!scene) {
      res.status(404).json({ error: 'Scene not found' });
      return;
    }
    res.json(scene);
  } catch (error) {
    console.error('Error fetching scene:', error);
    res.status(500).json({ error: 'Failed to fetch scene' });
  }
};

export const createScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, backgroundUrl, positions, isActive } = req.body ?? {};
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const positionsData = positions ?? {};
    const scene = await prisma.scene.create({
      data: {
        name: String(name),
        backgroundUrl: String(backgroundUrl ?? ''),
        positions: positionsData,
        isActive: Boolean(isActive),
      },
    });
    res.status(201).json(scene);
  } catch (error) {
    console.error('Error creating scene:', error);
    res.status(500).json({ error: 'Failed to create scene' });
  }
};

export const updateScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, backgroundUrl, positions, isActive } = req.body ?? {};

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = String(name);
    if (backgroundUrl !== undefined) updateData.backgroundUrl = String(backgroundUrl);
    if (positions !== undefined) updateData.positions = positions;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const scene = await prisma.scene.update({
      where: { id },
      data: updateData,
    });
    res.json(scene);
  } catch (error) {
    console.error('Error updating scene:', error);
    res.status(500).json({ error: 'Failed to update scene' });
  }
};

export const setActiveScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.$transaction([
      prisma.scene.updateMany({ data: { isActive: false } }),
      prisma.scene.update({ where: { id }, data: { isActive: true } }),
    ]);

    const scene = await prisma.scene.findUnique({ where: { id } });
    res.json(scene);
  } catch (error) {
    console.error('Error setting active scene:', error);
    res.status(500).json({ error: 'Failed to set active scene' });
  }
};

export const deleteScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.scene.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting scene:', error);
    res.status(500).json({ error: 'Failed to delete scene' });
  }
};
