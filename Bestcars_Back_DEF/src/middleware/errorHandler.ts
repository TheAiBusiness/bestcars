/**
 * Manejadores globales de errores para Express
 * Intercepta errores de Prisma y errores genéricos para respuestas consistentes
 */

import { type Request, type Response, type NextFunction } from 'express';

/** Error extendido con código de estado y códigos de Prisma */
export type AppError = Error & { status?: number; code?: string };

/**
 * Manejador global de errores
 * Mapea códigos de Prisma a códigos HTTP apropiados
 * - P2002: Violación de unicidad (409 Conflict)
 * - P2025: Registro no encontrado (404 Not Found)
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isProd = process.env.NODE_ENV === 'production';

  // Mapear errores de Prisma a HTTP
  let status = err.status ?? 500;
  if (err.code === 'P2002') status = 409;
  if (err.code === 'P2025') status = 404;

  const message =
    err.message ||
    (status === 404 ? 'Resource not found' : 'Internal server error');

  if (isProd) {
    console.error('[errorHandler]', {
      message,
      code: err.code ?? null,
      path: req.path,
    });
  } else {
    console.error('[errorHandler]', err);
  }

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    error: {
      message,
      code: err.code ?? null,
    },
  });
};

/**
 * Manejador 404 para rutas no encontradas
 * Se ejecuta cuando ninguna ruta coincide con la petición
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
    path: req.path,
  });
};
