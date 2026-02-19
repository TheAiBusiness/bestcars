import express from 'express';
import { getAllContacts, submitContact, updateContact } from '../controllers/contactController.js';
import { requireAuth } from '../middleware/auth.js';
import { formSubmissionLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', formSubmissionLimiter, submitContact);
router.get('/', requireAuth, getAllContacts);
router.patch('/:id', requireAuth, updateContact);

export default router;
