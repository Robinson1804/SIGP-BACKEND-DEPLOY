# SIGP - Sistema Integral de Gestión de Proyectos

Backend API para el Sistema Integral de Gestión de Proyectos del INEI, desarrollado con NestJS 11, TypeScript, PostgreSQL y Redis.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Docker](#docker)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Módulos Principales](#módulos-principales)

## 📖 Descripción

SIGP es un sistema empresarial para la gestión integral de proyectos que incluye:

- **Planificación Estratégica**: PGD, OEI, OGD, OEGD, Acciones Estratégicas
- **POI**: Gestión de proyectos, subproyectos, actividades, cronogramas, requerimientos
- **Metodologías Ágiles**: Scrum/Kanban con épicas, sprints, historias de usuario, tableros
- **Recursos Humanos**: Gestión de personal, divisiones, habilidades y asignaciones
- **Almacenamiento**: Sistema de archivos con MinIO (S3-compatible)
- **Notificaciones**: Sistema de notificaciones en tiempo real

## 🚀 Stack Tecnológico

### Backend
- **Framework**: NestJS 11.0.1
- **Lenguaje**: TypeScript 5.7.3
- **Runtime**: Node.js 20.x
- **ORM**: TypeORM 0.3.20

### Base de Datos
- **Principal**: PostgreSQL 14+
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)

### Autenticación
- **JWT**: JSON Web Tokens
- **Passport**: Estrategias Local y JWT
- **Bcrypt**: Hash de contraseñas

### Documentación
- **Swagger/OpenAPI**: Documentación interactiva de la API

### Comunicación en Tiempo Real
- **Socket.io**: WebSockets para notificaciones

## 📦 Requisitos Previos

- Node.js >= 20.x
- npm >= 10.x
- Docker >= 20.x y Docker Compose >= 2.x (para desarrollo con contenedores)
- PostgreSQL 14+ (si no usas Docker)
- Redis 7+ (si no usas Docker)
- MinIO (si no usas Docker)

## 🔧 Instalación

### Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd sigp-backend

# Instalar dependencias
npm install --legacy-peer-deps

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus configuraciones
```

### Instalación con Docker

```bash
# Levantar servicios de infraestructura (PostgreSQL, Redis, MinIO)
docker-compose up -d postgres redis minio

# O levantar todos los servicios incluyendo la API
docker-compose up -d
```

## ⚙️ Configuración

### Variables de Entorno

Crear un archivo `.env` basado en `.env.example`:

```env
# Application
NODE_ENV=development
PORT=3010
API_PREFIX=api/v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=1234
DATABASE_NAME=sigp_inei
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=sigp:

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false

# JWT
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=*
```

### Schemas de Base de Datos

El proyecto utiliza múltiples schemas en PostgreSQL:

- `public`: Auth, usuarios, configuraciones
- `planning`: PGD, OEI, OGD, OEGD, Acciones Estratégicas
- `poi`: Proyectos, actividades, cronogramas, documentos
- `agile`: Épicas, sprints, historias de usuario, tareas
- `rrhh`: Personal, divisiones, habilidades, asignaciones
- `notificaciones`: Sistema de notificaciones

## 🐳 Docker

### Servicios Disponibles

```yaml
# PostgreSQL 14
- Puerto: 5433 (host) -> 5432 (container)
- Base de datos: sigp_inei
- Usuario: postgres
- Contraseña: 1234

# Redis 7
- Puerto: 6380 (host) -> 6379 (container)
- Prefix: sigp:

# MinIO
- API: 9000 (host) -> 9000 (container)
- Console: 9001 (host) -> 9001 (container)
- Usuario: minioadmin
- Contraseña: minioadmin

# NestJS App
- Puerto: 3010 (host) -> 3010 (container)
```

### Comandos Docker

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs de la aplicación
docker-compose logs -f app

# Reconstruir la imagen
docker-compose build app

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Ejecutar migraciones
docker-compose exec app npm run migration:run

# Ejecutar seeds
docker-compose exec app npm run seed:run
```

## 📜 Scripts Disponibles

### Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# Modo debug con hot-reload
npm run start:debug

# Compilar proyecto
npm run build

# Ejecutar compilado
npm run start:prod
```

### Testing

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Test específico
npm run test -- --testPathPattern="archivo.service"

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Calidad de Código

```bash
# ESLint
npm run lint

# Prettier
npm run format
```

### Base de Datos

```bash
# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Generar migración
npm run migration:generate -- MigrationName

# Ejecutar seeds
npm run seed:run
```

## 📁 Estructura del Proyecto

```
sigp-backend/
├── src/
│   ├── common/              # Recursos compartidos
│   │   ├── decorators/      # @CurrentUser, @Roles, @Public
│   │   ├── filters/         # HttpExceptionFilter
│   │   ├── guards/          # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/    # TransformInterceptor
│   │   └── pipes/           # ValidationPipe
│   ├── config/              # Configuraciones
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── redis.config.ts
│   ├── database/            # Migrations y seeds
│   │   ├── migrations/
│   │   └── seeds/
│   ├── modules/             # Módulos funcionales
│   │   ├── auth/            # Autenticación y autorización
│   │   ├── planning/        # Planificación estratégica
│   │   │   ├── pgd/
│   │   │   ├── oei/
│   │   │   ├── ogd/
│   │   │   ├── oegd/
│   │   │   └── accion-estrategica/
│   │   ├── poi/             # Proyectos y actividades
│   │   │   ├── proyectos/
│   │   │   ├── subproyectos/
│   │   │   ├── actividades/
│   │   │   ├── cronogramas/
│   │   │   ├── documentos/
│   │   │   ├── requerimientos/
│   │   │   └── informes/
│   │   ├── agile/           # Metodologías ágiles
│   │   │   ├── epicas/
│   │   │   ├── sprints/
│   │   │   ├── historias-usuario/
│   │   │   ├── tareas/
│   │   │   ├── subtareas/
│   │   │   ├── daily-meetings/
│   │   │   └── tableros/
│   │   ├── rrhh/            # Recursos humanos
│   │   │   ├── divisiones/
│   │   │   ├── personal/
│   │   │   ├── habilidades/
│   │   │   └── asignaciones/
│   │   ├── notificaciones/  # Sistema de notificaciones
│   │   ├── dashboard/       # Métricas y analytics
│   │   └── storage/         # Gestión de archivos
│   ├── app.module.ts
│   └── main.ts
├── test/                    # Tests E2E
├── docs/                    # Documentación
│   ├── api/
│   ├── guides/
│   └── specs/
├── database/
│   └── scripts/             # Scripts de inicialización SQL
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json
└── tsconfig.json
```

## 📚 API Documentation

### Swagger UI

Una vez iniciado el servidor, la documentación interactiva está disponible en:

```
http://localhost:3010/api/docs
```

### Endpoints Principales

```
# Autenticación
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/profile

# Planificación
GET    /api/v1/pgd
GET    /api/v1/oei
GET    /api/v1/ogd
GET    /api/v1/oegd
GET    /api/v1/acciones-estrategicas

# Proyectos
GET    /api/v1/proyectos
POST   /api/v1/proyectos
GET    /api/v1/proyectos/:id
PATCH  /api/v1/proyectos/:id
DELETE /api/v1/proyectos/:id

# Ágil
GET    /api/v1/epicas
GET    /api/v1/sprints
GET    /api/v1/historias-usuario
GET    /api/v1/tareas
GET    /api/v1/sprints/:sprintId/tablero

# Recursos Humanos
GET    /api/v1/personal
GET    /api/v1/divisiones
GET    /api/v1/habilidades
GET    /api/v1/asignaciones

# Storage
POST   /api/v1/upload/request-url
POST   /api/v1/upload/confirm
GET    /api/v1/archivos/:id/download-url
```

## 🧪 Testing

El proyecto utiliza Jest para testing:

```bash
# Ejecutar todos los tests
npm run test

# Tests con coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Modo watch
npm run test:watch
```

### Estructura de Tests

```
src/modules/
└── auth/
    ├── auth.service.ts
    └── auth.service.spec.ts    # Tests unitarios

test/
└── auth.e2e-spec.ts            # Tests E2E
```

## 🔐 Módulos Principales

### AuthModule
- Autenticación con JWT
- Registro y login de usuarios
- Refresh tokens
- Guards y estrategias de Passport

### PlanningModule
- Gestión jerárquica de planificación estratégica
- PGD → OEI → OGD → OEGD → Acciones Estratégicas
- Alineación con objetivos institucionales

### PoiModule
- Gestión completa de proyectos
- Cronogramas y tareas
- Documentos y evidencias
- Requerimientos e informes

### AgileModule
- Implementación completa de Scrum/Kanban
- Épicas, sprints, historias de usuario
- Tableros Kanban
- Daily meetings
- Métricas y burndown charts

### RrhhModule
- Gestión de personal y divisiones
- Habilidades y certificaciones
- Asignaciones a proyectos
- Control de disponibilidad

### StorageModule
- Integración con MinIO (S3-compatible)
- URLs presignadas para upload/download
- Versionado de archivos
- Validación de virus
- Cleanup automático con cron jobs

### NotificacionesModule
- Notificaciones en tiempo real con WebSockets
- Múltiples tipos de notificaciones
- Sistema de prioridades

## 📝 Notas de Desarrollo

### Dependencias con Legacy Peer Deps

El proyecto requiere `--legacy-peer-deps` para la instalación debido a algunas incompatibilidades de versiones entre paquetes de NestJS 11 y módulos de terceros. Esto es normal y no afecta la funcionalidad.

```bash
npm install --legacy-peer-deps
```

### TypeORM y Nullable Columns

Las columnas nullable en TypeORM requieren declaración explícita del tipo:

```typescript
@Column({ name: 'created_by', type: 'int', nullable: true })
createdBy: number | null | undefined;
```

### JWT en NestJS 11

NestJS 11 tiene tipos más estrictos para JWT. Se recomienda usar type assertions:

```typescript
useFactory: (config: ConfigService): JwtModuleOptions => ({
  secret: config.get<string>('jwt.secret')!,
  signOptions: {
    expiresIn: config.get<string>('jwt.expiresIn')! as any,
  },
})
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propietario del INEI (Instituto Nacional de Estadística e Informática).

## 👥 Autores

- **OTIN** - *Desarrollo Inicial* - INEI

## 🔗 Enlaces Útiles

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [MinIO Documentation](https://min.io/docs/)
