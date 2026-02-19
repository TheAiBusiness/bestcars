import express from 'express';
import { getAllTestDrives, submitTestDrive, updateTestDrive } from '../controllers/testDriveController.js';
import { requireAuth } from '../middleware/auth.js';
import { formSubmissionLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', formSubmissionLimiter, submitTestDrive);
router.get('/', requireAuth, getAllTestDrives);
router.patch('/:id', requireAuth, updateTestDrive);

export default router;
