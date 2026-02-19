import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { mockVehicles } from '../src/data/mockVehicles.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);

async function seedDatabase(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set. Skipping seed. Run: npx prisma db push first.');
    return;
  }

  try {
    console.log('🌱 Seeding database...');

    const count = await prisma.vehicle.count();
    if (count > 0) {
      console.log(`📋 Database already has ${count} vehicles. Skipping seed.`);
      return;
    }

    for (const v of mockVehicles) {
      await prisma.vehicle.create({
        data: {
          id: v.id,
          title: v.title,
          year: v.year,
          mileage: v.mileage,
          price: v.price,
          priceSubtext: v.priceSubtext ?? null,
          fuelType: v.fuelType ?? null,
          seats: v.seats ?? null,
          description: v.description ?? null,
          images: v.images,
          tags: v.tags,
          specifications: v.specifications as object,
        },
      });
    }

    console.log(`✅ Seeded ${mockVehicles.length} vehicles.`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === __filename) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
