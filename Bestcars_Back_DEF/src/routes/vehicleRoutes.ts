/**
 * Rutas de vehículos
 * Base path: /api/vehicles
 */

import express, { type Request, type Response } from 'express';
import { getAllVehicles, getVehicleById } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

const notImplemented = (msg: string) => (_req: Request, res: Response) => {
  res.status(501).json({ error: msg });
};

router.post('/', notImplemented('Crear vehículo no implementado. Usa BestCars_Back-updated o configura DATABASE_URL.'));
router.patch('/:id', notImplemented('Actualizar vehículo no implementado. Usa BestCars_Back-updated o configura DATABASE_URL.'));
router.delete('/:id', notImplemented('Eliminar vehículo no implementado. Usa BestCars_Back-updated o configura DATABASE_URL.'));

export default router;
