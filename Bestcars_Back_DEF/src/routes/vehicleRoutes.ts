/**
 * Rutas de vehículos
 * Base path: /api/vehicles
 * GET público (web y panel). POST, PATCH, DELETE requieren auth (panel).
 */

import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  trackVehicle,
} from '../controllers/vehicleController.js';
import { requireAuth } from '../middleware/auth.js';

// Raíz del proyecto (funciona con npm run dev y npm start)
const VEHICLE_IMAGES_DIR = path.join(process.cwd(), 'public', 'vehicle-images');

const router = express.Router();

router.get('/', getAllVehicles);

/** Sirve imágenes de vehículos por nombre de archivo (ej. AUDI RS6_42.jpg). Debe ir antes de /:id */
router.get('/images/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    if (!filename || filename.includes('..')) {
      res.status(400).end();
      return;
    }
    const filepath = path.join(VEHICLE_IMAGES_DIR, filename);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filepath);
    } catch {
      res.status(404).end();
      return;
    }
    if (!stat.isFile()) {
      res.status(404).end();
      return;
    }
    // CORS y CORP para que las imágenes carguen desde la web tras túnel Cloudflare
    const origin = req.get('Origin');
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(filepath, (err) => {
      if (err && !res.headersSent) res.status(500).end();
    });
  } catch {
    if (!res.headersSent) res.status(500).end();
  }
});

router.get('/:id', getVehicleById);
router.post('/:id/track', trackVehicle);

router.post('/', requireAuth, createVehicle);
router.patch('/:id', requireAuth, updateVehicle);
router.delete('/:id', requireAuth, deleteVehicle);

export default router;
