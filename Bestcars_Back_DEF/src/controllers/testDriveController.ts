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

/** Almacén en memoria para test-drive cuando no hay DATABASE_URL (mismo patrón que contact). */
interface InMemoryTestDrive {
  id: number;
  vehicleId: string | null;
  vehicleTitle: string | null;
  name: string;
  age: string;
  lastVehicle: string;
  interests: string;
  mainUse: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
const inMemoryTestDrives: InMemoryTestDrive[] = [];
let inMemoryTestDriveNextId = 1;

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
        error: {
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
        },
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
      const id = inMemoryTestDriveNextId++;
      const now = new Date().toISOString();
      inMemoryTestDrives.unshift({
        id,
        vehicleId: vehicleId ?? null,
        vehicleTitle: vehicleTitle ?? null,
        name: name.trim(),
        age: age.trim(),
        lastVehicle: lastVehicle.trim(),
        interests: interests.trim(),
        mainUse: mainUse.trim(),
        status: 'new',
        notes: null,
        createdAt: now,
        updatedAt: now,
      });
      submissionId = id;
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
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Test drive submission sent:', { vehicleId, vehicleTitle, name, age });
      }
    } catch (emailError) {
      console.error('[testDriveController] Error sending email:', emailError);
      res.status(201).json({
        success: true,
        message: 'Test drive submission received, but email notification failed',
        id: submissionId,
        warning: 'Email notification could not be sent',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Test drive submission received and email sent successfully',
      id: submissionId,
    });
  } catch (error) {
    console.error('[testDriveController] Error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to submit test drive form',
        code: 'INTERNAL_ERROR',
      },
    });
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
          status: (s as { status?: string }).status ?? 'new',
          notes: (s as { notes?: string | null }).notes ?? null,
          createdAt: s.createdAt.toISOString(),
          updatedAt: (s as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? s.createdAt.toISOString(),
        }))
      );
      return;
    }
    res.json([...inMemoryTestDrives]);
  } catch (error) {
    console.error('[testDriveController] Error fetching test drives:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch test drive submissions',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * PATCH /api/test-drive/:id - Actualizar lead (status, notes). Requiere auth.
 */
export const updateTestDrive = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({
        error: {
          message: 'Invalid test drive id',
          code: 'VALIDATION_ERROR',
        },
      });
      return;
    }
    const { status, notes } = req.body ?? {};

    if (!useDatabase) {
      const index = inMemoryTestDrives.findIndex((s) => s.id === id);
      if (index === -1) {
        res.status(404).json({ error: { message: 'Test drive not found', code: 'NOT_FOUND' } });
        return;
      }
      const s = inMemoryTestDrives[index];
      if (status !== undefined) s.status = String(status).trim() || 'new';
      if (notes !== undefined) s.notes = notes === null || notes === '' ? null : String(notes).trim();
      s.updatedAt = new Date().toISOString();
      res.json({
        id: s.id,
        vehicleId: s.vehicleId,
        vehicleTitle: s.vehicleTitle,
        name: s.name,
        age: s.age,
        lastVehicle: s.lastVehicle,
        interests: s.interests,
        mainUse: s.mainUse,
        status: s.status,
        notes: s.notes,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      });
      return;
    }

    const data: { status?: string; notes?: string | null } = {};
    if (status !== undefined) data.status = String(status).trim() || 'new';
    if (notes !== undefined) data.notes = notes === null || notes === '' ? null : String(notes).trim();

    const submission = await prisma.testDriveSubmission.update({
      where: { id },
      data,
    });
    const s = submission as typeof submission & { status?: string; notes?: string | null; updatedAt: Date };
    res.json({
      id: s.id,
      vehicleId: s.vehicleId,
      vehicleTitle: s.vehicleTitle,
      name: s.name,
      age: s.age,
      lastVehicle: s.lastVehicle,
      interests: s.interests,
      mainUse: s.mainUse,
      status: s.status ?? 'new',
      notes: s.notes ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[testDriveController] Error updating test drive:', error);
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({
        error: {
          message: 'Test drive not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    res.status(500).json({
      error: {
        message: 'Failed to update test drive',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * DELETE /api/test-drive/:id - Eliminar lead (solicitud prueba de manejo). Requiere auth.
 */
export const deleteTestDrive = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({
        error: {
          message: 'Invalid test drive id',
          code: 'VALIDATION_ERROR',
        },
      });
      return;
    }
    if (!useDatabase) {
      const index = inMemoryTestDrives.findIndex((s) => s.id === id);
      if (index === -1) {
        res.status(404).json({ error: { message: 'Test drive not found', code: 'NOT_FOUND' } });
        return;
      }
      inMemoryTestDrives.splice(index, 1);
      res.status(204).send();
      return;
    }
    await prisma.testDriveSubmission.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('[testDriveController] Error deleting test drive:', error);
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({
        error: {
          message: 'Test drive not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
    res.status(500).json({
      error: {
        message: 'Failed to delete test drive',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};
