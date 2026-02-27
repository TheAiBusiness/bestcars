/**
 * Punto de entrada de la aplicación Best Cars API
 * Inicia el servidor Express y configura el apagado graceful
 */

import 'dotenv/config';
import app from './config/app.js';
import { prisma } from './config/database.js';

const PORT = Number(process.env.PORT) || 3001;
const useDatabase = Boolean(process.env.DATABASE_URL);
const corsOriginsRaw = process.env.CORS_ORIGINS || '';
const corsOrigins = corsOriginsRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.listen(PORT, '0.0.0.0', () => {
  const mode = useDatabase ? 'db' : 'mock';
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
  console.log(`📊 API base path: /api`);
  console.log(`🔧 Mode: ${mode} (${useDatabase ? 'DATABASE_URL present' : 'no DATABASE_URL, using in-memory data'})`);
  console.log(
    corsOrigins.length > 0
      ? `🌐 CORS_ORIGINS configured (${corsOrigins.length} origins)`
      : '🌐 CORS_ORIGINS not set (using permissive CORS for localhost/túneles)'
  );
  console.log(`🌱 NODE_ENV=${process.env.NODE_ENV || 'development'}`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal}. Shutting down gracefully...`);
  if (useDatabase) {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  }
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
