/**
 * Router principal de la API
 * Agrupa todas las rutas bajo el prefijo /api
 *
 * Endpoints: /api/health | /api/auth | /api/vehicles | /api/contact | /api/test-drive
 */

import express from 'express';
import vehicleRoutes from './vehicleRoutes.js';
import contactRoutes from './contactRoutes.js';
import testDriveRoutes from './testDriveRoutes.js';
import sceneRoutes from './sceneRoutes.js';
import authRoutes from './authRoutes.js';
import { healthCheck } from '../controllers/healthController.js';

const router = express.Router();

// Health check: verifica que la API está activa
router.get('/health', healthCheck);

// Autenticación del panel (POST /api/auth/login)
router.use('/auth', authRoutes);

// Rutas por recurso
router.use('/vehicles', vehicleRoutes);
router.use('/contact', contactRoutes);
router.use('/test-drive', testDriveRoutes);
router.use('/scenes', sceneRoutes);

export default router;
