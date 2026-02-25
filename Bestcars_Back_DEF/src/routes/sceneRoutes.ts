/**
 * Rutas de escenas (editor del panel).
 * Bestcars_Back_DEF: solo GET devuelve []; crear/actualizar/eliminar devuelven 501.
 * Para escenas completas usa BestCars_Back-updated.
 */

import express, { type Request, type Response } from 'express';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  res.json([]);
});

router.get('/active', (_req: Request, res: Response) => {
  res.json(null);
});

const notImplemented = (_req: Request, res: Response) => {
  res.status(501).json({
    error: 'Escenas no implementadas en este backend. Usa BestCars_Back-updated.',
  });
};

router.get('/:id', notImplemented); // después de /active para no capturar "active"
router.post('/', notImplemented);
router.patch('/:id', notImplemented);
router.patch('/:id/activate', notImplemented);
router.delete('/:id', notImplemented);

export default router;
