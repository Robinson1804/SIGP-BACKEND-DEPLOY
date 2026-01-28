# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIGP (Sistema Integral de Gestión de Proyectos) is a comprehensive project management system backend built with NestJS 11, TypeScript, PostgreSQL, Redis, and MinIO. The API is served at `/api/v1` with Swagger documentation at `/api/docs`.

## Common Commands

```bash
# Installation (requires --legacy-peer-deps due to NestJS 11 peer dependencies)
npm install --legacy-peer-deps

# Development
npm run start:dev       # Watch mode with hot reload
npm run start:debug     # Debug mode with watch

# Build & Production
npm run build           # Compile TypeScript to dist/
npm run start:prod      # Run compiled app from dist/

# Testing
npm run test            # Run unit tests (*.spec.ts in src/)
npm run test:watch      # Watch mode for tests
npm run test -- --testPathPattern="archivo.service"  # Run specific test file
npm run test:e2e        # E2E tests (*.e2e-spec.ts in test/)
npm run test:cov        # Test coverage report

# Code Quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting

# Database
npm run migration:run                           # Run pending migrations
npm run migration:revert                        # Revert last migration
npm run migration:generate -- MigrationName    # Generate migration from entity changes
npm run seed:run                                # Run database seeds
```

## Docker

Project name: `sgip-backend-deploy`

```bash
# Start all services (PostgreSQL, Redis, MinIO, API)
docker-compose up -d

# Start infrastructure only (for local development)
docker-compose up -d postgres redis minio

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Run migrations in container
docker-compose exec api npm run migration:run
```

**Container names:**
- `sgip-backend-deploy-api` (NestJS API)
- `sgip-backend-deploy-postgres` (PostgreSQL)
- `sgip-backend-deploy-redis` (Redis)
- `sgip-backend-deploy-minio` (MinIO storage)

**Service ports:**
- API: 3011 (mapped to internal 3010)
- PostgreSQL: 5433
- Redis: 6380
- MinIO API: 9000, Console: 9001

## Architecture

### Module Structure

Each domain module follows a consistent pattern:
```
src/modules/{module}/
├── {submodule}/
│   ├── entities/       # TypeORM entities
│   ├── dto/            # Request/Response DTOs with class-validator
│   ├── enums/          # TypeScript enums
│   ├── services/       # Business logic
│   ├── controllers/    # REST endpoints
│   └── index.ts        # Barrel exports
└── {module}.module.ts  # NestJS module definition
```

### Core Modules

- **AuthModule**: JWT authentication with Passport (Local + JWT strategies), sessions, refresh tokens
- **PlanningModule**: Strategic planning hierarchy (PGD → OEI → OGD → OEGD → Acciones Estratégicas)
- **PoiModule**: Projects, subprojects, activities, schedules, requirements, reports
- **AgileModule**: Scrum/Kanban (epics, sprints, user stories, tasks, subtasks, daily meetings, boards)
- **RrhhModule**: Personnel, divisions, skills, assignments
- **NotificacionesModule**: Real-time notifications with WebSockets (Socket.io)
- **DashboardModule**: Metrics and analytics
- **StorageModule**: File management with MinIO (presigned URLs, versioning, cron cleanup)

### Common Infrastructure (src/common/)

- `guards/`: JwtAuthGuard, RolesGuard
- `decorators/`: @CurrentUser, @Roles, @Public
- `filters/`: HttpExceptionFilter (global)
- `interceptors/`: TransformInterceptor (global)
- `pipes/`: ValidationPipe
- `dto/`: PaginationDto, ResponseDto

### Configuration (src/config/)

Environment-based configuration files loaded via `ConfigModule.forRoot()` with `.env.local` and `.env`:
- `database.config.ts`: PostgreSQL connection
- `jwt.config.ts`: JWT settings
- `redis.config.ts`: Redis connection
- `app.config.ts`: Application settings

## Database

PostgreSQL with TypeORM. Uses multiple schemas:
- `public`: Auth, users, configurations
- `planning`: PGD, OEI, OGD, OEGD, Acciones Estratégicas
- `poi`: Projects, activities, schedules, documents
- `agile`: Epics, sprints, user stories, tasks
- `rrhh`: Personnel, divisions, skills, assignments
- `notificaciones`: Notification system

Entities auto-load via `autoLoadEntities: true`. Place entities in `entities/` folders within modules.

The `src/database/` folder contains:
- `migrations/`: TypeORM migrations
- `seeds/`: Database seeders
- `subscribers/`: Audit and timestamp subscribers
- `data-source.ts`: CLI configuration for migrations

## Key Patterns

### Nested Controllers

Modules expose both standalone and nested REST controllers:
```typescript
// Standalone: /api/v1/historias-usuario
HistoriaUsuarioController

// Nested: /api/v1/sprints/:sprintId/historias-usuario
SprintHistoriasUsuarioController
```

### Entity Relationships

Planning hierarchy: PGD → OEI → OGD → OEGD → AccionEstrategica

Agile hierarchy: Proyecto → Epica → HistoriaUsuario → Tarea → Subtarea

### Storage Module

Uses MinIO for file storage with a presigned URL flow:
1. Request upload URL via `POST /upload/request-url`
2. Upload directly to MinIO
3. Confirm via `POST /upload/confirm`

Redis caches presigned URLs and tracks pending uploads. Cron jobs handle cleanup of orphaned files.

### Global Pipes and Filters

Applied in `main.ts`:
- ValidationPipe with `whitelist`, `forbidNonWhitelisted`, `transform`
- HttpExceptionFilter for consistent error responses
- TransformInterceptor for response wrapping
