/**
 * Controlador de health check
 * Liveness: API activa. Readiness: API + DB (para Railway/load balancers).
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';

const useDatabase = Boolean(process.env.DATABASE_URL);
const startedAt = Date.now();
const pkg = { name: 'BestCars API', version: '1.0.0' };

/**
 * GET /api/health - Liveness: la API responde SIEMPRE 200
 */
export const healthCheck = (_req: Request, res: Response): void => {
  const mode = useDatabase ? 'db' : 'mock';
  res.status(200).json({
    name: pkg.name,
    version: pkg.version,
    mode,
    db: useDatabase,
    uptime: (Date.now() - startedAt) / 1000,
  });
};

async function checkDatabaseWithTimeout(timeoutMs: number): Promise<boolean> {
  if (!useDatabase) return false;
  const queryPromise = prisma.$queryRaw`SELECT 1`.then(() => true);
  const timeoutPromise = new Promise<boolean>((resolve) =>
    setTimeout(() => resolve(false), timeoutMs)
  );
  return Promise.race([queryPromise, timeoutPromise]);
}

/**
 * GET /api/health/ready - Readiness: API + conexión a DB (Railway, K8s)
 */
export const healthReady = async (_req: Request, res: Response): Promise<void> => {
  const mode = useDatabase ? 'db' : 'mock';

  // Modo mock: siempre listo sin tocar DB
  if (!useDatabase) {
    res.status(200).json({
      ready: true,
      mode,
      db: false,
    });
    return;
  }

  try {
    const ok = await checkDatabaseWithTimeout(2500);
    if (ok) {
      res.status(200).json({
        ready: true,
        mode,
        db: true,
      });
      return;
    }

    res.status(503).json({
      ready: false,
      mode,
      db: false,
      error: {
        message: 'Database readiness check timed out',
        code: 'DB_UNAVAILABLE',
      },
    });
  } catch (error) {
    console.error('[health] Readiness check failed:', error);
    res.status(503).json({
      ready: false,
      mode,
      db: false,
      error: {
        message: 'Database unavailable',
        code: 'DB_UNAVAILABLE',
      },
    });
  }
};
