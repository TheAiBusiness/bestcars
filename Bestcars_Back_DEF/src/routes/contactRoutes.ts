/**
 * Rutas de formulario de contacto (leads)
 * Base path: /api/contact
 * GET y PATCH requieren autenticación (panel). POST es público (formulario web).
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitContact, getAllContacts, updateContact, deleteContact } from '../controllers/contactController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Límite de envíos alcanzado. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', contactFormLimiter, asyncHandler(submitContact));
router.get('/', requireAuth, asyncHandler(getAllContacts));
router.patch('/:id', requireAuth, asyncHandler(updateContact));
router.delete('/:id', requireAuth, asyncHandler(deleteContact));

export default router;
