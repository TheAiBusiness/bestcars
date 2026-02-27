import type { RequestHandler, NextFunction, Request, Response } from 'express';

/**
 * Envuelve un controlador async y pasa cualquier error a next()
 * para que lo gestione el errorHandler global.
 */
export function asyncHandler<T extends RequestHandler>(
  fn: T
): RequestHandler {
  return function asyncWrapped(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

