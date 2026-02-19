/**
 * Rutas de solicitudes de prueba de manejo
 * Base path: /api/test-drive
 */

import express from 'express';
import { submitTestDrive, getAllTestDrives } from '../controllers/testDriveController.js';

const router = express.Router();

router.get('/', getAllTestDrives);
router.post('/', submitTestDrive);

export default router;
