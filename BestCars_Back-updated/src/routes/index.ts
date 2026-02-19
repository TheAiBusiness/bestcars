import express from 'express';
import vehicleRoutes from './vehicleRoutes.js';
import contactRoutes from './contactRoutes.js';
import testDriveRoutes from './testDriveRoutes.js';
import authRoutes from './authRoutes.js';
import sceneRoutes from './sceneRoutes.js';
import { healthCheck } from '../controllers/healthController.js';

const router = express.Router();

router.get('/health', healthCheck);
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/contact', contactRoutes);
router.use('/test-drive', testDriveRoutes);
router.use('/scenes', sceneRoutes);

export default router;
