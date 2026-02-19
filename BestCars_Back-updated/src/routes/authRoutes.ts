import express from 'express';
import { login } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/login', authLimiter, login);

export default router;
