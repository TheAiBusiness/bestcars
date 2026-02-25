/**
 * Rutas de solicitudes de prueba de manejo
 * Base path: /api/test-drive
 */

import express, { type Request, type Response } from 'express';
import { submitTestDrive, getAllTestDrives } from '../controllers/testDriveController.js';

const router = express.Router();

router.get('/', getAllTestDrives);
router.post('/', submitTestDrive);

/** PATCH /api/test-drive/:id - Panel actualiza lead; en este backend solo lectura sin DB */
router.patch('/:id', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Actualización de test-drive no implementada. Usa BestCars_Back-updated o configura DATABASE_URL.' });
});

export default router;
