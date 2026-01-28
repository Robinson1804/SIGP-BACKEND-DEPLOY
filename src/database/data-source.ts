/**
 * SIGP - TypeORM Data Source Configuration
 * Used for CLI migrations and seeding
 *
 * Usage:
 *   npm run migration:run
 *   npm run migration:generate MigrationName
 *   npm run seed:run
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Check if running as seed command (to skip NestJS-dependent subscribers)
const isSeeding = process.argv.some(arg => arg.includes('seed-runner'));

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '1234',
  database: process.env.DATABASE_NAME || 'sigp_inei',
  schema: 'public',

  // Entity paths
  entities: ['dist/**/*.entity.js'],

  // Migration paths
  migrations: ['dist/database/migrations/[0-9]*-*.js'],
  migrationsTableName: 'typeorm_migrations',

  // Subscriber paths - skip for seeding (they use NestJS DI)
  subscribers: isSeeding ? [] : ['dist/database/subscribers/*.js'],

  // Configuration
  synchronize: false, // NEVER true in production
  logging: process.env.NODE_ENV === 'development',
  logger: 'advanced-console',

  // Connection pool
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },

  // SSL (for production)
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Data source for CLI
const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
