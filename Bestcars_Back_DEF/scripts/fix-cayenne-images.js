/**
 * Actualiza las imágenes del Porsche Cayenne en la BD para que coincidan
 * con los archivos en public/vehicle-images (TURBO GT_9.jpg, etc.).
 * Ejecutar: node scripts/fix-cayenne-images.js
 * (desde la raíz del backend, con DATABASE_URL en .env)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CAYENNE_IMAGES = [
  'TURBO GT_9.jpg',
  'TURBO GT_10.jpg',
  'TURBO GT_11.jpg',
  'TURBO GT_12.jpg',
  'TURBO GT_13.jpg',
  'TURBO GT_14.jpg',
  'TURBO GT_15.jpg',
  'TURBO GT_16.jpg',
  'TURBO GT_17.jpg',
  'TURBO GT_18.jpg',
  'TURBO GT_19.jpg',
  'TURBO GT_20.jpg',
];

async function main() {
  const updated = await prisma.vehicle.updateMany({
    where: { title: { contains: 'Cayenne', mode: 'insensitive' } },
    data: { images: CAYENNE_IMAGES },
  });
  console.log('Cayenne imágenes actualizadas:', updated.count, 'vehículo(s).');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
