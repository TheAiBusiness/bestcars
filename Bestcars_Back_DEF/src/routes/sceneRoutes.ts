/**
 * Rutas de escenas (editor del panel).
 * Persiste en DB si DATABASE_URL está configurada.
 */

import express from 'express';
import {
  createScene,
  deleteScene,
  getAllScenes,
  getActiveScene,
  getSceneById,
  setActiveScene,
  updateScene,
} from '../controllers/sceneController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getAllScenes));
router.get('/active', asyncHandler(getActiveScene));
router.get('/:id', asyncHandler(getSceneById));

router.post('/', requireAuth, asyncHandler(createScene));
router.patch('/:id', requireAuth, asyncHandler(updateScene));
router.patch('/:id/activate', requireAuth, asyncHandler(setActiveScene));
router.delete('/:id', requireAuth, asyncHandler(deleteScene));

export default router;
