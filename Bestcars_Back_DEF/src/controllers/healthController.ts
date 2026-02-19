/**
 * Controlador de health check
 * Endpoint para verificar que la API está activa (útil para load balancers y monitoreo)
 */

import { type Request, type Response } from 'express';

/**
 * GET /api/health
 * Responde con el estado actual de la API
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    message: 'Best Cars API is running',
    timestamp: new Date().toISOString(),
  });
};
