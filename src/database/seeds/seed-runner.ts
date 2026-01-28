/**
 * SIGP - Database Seed Runner
 *
 * Executes all seeders in order
 *
 * Usage:
 *   npm run seed:run      - Run all seeders
 *   npm run seed:revert   - Revert all seeders
 */

import AppDataSource from '../data-source';
import { Seeder } from './seeder.interface';

// Import all seeders
import { AdminUserSeed } from './01-admin-user.seed';
import { ConfiguracionesSeed } from './02-configuraciones.seed';
import { DivisionesSeed } from './03-divisiones.seed';
import { TestUsersSeed } from './04-test-users.seed';
import { OTINDivisionesStaffSeed } from './05-otin-divisiones-staff.seed';

// Register seeders (order matters!)
const seeders: Seeder[] = [
  new AdminUserSeed(),
  new ConfiguracionesSeed(),
  new DivisionesSeed(),
  new TestUsersSeed(),
  new OTINDivisionesStaffSeed(),
].sort((a, b) => a.order - b.order);

async function runSeeders(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║        SIGP - Database Seeder              ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Initialize data source
    console.log('→ Connecting to database...');
    await AppDataSource.initialize();
    console.log('✓ Database connected\n');

    // Run seeders
    console.log('→ Running seeders...\n');

    for (const seeder of seeders) {
      console.log(`[${seeder.order}] ${seeder.name}`);
      await seeder.run(AppDataSource);
      console.log('');
    }

    console.log('════════════════════════════════════════════');
    console.log('✓ All seeders completed successfully!');
    console.log('════════════════════════════════════════════');
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

async function revertSeeders(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║      SIGP - Revert Database Seeders        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Initialize data source
    console.log('→ Connecting to database...');
    await AppDataSource.initialize();
    console.log('✓ Database connected\n');

    // Revert seeders in reverse order
    console.log('→ Reverting seeders...\n');

    const reversedSeeders = [...seeders].reverse();

    for (const seeder of reversedSeeders) {
      if (seeder.revert) {
        console.log(`[${seeder.order}] Reverting ${seeder.name}`);
        await seeder.revert(AppDataSource);
        console.log('');
      }
    }

    console.log('════════════════════════════════════════════');
    console.log('✓ All seeders reverted successfully!');
    console.log('════════════════════════════════════════════');
  } catch (error) {
    console.error('✗ Revert failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Check command line argument
const command = process.argv[2];

if (command === 'revert') {
  revertSeeders();
} else {
  runSeeders();
}
