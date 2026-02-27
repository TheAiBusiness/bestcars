/**
 * Controlador de escenas (editor del panel).
 * Modelo: hotspots ilimitados. En DB se guarda en positions (Json), pero la API siempre expone hotspots[] normalizado.
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';
import { normalizeScene } from '../utils/sceneNormalize.js';

const useDatabase = Boolean(process.env.DATABASE_URL);

/** Hotspot: un coche colocado en la escena (x,y en px respecto al centro). Opcional: label. */
export interface Hotspot {
  id: string;
  vehicleId: string;
  x: number;
  y: number;
  createdAt?: string;
  label?: string;
}

/** Convierte positions/hotspots a array de hotspots para la API/persistencia */
function normalizePositionsToHotspots(raw: unknown): Hotspot[] {
  const normalized = normalizeScene({
    hotspots: Array.isArray(raw) ? raw : undefined,
    positions: !Array.isArray(raw) ? raw : undefined,
  });
  return normalized.hotspots as Hotspot[];
}

/** Acepta body con hotspots[] (nuevo) o positions (legacy); devuelve array para guardar en positions */
function normalizePayloadToHotspots(body: Record<string, unknown>): Hotspot[] {
  const normalized = normalizeScene({
    hotspots: (body as any).hotspots,
    positions: (body as any).positions,
  });
  return normalized.hotspots as Hotspot[];
}

function sceneToJson(s: { id: string; name: string; backgroundUrl: string; positions: unknown; isActive: boolean; order: number; createdAt: Date; updatedAt: Date }) {
  const normalized = normalizeScene({
    id: s.id,
    name: s.name,
    backgroundUrl: s.backgroundUrl,
    hotspots: s.positions,
    positions: s.positions,
  });
  return {
    id: normalized.id || s.id,
    name: normalized.name || s.name,
    backgroundUrl: normalized.backgroundUrl || s.backgroundUrl,
    hotspots: normalized.hotspots,
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
  positions: Hotspot[];
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
    res.json(ordered.map(inMemorySceneToJson));
  } catch (error) {
    console.error('[sceneController] Error fetching scenes:', error);
    if (useDatabase) {
      res.status(200).json([]);
      return;
    }
    res.status(500).json({
      error: { message: 'Failed to fetch scenes', code: 'INTERNAL_ERROR' },
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
    res.json(scene ? inMemorySceneToJson(scene) : null);
  } catch (error) {
    console.error('[sceneController] Error fetching active scene:', error);
    if (useDatabase) {
      res.status(200).json(null);
      return;
    }
    res.status(500).json({
      error: { message: 'Failed to fetch active scene', code: 'INTERNAL_ERROR' },
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
            code: 'SCENE_NOT_FOUND',
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
          code: 'SCENE_NOT_FOUND',
        },
      });
      return;
    }
    res.json(inMemorySceneToJson(scene));
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

function inMemorySceneToJson(s: InMemoryScene) {
  const normalized = normalizeScene({
    id: s.id,
    name: s.name,
    backgroundUrl: s.backgroundUrl,
    hotspots: s.positions,
    positions: s.positions,
  });
  return {
    id: normalized.id || s.id,
    name: normalized.name || s.name,
    backgroundUrl: normalized.backgroundUrl || s.backgroundUrl,
    hotspots: normalized.hotspots,
    isActive: s.isActive,
    order: s.order,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const createScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const nameStr = String(body.name ?? 'Escena').trim() || 'Escena';
    const bgUrl = String(body.backgroundUrl ?? '');
    const hotspots = normalizePayloadToHotspots(body);
    const isActive = Boolean(body.isActive);

    if (useDatabase) {
      if (isActive) {
        await prisma.scene.updateMany({ data: { isActive: false } });
      }
      const count = await prisma.scene.count();
      const scene = await prisma.scene.create({
        data: {
          name: nameStr,
          backgroundUrl: bgUrl,
          positions: hotspots as unknown as object,
          isActive,
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
      positions: hotspots,
      isActive,
      order: inMemoryScenes.length,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    inMemoryScenes.push(scene);
    if (scene.isActive) {
      inMemoryScenes.forEach((s) => (s.isActive = s.id === scene.id));
      activeSceneId = scene.id;
    }
    res.status(201).json(inMemorySceneToJson(scene));
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
    const body = (req.body ?? {}) as Record<string, unknown>;

    if (useDatabase) {
      const updateData: { name?: string; backgroundUrl?: string; positions?: object; isActive?: boolean } = {};
      if (body.name !== undefined) updateData.name = String(body.name).trim();
      if (body.backgroundUrl !== undefined) updateData.backgroundUrl = String(body.backgroundUrl);
      const payloadHotspots = normalizePayloadToHotspots(body);
      if (payloadHotspots.length >= 0 && (body.hotspots !== undefined || body.positions !== undefined))
        updateData.positions = payloadHotspots as unknown as object;
      if (body.isActive !== undefined) {
        updateData.isActive = Boolean(body.isActive);
        if (updateData.isActive) await prisma.scene.updateMany({ data: { isActive: false } });
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
      ...(body.name !== undefined && { name: String(body.name).trim() || prev.name }),
      ...(body.backgroundUrl !== undefined && { backgroundUrl: String(body.backgroundUrl) }),
      ...((body.hotspots !== undefined || body.positions !== undefined) && { positions: normalizePayloadToHotspots(body) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      updatedAt: nowIso(),
    };
    inMemoryScenes[index] = updated;
    if (updated.isActive) {
      inMemoryScenes.forEach((s) => (s.isActive = s.id === id));
      activeSceneId = id;
    }
    res.json(inMemorySceneToJson(updated));
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
        res.status(404).json({
          error: { message: 'Scene not found', code: 'NOT_FOUND' },
        });
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
    res.json(inMemorySceneToJson(inMemoryScenes[index]));
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

/** Duplicar escena: nueva con mismo fondo y hotspots, nombre "Copia de ..." */
export const duplicateScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (useDatabase) {
      const source = await prisma.scene.findUnique({ where: { id } });
      if (!source) {
        res.status(404).json({ error: { message: 'Scene not found', code: 'NOT_FOUND' } });
        return;
      }
      const hotspots = normalizePositionsToHotspots(source.positions);
      const count = await prisma.scene.count();
      const scene = await prisma.scene.create({
        data: {
          name: `Copia de ${source.name}`,
          backgroundUrl: source.backgroundUrl,
          positions: hotspots as unknown as object,
          isActive: false,
          order: count,
        },
      });
      res.status(201).json(sceneToJson(scene));
      return;
    }

    const idx = inMemoryScenes.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: { message: 'Scene not found', code: 'NOT_FOUND' } });
      return;
    }
    const source = inMemoryScenes[idx];
    const newScene: InMemoryScene = {
      id: nextId(),
      name: `Copia de ${source.name}`,
      backgroundUrl: source.backgroundUrl,
      positions: source.positions.map((h) => ({ ...h, id: `hotspot_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` })),
      isActive: false,
      order: inMemoryScenes.length,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    inMemoryScenes.push(newScene);
    res.status(201).json(inMemorySceneToJson(newScene));
  } catch (error) {
    console.error('[sceneController] Error duplicating scene:', error);
    res.status(500).json({ error: { message: 'Failed to duplicate scene', code: 'INTERNAL_ERROR' } });
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
      res.status(404).json({
        error: { message: 'Scene not found', code: 'NOT_FOUND' },
      });
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
