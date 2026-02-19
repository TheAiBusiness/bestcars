/**
 * Manejadores globales de errores para Express
 * Intercepta errores de Prisma y errores genéricos para respuestas consistentes
 */

import { type Request, type Response, type NextFunction } from 'express';

/** Error extendido con código de estado y códigos de Prisma */
type AppError = Error & { status?: number; code?: string };

/**
 * Manejador global de errores
 * Mapea códigos de Prisma a códigos HTTP apropiados
 * - P2002: Violación de unicidad (409 Conflict)
 * - P2025: Registro no encontrado (404 Not Found)
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[errorHandler]', err);

  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'Duplicate entry. This record already exists.',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      error: 'Record not found.',
    });
    return;
  }

  res.status(err.status ?? 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Manejador 404 para rutas no encontradas
 * Se ejecuta cuando ninguna ruta coincide con la petición
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
};
