/**
 * Rutas de formulario de contacto
 * Base path: /api/contact
 */

import express, { type Request, type Response } from 'express';
import { submitContact, getAllContacts } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', getAllContacts);

/** PATCH /api/contact/:id - Panel actualiza lead; en este backend solo lectura sin DB */
router.patch('/:id', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Actualización de contactos no implementada. Usa BestCars_Back-updated o configura DATABASE_URL.' });
});

export default router;
