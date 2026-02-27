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

/** Formato de un contacto en memoria (compatible con ApiContact del panel) */
interface InMemoryContact {
  id: number;
  vehicleId: string | null;
  vehicleTitle: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Almacén en memoria para contactos cuando no hay DATABASE_URL (para que el panel muestre los leads) */
const inMemoryContacts: InMemoryContact[] = [];
let inMemoryNextId = 1;

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
      const id = inMemoryNextId++;
      const now = new Date().toISOString();
      inMemoryContacts.unshift({
        id,
        vehicleId: vehicleId ?? null,
        vehicleTitle: vehicleTitle ?? null,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() ?? null,
        message: message?.trim() ?? null,
        status: 'new',
        notes: null,
        createdAt: now,
        updatedAt: now,
      });
      submissionId = id;
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
          vehicleTitle: c.vehicle?.title ?? null,
          name: c.name,
          email: c.email,
          phone: c.phone,
          message: c.message,
          status: c.status ?? 'new',
          notes: c.notes ?? null,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))
      );
      return;
    }
    res.json([...inMemoryContacts]);
  } catch (error) {
    console.error('[contactController] Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
};

/**
 * PATCH /api/contact/:id - Actualizar lead (status, notes). Requiere auth.
 */
export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid contact id' });
      return;
    }
    const { status, notes } = req.body ?? {};

    if (useDatabase) {
      const data: { status?: string; notes?: string | null } = {};
      if (status !== undefined) data.status = String(status).trim() || 'new';
      if (notes !== undefined) data.notes = notes === null || notes === '' ? null : String(notes).trim();
      const contact = await prisma.contactSubmission.update({
        where: { id },
        data,
        include: { vehicle: true },
      });
      res.json({
        id: contact.id,
        vehicleId: contact.vehicleId,
        vehicleTitle: contact.vehicle?.title ?? null,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        status: contact.status ?? 'new',
        notes: contact.notes ?? null,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      });
      return;
    }

    const index = inMemoryContacts.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    const c = inMemoryContacts[index];
    if (status !== undefined) c.status = String(status).trim() || 'new';
    if (notes !== undefined) c.notes = notes === null || notes === '' ? null : String(notes).trim();
    c.updatedAt = new Date().toISOString();
    res.json({ ...c });
  } catch (error) {
    console.error('[contactController] Error updating contact:', error);
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

/**
 * DELETE /api/contact/:id - Eliminar lead (contacto). Requiere auth.
 */
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid contact id' });
      return;
    }
    if (useDatabase) {
      await prisma.contactSubmission.delete({ where: { id } });
      res.status(204).send();
      return;
    }
    const index = inMemoryContacts.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    inMemoryContacts.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error('[contactController] Error deleting contact:', error);
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};
