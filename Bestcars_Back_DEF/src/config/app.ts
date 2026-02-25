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

// Seguridad: cabeceras HTTP
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: permite frontend (Vite dev puede usar 5173, 5174, 5175... + producción)
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  })
);

// Rate limiting: 100 req/15min API, 20/hora formularios
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas peticiones. Intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Parser de JSON para req.body
app.use(express.json({ limit: '1mb' }));

// Raíz: mensaje informativo (evita 404 al abrir http://localhost:3001 en el navegador)
app.get('/', (_req, res) => {
  res.json({
    name: 'BestCars API',
    version: '1.0.0',
    docs: '/api',
    health: '/api/health',
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
