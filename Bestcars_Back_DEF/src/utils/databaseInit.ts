/**
 * Utilidad de inicialización de base de datos
 * Actualmente en modo MOCK: el seed no se ejecuta contra DB real.
 * Preparado para cuando se conecte Prisma con PostgreSQL.
 */

import { seedDatabase } from '../../scripts/seed.js';

/**
 * Inicializa la base de datos (si está configurada)
 * En modo actual: solo loguea que se usa MOCK y no persiste datos
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('⚠️  Database initialization skipped - application is running in MOCK mode');
    await seedDatabase();
  } catch (error) {
    console.error('[databaseInit] Error initializing database:', error);
  }
}
