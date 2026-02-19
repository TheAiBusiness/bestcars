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

const router = express.Router();

router.get('/', getAllScenes);
router.get('/active', getActiveScene); // Must be before /:id
router.get('/:id', getSceneById);

router.post('/', requireAuth, createScene);
router.patch('/:id', requireAuth, updateScene);
router.patch('/:id/activate', requireAuth, setActiveScene);
router.delete('/:id', requireAuth, deleteScene);

export default router;
