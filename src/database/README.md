# SIGP Database Module

This directory contains all database-related code for the SIGP application.

## Directory Structure

```
src/database/
├── data-source.ts          # TypeORM CLI configuration
├── database.module.ts      # NestJS module for database services
├── migrations/             # TypeORM migrations
│   ├── 1734153600000-CreateSchemas.ts
│   ├── 1734153700000-CreateFunctionsAndTriggers.ts
│   └── index.ts
├── seeds/                  # Database seeders
│   ├── seeder.interface.ts
│   ├── 01-admin-user.seed.ts
│   ├── 02-configuraciones.seed.ts
│   ├── 03-divisiones.seed.ts
│   ├── seed-runner.ts
│   └── index.ts
├── subscribers/            # TypeORM event subscribers
│   ├── audit.subscriber.ts
│   ├── timestamp.subscriber.ts
│   └── index.ts
├── utils/                  # Database utilities
│   ├── pagination.util.ts
│   ├── query-helper.util.ts
│   ├── codigo-generator.util.ts
│   └── index.ts
├── index.ts
└── README.md
```

## Quick Start

### 1. Run Migrations

```bash
# Run all pending migrations
npm run migration:run

# Check migration status
npm run migration:show

# Revert last migration
npm run migration:revert
```

### 2. Run Seeders

```bash
# Run all seeders
npm run seed:run

# Revert all seeders
npm run seed:revert
```

### 3. Full Database Setup

```bash
# Run migrations + seeders
npm run db:setup

# Reset database (revert + run migrations + seed)
npm run db:reset
```

## Migrations

Migrations are executed in order based on their timestamp prefix.

### Creating a New Migration

```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/database/migrations/MigrationName
```

### Migration Structure

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1734153600000 implements MigrationInterface {
  name = 'MigrationName1734153600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Apply changes
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
  }
}
```

## Seeders

Seeders populate the database with initial data.

### Creating a New Seeder

1. Create a new file in `seeds/` following the naming pattern: `XX-name.seed.ts`
2. Implement the `Seeder` interface
3. Register in `seed-runner.ts`

```typescript
import { DataSource } from 'typeorm';
import { Seeder } from './seeder.interface';

export class MySeed implements Seeder {
  name = 'MySeed';
  order = 10; // Execution order

  async run(dataSource: DataSource): Promise<void> {
    // Insert data
  }

  async revert(dataSource: DataSource): Promise<void> {
    // Remove data
  }
}
```

## Subscribers

TypeORM event subscribers that react to entity events.

### AuditSubscriber

Automatically logs all entity changes to `auditoria_logs` table.

- Tracks INSERT, UPDATE, DELETE operations
- Stores before/after data as JSONB
- Excludes sensitive fields (passwords, tokens)

### TimestampSubscriber

Automatically sets `created_at` and `updated_at` fields.

## Utilities

### Pagination

```typescript
import { paginate, PaginatedResponse } from '../database/utils';

// With QueryBuilder
const result: PaginatedResponse<User> = await paginate(
  queryBuilder,
  { page: 1, limit: 20 }
);

// With array
const result = paginateArray(items, { page: 1, limit: 20 });
```

### Query Helpers

```typescript
import { applyFilters, applySorting, applyFullTextSearch } from '../database/utils';

// Apply filters
applyFilters(queryBuilder, 'user', [
  { field: 'activo', operator: 'eq', value: true },
  { field: 'nombre', operator: 'ilike', value: 'john' },
]);

// Apply sorting
applySorting(queryBuilder, 'user', [
  { field: 'createdAt', direction: 'DESC' },
]);

// Full-text search
applyFullTextSearch(queryBuilder, 'user', 'search term', ['nombre', 'email']);
```

### Código Generator

```typescript
import { generateCodigo, CodeType } from '../database/utils';

// Generate sequential codes
const projectCode = await generateCodigo(dataSource, 'PROYECTO'); // PRY-0001
const taskCode = await generateCodigo(dataSource, 'TAREA');       // TSK-00001
const huCode = await generateCodigo(dataSource, 'HISTORIA_USUARIO'); // US-0001
```

## Default Seed Data

### Admin User
- Email: `admin@sigp.gob.pe`
- Password: `Admin123!`
- Role: ADMIN

### Configurations
- App settings
- Sprint settings
- Notification settings
- File upload settings
- Security settings
- Dashboard settings

### Divisiones (OTIN Structure)
- OTIN (main office)
- OTIN-DES (Development)
- OTIN-INF (Infrastructure)
- OTIN-SOP (Support)
- OTIN-SEG (Security)
- OTIN-BD (Database)
- And sub-teams...

## Important Notes

1. **Never modify existing migrations** after deployment
2. **Always test migrations** in development first
3. **Keep seeders idempotent** (can run multiple times safely)
4. **Use transactions** for complex data operations
5. **Don't use synchronize: true** in production
