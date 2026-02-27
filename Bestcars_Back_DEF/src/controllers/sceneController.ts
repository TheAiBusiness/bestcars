/**
 * Controlador de escenas (editor del panel).
 * Persiste en PostgreSQL si DATABASE_URL está configurada; si no, usa memoria.
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';

const useDatabase = Boolean(process.env.DATABASE_URL);

interface ScenePosition {
  vehicleId: string | null;
  transform: { x: number; y: number; scale: number; rotation: number };
  updatedAt: string;
}

const defaultPositions: Record<string, ScenePosition> = {
  'parking-1': { vehicleId: null, transform: { x: 0, y: 0, scale: 1, rotation: 0 }, updatedAt: new Date().toISOString() },
  'parking-2': { vehicleId: null, transform: { x: 0, y: 0, scale: 1, rotation: 0 }, updatedAt: new Date().toISOString() },
  'parking-3': { vehicleId: null, transform: { x: 0, y: 0, scale: 1, rotation: 0 }, updatedAt: new Date().toISOString() },
  rampa: { vehicleId: null, transform: { x: 0, y: 0, scale: 1, rotation: 0 }, updatedAt: new Date().toISOString() },
  'parking-4': { vehicleId: null, transform: { x: 0, y: 0, scale: 1, rotation: 0 }, updatedAt: new Date().toISOString() },
};

function sceneToJson(s: { id: string; name: string; backgroundUrl: string; positions: unknown; isActive: boolean; order: number; createdAt: Date; updatedAt: Date }) {
  return {
    id: s.id,
    name: s.name,
    backgroundUrl: s.backgroundUrl,
    positions: (s.positions as Record<string, ScenePosition>) ?? defaultPositions,
    isActive: s.isActive,
    order: s.order,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// ——— En memoria (fallback sin DB) ———
interface InMemoryScene {
  id: string;
  name: string;
  backgroundUrl: string;
  positions: Record<string, ScenePosition>;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
const inMemoryScenes: InMemoryScene[] = [];
let activeSceneId: string | null = null;

function nextId(): string {
  return `scene_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
function nowIso(): string {
  return new Date().toISOString();
}

export const getAllScenes = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (useDatabase) {
      const scenes = await prisma.scene.findMany({
        orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      });
      res.json(scenes.map(sceneToJson));
      return;
    }
    const ordered = [...inMemoryScenes].sort((a, b) => a.order - b.order);
    res.json(ordered);
  } catch (error) {
    console.error('[sceneController] Error fetching scenes:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch scenes',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const getActiveScene = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (useDatabase) {
      const scene = await prisma.scene.findFirst({
        where: { isActive: true },
      });
      res.json(scene ? sceneToJson(scene) : null);
      return;
    }
    const scene = activeSceneId
      ? inMemoryScenes.find((s) => s.id === activeSceneId)
      : inMemoryScenes.find((s) => s.isActive);
    res.json(scene ?? null);
  } catch (error) {
    console.error('[sceneController] Error fetching active scene:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch active scene',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const getSceneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (useDatabase) {
      const scene = await prisma.scene.findUnique({ where: { id } });
      if (!scene) {
        res.status(404).json({
          error: {
            message: 'Scene not found',
            code: 'NOT_FOUND',
          },
        });
        return;
      }
      res.json(sceneToJson(scene));
      return;
    }
    const scene = inMemoryScenes.find((s) => s.id === id);
    if (!scene) {
      res.status(404).json({
        error: {
          message: 'Scene not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    res.json(scene);
  } catch (error) {
    console.error('[sceneController] Error fetching scene:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch scene',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const createScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, backgroundUrl, positions, isActive } = req.body ?? {};
    const nameStr = String(name ?? 'Escena').trim() || 'Escena';
    const bgUrl = String(backgroundUrl ?? '');
    const pos = typeof positions === 'object' && positions !== null ? { ...defaultPositions, ...positions } : { ...defaultPositions };

    if (useDatabase) {
      if (isActive) {
        await prisma.scene.updateMany({ data: { isActive: false } });
      }
      const count = await prisma.scene.count();
      const scene = await prisma.scene.create({
        data: {
          name: nameStr,
          backgroundUrl: bgUrl,
          positions: pos as object,
          isActive: Boolean(isActive),
          order: count,
        },
      });
      res.status(201).json(sceneToJson(scene));
      return;
    }

    const scene: InMemoryScene = {
      id: nextId(),
      name: nameStr,
      backgroundUrl: bgUrl,
      positions: pos,
      isActive: Boolean(isActive),
      order: inMemoryScenes.length,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    inMemoryScenes.push(scene);
    if (scene.isActive) {
      inMemoryScenes.forEach((s) => (s.isActive = s.id === scene.id));
      activeSceneId = scene.id;
    }
    res.status(201).json(scene);
  } catch (error) {
    console.error('[sceneController] Error creating scene:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create scene',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const updateScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, backgroundUrl, positions, isActive } = req.body ?? {};

    if (useDatabase) {
      const updateData: { name?: string; backgroundUrl?: string; positions?: object; isActive?: boolean } = {};
      if (name !== undefined) updateData.name = String(name).trim();
      if (backgroundUrl !== undefined) updateData.backgroundUrl = String(backgroundUrl);
      if (positions !== undefined && typeof positions === 'object') updateData.positions = positions as object;
      if (isActive !== undefined) {
        updateData.isActive = Boolean(isActive);
        if (isActive) await prisma.scene.updateMany({ data: { isActive: false } });
      }
      const scene = await prisma.scene.update({
        where: { id },
        data: updateData,
      });
      res.json(sceneToJson(scene));
      return;
    }

    const index = inMemoryScenes.findIndex((s) => s.id === id);
    if (index === -1) {
      res.status(404).json({
        error: {
          message: 'Scene not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    const prev = inMemoryScenes[index];
    const updated: InMemoryScene = {
      ...prev,
      ...(name !== undefined && { name: String(name).trim() || prev.name }),
      ...(backgroundUrl !== undefined && { backgroundUrl: String(backgroundUrl) }),
      ...(positions !== undefined && typeof positions === 'object' && { positions: { ...prev.positions, ...positions } }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      updatedAt: nowIso(),
    };
    inMemoryScenes[index] = updated;
    if (updated.isActive) {
      inMemoryScenes.forEach((s) => (s.isActive = s.id === id));
      activeSceneId = id;
    }
    res.json(updated);
  } catch (error) {
    console.error('[sceneController] Error updating scene:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update scene',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const setActiveScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (useDatabase) {
      await prisma.$transaction([
        prisma.scene.updateMany({ data: { isActive: false } }),
        prisma.scene.update({ where: { id }, data: { isActive: true } }),
      ]);
      const scene = await prisma.scene.findUnique({ where: { id } });
      if (!scene) {
        res.status(404).json({ error: 'Scene not found' });
        return;
      }
      res.json(sceneToJson(scene));
      return;
    }

    const index = inMemoryScenes.findIndex((s) => s.id === id);
    if (index === -1) {
      res.status(404).json({
        error: {
          message: 'Scene not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    inMemoryScenes.forEach((s) => {
      s.isActive = s.id === id;
      if (s.id === id) s.updatedAt = nowIso();
    });
    activeSceneId = id;
    res.json(inMemoryScenes[index]);
  } catch (error) {
    console.error('[sceneController] Error setting active scene:', error);
    res.status(500).json({
      error: {
        message: 'Failed to set active scene',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const deleteScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (useDatabase) {
      await prisma.scene.delete({ where: { id } });
      res.status(204).send();
      return;
    }

    const index = inMemoryScenes.findIndex((s) => s.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Scene not found' });
      return;
    }
    inMemoryScenes.splice(index, 1);
    if (activeSceneId === id) {
      activeSceneId = inMemoryScenes.length > 0 ? inMemoryScenes[0].id : null;
      if (activeSceneId) {
        const active = inMemoryScenes.find((s) => s.id === activeSceneId);
        if (active) active.isActive = true;
      }
    }
    res.status(204).send();
  } catch (error) {
    console.error('[sceneController] Error deleting scene:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete scene',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};
