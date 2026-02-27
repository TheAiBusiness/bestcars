import express from 'express';
import { login, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/login', asyncHandler(login));
router.patch('/password', requireAuth, asyncHandler(changePassword));

export default router;
