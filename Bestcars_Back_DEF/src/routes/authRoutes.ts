import express from 'express';
import { login, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.patch('/password', requireAuth, changePassword);

export default router;
