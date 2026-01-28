# Guía de Deployment en Railway - SIGP Backend

Este documento detalla todos los cambios y configuraciones necesarios para desplegar el backend SIGP en Railway.

## Resumen de Cambios Realizados

### 1. Configuración SSL para PostgreSQL

**Problema:** Railway usa certificados SSL auto-firmados para PostgreSQL. El error era:
```
Error: self-signed certificate in certificate chain
```

**Solución:** Modificar la configuración SSL para aceptar certificados auto-firmados.

**Archivo:** `src/config/database.config.ts`
```typescript
// ANTES
ssl: process.env.DATABASE_SSL === 'true' || false,

// DESPUÉS
ssl: process.env.DATABASE_SSL === 'true'
  ? { rejectUnauthorized: false }
  : false,
```

**Archivo:** `src/app.module.ts`
```typescript
// En TypeORM configuration
ssl: sslEnabled ? { rejectUnauthorized: false } : false,
```

---

### 2. Creación Automática de Schemas PostgreSQL

**Problema:** El proyecto usa múltiples schemas (planning, poi, agile, rrhh, notificaciones, storage) que TypeORM no crea automáticamente. El error era:
```
QueryFailedError: schema "rrhh" does not exist
```

**Solución:** Crear los schemas automáticamente antes de que TypeORM sincronice.

**Archivo:** `src/app.module.ts`
```typescript
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const sslEnabled = config.get('database.ssl');
    const sslConfig = sslEnabled ? { rejectUnauthorized: false } : false;

    // Create schemas if they don't exist (for Railway and fresh databases)
    if (config.get('database.synchronize')) {
      const { Client } = await import('pg');
      const client = new Client({
        host: config.get('database.host'),
        port: config.get('database.port'),
        user: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        ssl: sslConfig,
      });

      try {
        await client.connect();
        const schemas = ['planning', 'poi', 'agile', 'rrhh', 'notificaciones', 'storage'];
        for (const schema of schemas) {
          await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
        }
        console.log('Database schemas created/verified successfully');
      } catch (error) {
        console.error('Error creating schemas:', error.message);
      } finally {
        await client.end();
      }
    }

    return {
      type: 'postgres',
      // ... resto de configuración
    };
  },
}),
```

---

### 3. Configuración de Docker Compose (Local)

**Archivo:** `docker-compose.yml`

Cambios realizados:
- Renombrado del proyecto a `sgip-backend-deploy`
- Contenedores renombrados:
  - `sgip-backend-deploy-api`
  - `sgip-backend-deploy-postgres`
  - `sgip-backend-deploy-redis`
  - `sgip-backend-deploy-minio`
- Puerto de API cambiado a 3011 (para evitar conflictos)
- Volúmenes y red renombrados

---

## Configuración en Railway

### Arquitectura de Servicios

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Project                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐    ┌──────────────┐                  │
│   │    minio     │    │    Redis     │                  │
│   │   (Docker)   │    │  (Database)  │                  │
│   └──────┬───────┘    └──────┬───────┘                  │
│          │                   │                          │
│          └─────────┬─────────┘                          │
│                    │                                    │
│          ┌─────────▼─────────┐                          │
│          │  SIGP-BACKEND-    │                          │
│          │     DEPLOY        │                          │
│          │   (GitHub Repo)   │                          │
│          └─────────┬─────────┘                          │
│                    │                                    │
│          ┌─────────▼─────────┐                          │
│          │    PostgreSQL     │                          │
│          │    (Database)     │                          │
│          └───────────────────┘                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Variables de Entorno para la API

```env
# Application
NODE_ENV=production
PORT=3010
API_PREFIX=api/v1
CORS_ORIGIN=*

# Database - Referencias dinámicas de Railway
DATABASE_HOST=${{Postgres.PGHOST}}
DATABASE_PORT=${{Postgres.PGPORT}}
DATABASE_USERNAME=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
DATABASE_NAME=${{Postgres.PGDATABASE}}
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=false
DATABASE_SSL=true

# Redis - Referencias dinámicas de Railway
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
REDIS_DB=0
REDIS_KEY_PREFIX=sigp:

# MinIO
MINIO_ENDPOINT=${{minio.RAILWAY_PRIVATE_DOMAIN}}
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123secure
MINIO_USE_SSL=false

# JWT
JWT_SECRET=your-production-secret-min-32-chars
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret-production
JWT_REFRESH_EXPIRATION=7d
```

### Configuración de MinIO en Railway

1. **Imagen Docker:** `minio/minio`
2. **Start Command:** `minio server /data --console-address ":9001"`
3. **Variables:**
   - `MINIO_ROOT_USER=minioadmin`
   - `MINIO_ROOT_PASSWORD=minioadmin123secure`
4. **Volume:** Montar en `/data` para persistencia

---

## Diferencias Clave: Local vs Railway

| Aspecto | Local (Docker Compose) | Railway |
|---------|------------------------|---------|
| SSL PostgreSQL | `false` | `true` con `rejectUnauthorized: false` |
| Schemas | Creados por scripts SQL | Creados automáticamente por la app |
| Servicios | Todos en un docker-compose | Servicios independientes |
| Red | `sigp-network` interna | Red privada de Railway |
| Variables | `.env` file | Variables en Railway Dashboard |
| MinIO | Contenedor local | Docker Image en Railway |
| Volúmenes | Docker volumes locales | Railway Volumes |

---

## Errores Comunes y Soluciones

### Error 1: SSL Certificate
```
Error: self-signed certificate in certificate chain
```
**Solución:** Configurar `ssl: { rejectUnauthorized: false }`

### Error 2: Schema Not Found
```
QueryFailedError: schema "rrhh" does not exist
```
**Solución:** Crear schemas automáticamente antes de TypeORM synchronize

### Error 3: MinIO Start Command
```
The executable 'server' could not be found
```
**Solución:** Usar `minio server /data --console-address ":9001"` (incluir `minio` al inicio)

### Error 4: Application Failed to Respond
```
502 Bad Gateway - Application failed to respond
```
**Solución:** Verificar logs de deployment, usualmente es error de conexión a DB o Redis

---

## Flujo de Inicialización en Railway

```
1. Railway detecta push a GitHub
         ↓
2. Build usando Dockerfile (stage: development)
         ↓
3. Container inicia con `npm run start:dev`
         ↓
4. NestJS comienza compilación TypeScript
         ↓
5. App se conecta a PostgreSQL
         ↓
6. Crea schemas automáticamente (si SYNCHRONIZE=true)
         ↓
7. TypeORM sincroniza entidades (crea tablas)
         ↓
8. Se conecta a Redis
         ↓
9. Inicializa MinIO Service
         ↓
10. API lista en el puerto configurado
```

---

## Comandos Útiles

### GitHub CLI
```bash
# Autenticación
gh auth login --web -h github.com

# Crear repo y push
gh repo create SIGP-BACKEND-DEPLOY --public --source . --remote origin --push
```

### Git
```bash
# Commit con co-author
git commit -m "mensaje" -m "Co-Authored-By: Claude <noreply@anthropic.com>"

# Push
git push origin master
```

### Railway (si usas CLI)
```bash
# Login
railway login

# Link proyecto
railway link

# Deploy
railway up

# Logs
railway logs
```

---

## Archivos Modificados

1. `src/config/database.config.ts` - SSL configuration
2. `src/app.module.ts` - SSL + Auto-create schemas
3. `docker-compose.yml` - Renamed containers and project

---

## URLs del Proyecto

- **Repositorio:** https://github.com/Robinson1804/SIGP-BACKEND-DEPLOY
- **API Railway:** https://sigp-backend-deploy-production.up.railway.app
- **Swagger Docs:** https://sigp-backend-deploy-production.up.railway.app/api/docs

---

## Notas de Producción

⚠️ **Importante para producción:**

1. Cambiar `DATABASE_SYNCHRONIZE=false` después del primer deploy
2. Usar secrets seguros para JWT_SECRET y JWT_REFRESH_SECRET
3. Configurar CORS_ORIGIN con dominios específicos
4. Habilitar DATABASE_LOGGING=false en producción
5. Considerar usar migraciones en lugar de synchronize
