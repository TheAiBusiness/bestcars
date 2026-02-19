/**
 * Controlador de solicitudes de prueba de manejo
 * Persiste en Supabase si DATABASE_URL está configurada
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';
import { sendTestDriveEmail } from '../services/emailService.js';
import { generateSubmissionId } from '../utils/validators.js';

interface TestDriveRequestBody {
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  age: string;
  lastVehicle: string;
  interests: string;
  mainUse: string;
}

const REQUIRED_FIELDS: (keyof TestDriveRequestBody)[] = [
  'name',
  'age',
  'lastVehicle',
  'interests',
  'mainUse',
];

const useDatabase = Boolean(process.env.DATABASE_URL);

/**
 * POST /api/test-drive
 */
export const submitTestDrive = async (
  req: Request<object, object, TestDriveRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { vehicleId, vehicleTitle, name, age, lastVehicle, interests, mainUse } = req.body;

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !req.body[field] || String(req.body[field]).trim() === ''
    );

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'All fields are required',
        missingFields,
      });
      return;
    }

    let submissionId: number | string;

    if (useDatabase) {
      try {
        const submission = await prisma.testDriveSubmission.create({
          data: {
            vehicleId: vehicleId || null,
            vehicleTitle: vehicleTitle || null,
            name: name.trim(),
            age: age.trim(),
            lastVehicle: lastVehicle.trim(),
            interests: interests.trim(),
            mainUse: mainUse.trim(),
          },
        });
        submissionId = submission.id;
      } catch (dbError) {
        console.error('[testDriveController] DB error:', dbError);
        submissionId = generateSubmissionId();
      }
    } else {
      submissionId = generateSubmissionId();
    }

    try {
      await sendTestDriveEmail({
        name: name.trim(),
        age: age.trim(),
        lastVehicle: lastVehicle.trim(),
        interests: interests.trim(),
        mainUse: mainUse.trim(),
        vehicleId,
        vehicleTitle,
      });
      console.log('📧 Test drive submission sent:', { vehicleId, vehicleTitle, name, age });
    } catch (emailError) {
      console.error('[testDriveController] Error sending email:', emailError);
      res.status(201).json({
        success: true,
        message: 'Test drive submission received, but email notification failed',
        id: Math.floor(Math.random() * 1000),
        warning: 'Email notification could not be sent',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Test drive submission received and email sent successfully',
      id: typeof submissionId === 'number' ? submissionId : Math.floor(Math.random() * 1000),
    });
  } catch (error) {
    console.error('[testDriveController] Error:', error);
    res.status(500).json({ error: 'Failed to submit test drive form' });
  }
};

/**
 * GET /api/test-drive
 */
export const getAllTestDrives = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (useDatabase) {
      const submissions = await prisma.testDriveSubmission.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json(
        submissions.map((s) => ({
          id: s.id,
          vehicleId: s.vehicleId,
          vehicleTitle: s.vehicleTitle,
          name: s.name,
          age: s.age,
          lastVehicle: s.lastVehicle,
          interests: s.interests,
          mainUse: s.mainUse,
          createdAt: s.createdAt.toISOString(),
        }))
      );
      return;
    }
    res.json([]);
  } catch (error) {
    console.error('[testDriveController] Error fetching test drives:', error);
    res.status(500).json({ error: 'Failed to fetch test drive submissions' });
  }
};
