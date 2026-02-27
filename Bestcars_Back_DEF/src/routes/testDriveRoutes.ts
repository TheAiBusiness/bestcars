/**
 * Rutas de solicitudes de prueba de manejo (leads)
 * Base path: /api/test-drive
 * GET y PATCH requieren autenticación (panel). POST es público (formulario web).
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitTestDrive, getAllTestDrives, updateTestDrive, deleteTestDrive } from '../controllers/testDriveController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const testDriveFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Límite de envíos alcanzado. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', testDriveFormLimiter, submitTestDrive);
router.get('/', requireAuth, getAllTestDrives);
router.patch('/:id', requireAuth, updateTestDrive);
router.delete('/:id', requireAuth, deleteTestDrive);

export default router;
