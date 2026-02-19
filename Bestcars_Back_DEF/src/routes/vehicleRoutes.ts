/**
 * Rutas de vehículos
 * Base path: /api/vehicles
 */

import express from 'express';
import { getAllVehicles, getVehicleById } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

export default router;
