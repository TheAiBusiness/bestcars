/**
 * Configuración principal de Express
 * Monta middlewares, rutas y manejadores de errores
 */

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from '../routes/index.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

dotenv.config();

const app: Express = express();

// Seguridad: cabeceras HTTP. CORP "cross-origin" para que las imágenes carguen tras túnel Cloudflare.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS: en desarrollo acepta cualquier localhost (Vite usa puertos variables). En producción usa CORS_ORIGINS.
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';

// Siempre permitir localhost (web 5173, panel 5174) y túneles Cloudflare; en producción también CORS_ORIGINS
function corsOrigin(origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void): void {
  if (!origin) {
    cb(null, true);
    return;
  }
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    cb(null, true);
    return;
  }
  if (origin.includes('trycloudflare.com')) {
    cb(null, true);
    return;
  }
  if (corsOrigins.length > 0) {
    cb(null, corsOrigins.includes(origin));
    return;
  }
  cb(null, true);
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Rate limiting: excluir imágenes (muchas peticiones GET) para evitar 429 tras túnel Cloudflare
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Demasiadas peticiones. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes('/vehicles/images/'),
});
app.use('/api', apiRateLimit);


// Parser de JSON para req.body
app.use(express.json({ limit: '1mb' }));

// Raíz: mensaje informativo (evita 404 al abrir la URL en el navegador)
app.get('/', (_req, res) => {
  res.json({
    name: 'BestCars API',
    version: '1.0.0',
    docs: '/api',
    health: '/api/health',
    ready: '/api/health/ready',
  });
});

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rutas API bajo el prefijo /api
app.use('/api', routes);

// 404: ruta no encontrada
app.use(notFoundHandler);

// Manejador global de errores (debe ir último)
app.use(errorHandler);

export default app;
