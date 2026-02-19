/**
 * Controlador de formulario de contacto
 * Persiste en Supabase si DATABASE_URL está configurada
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';
import { sendContactEmail } from '../services/emailService.js';
import { isValidEmail, validatePhone, generateSubmissionId } from '../utils/validators.js';

interface ContactRequestBody {
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

const useDatabase = Boolean(process.env.DATABASE_URL);

/**
 * POST /api/contact
 */
export const submitContact = async (
  req: Request<object, object, ContactRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { vehicleId, vehicleTitle, name, email, phone, message } = req.body;

    if (!name?.trim() || !email?.trim()) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (phone && phone.trim() !== '') {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        res.status(400).json({ error: phoneValidation.error });
        return;
      }
    }

    let submissionId: number | string;

    if (useDatabase) {
      try {
        const submission = await prisma.contactSubmission.create({
          data: {
            vehicleId: vehicleId || null,
            name: name.trim(),
            email: email.trim(),
            phone: phone?.trim() || null,
            message: message?.trim() || null,
          },
        });
        submissionId = submission.id;
      } catch (dbError) {
        console.error('[contactController] DB error:', dbError);
        submissionId = generateSubmissionId();
      }
    } else {
      submissionId = generateSubmissionId();
    }

    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || undefined,
        message: message?.trim() || undefined,
        vehicleId,
        vehicleTitle,
      });
      console.log('📧 Contact submission sent:', { vehicleId, vehicleTitle, name, email });
    } catch (emailError) {
      console.error('[contactController] Error sending email:', emailError);
      res.status(201).json({
        success: true,
        message: 'Contact submission received, but email notification failed',
        id: Math.floor(Math.random() * 1000),
        warning: 'Email notification could not be sent',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Contact submission received and email sent successfully',
      id: typeof submissionId === 'number' ? submissionId : Math.floor(Math.random() * 1000),
    });
  } catch (error) {
    console.error('[contactController] Error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};

/**
 * GET /api/contact
 */
export const getAllContacts = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (useDatabase) {
      const contacts = await prisma.contactSubmission.findMany({
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json(
        contacts.map((c) => ({
          id: c.id,
          vehicleId: c.vehicleId,
          vehicleTitle: c.vehicle?.title,
          name: c.name,
          email: c.email,
          phone: c.phone,
          message: c.message,
          createdAt: c.createdAt.toISOString(),
        }))
      );
      return;
    }
    res.json([]);
  } catch (error) {
    console.error('[contactController] Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
};
