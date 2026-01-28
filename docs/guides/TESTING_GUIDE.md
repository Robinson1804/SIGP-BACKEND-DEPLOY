# SIGP Backend - Testing Guide

Esta guía proporciona instrucciones paso a paso para ejecutar la suite de tests del proyecto SIGP Backend.

---

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Ejecutar Tests](#ejecutar-tests)
4. [Interpretar Resultados](#interpretar-resultados)
5. [Troubleshooting](#troubleshooting)
6. [CI/CD](#cicd)

---

## 1. Prerequisitos

### Software Requerido

- ✅ Node.js >= 20.x
- ✅ npm >= 10.x
- ✅ Docker >= 20.x
- ✅ Docker Compose >= 2.x

### Verificar Instalación

```bash
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x
docker --version  # Should show 20.x.x+
docker-compose --version  # Should show 2.x.x+
```

---

## 2. Configuración Inicial

### Paso 1: Instalar Dependencias

```bash
cd E:\Sistema de Gestion de Proyectos\sigp-backend
npm install --legacy-peer-deps
```

**Nota**: El flag `--legacy-peer-deps` es necesario por incompatibilidades entre NestJS 11 y algunos paquetes.

### Paso 2: Configurar Variables de Entorno

Asegúrate de tener un archivo `.env` en la raíz del proyecto:

```bash
# Si no existe, copia el ejemplo
cp .env.example .env
```

Verifica que el archivo `.env` tenga estas configuraciones para testing:

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

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=0

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
```

### Paso 3: Iniciar Servicios de Infraestructura

```bash
# Iniciar PostgreSQL, Redis y MinIO
docker-compose up -d postgres redis minio

# Verificar que los servicios estén corriendo
docker-compose ps
```

Deberías ver algo como:

```
NAME                COMMAND                  SERVICE             STATUS              PORTS
sigp-postgres       "docker-entrypoint.s…"   postgres            running             0.0.0.0:5433->5432/tcp
sigp-redis          "docker-entrypoint.s…"   redis               running             0.0.0.0:6380->6379/tcp
sigp-minio          "/usr/bin/docker-ent…"   minio               running             0.0.0.0:9000-9001->9000-9001/tcp
```

### Paso 4: Ejecutar Migraciones de Base de Datos

```bash
npm run migration:run
```

### Paso 5: (Opcional) Cargar Datos Iniciales

```bash
npm run seed:run
```

---

## 3. Ejecutar Tests

### 3.1 Tests Unitarios

Los tests unitarios son rápidos y no requieren servicios externos.

```bash
# Ejecutar todos los tests unitarios
npm run test

# Ejecutar un test específico
npm run test -- proyecto.service.spec.ts

# Ejecutar tests en modo watch (útil para desarrollo)
npm run test:watch

# Ejecutar con coverage
npm run test:cov
```

**Tiempo estimado**: 5-10 segundos

**Output esperado**:
```
 PASS  src/modules/poi/proyectos/services/proyecto.service.spec.ts
 PASS  src/modules/agile/sprints/services/sprint.service.spec.ts
 PASS  src/modules/storage/services/minio.service.spec.ts
 PASS  src/modules/auth/services/auth.service.spec.ts

Test Suites: 4 passed, 4 total
Tests:       69 passed, 69 total
Snapshots:   0 total
Time:        8.123 s
```

### 3.2 Tests E2E

Los tests E2E requieren que la aplicación esté completamente funcional.

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar un test E2E específico
npm run test:e2e -- proyectos.e2e-spec.ts

# Ejecutar con más información
npm run test:e2e -- --verbose
```

**Tiempo estimado**: 30-60 segundos

**Output esperado**:
```
 PASS  test/auth.e2e-spec.ts
 PASS  test/proyectos.e2e-spec.ts
 PASS  test/sprints.e2e-spec.ts

Test Suites: 3 passed, 3 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        45.678 s
```

### 3.3 Tests de Integración

Los tests de integración validan la conexión con servicios externos.

```bash
# Ejecutar tests de integración de base de datos
npm run test:e2e -- test/integration/database.integration-spec.ts

# Ejecutar tests de integración de Redis
npm run test:e2e -- test/integration/redis.integration-spec.ts

# Ejecutar todos los tests de integración
npm run test:e2e -- test/integration
```

**Tiempo estimado**: 20-30 segundos

### 3.4 Ejecutar Todos los Tests

```bash
# Opción 1: Ejecutar secuencialmente
npm run test && npm run test:e2e

# Opción 2: Script personalizado (agregar a package.json)
npm run test:all
```

**Nota**: Para `test:all`, agrega este script a `package.json`:

```json
{
  "scripts": {
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## 4. Interpretar Resultados

### 4.1 Tests Exitosos

```
✓ should create a proyecto successfully (15 ms)
✓ should throw ConflictException if codigo already exists (8 ms)
✓ should update sprint as SCRUM_MASTER (120 ms)
```

- ✅ Verde/Check = Test pasó correctamente
- Número entre paréntesis = Tiempo de ejecución

### 4.2 Tests Fallidos

```
✕ should create proyecto as ADMIN (200 ms)

  Expected: 201
  Received: 500

  at Object.<anonymous> (test/proyectos.e2e-spec.ts:45:21)
```

- ❌ Rojo/X = Test falló
- Muestra la diferencia entre lo esperado y lo recibido
- Indica la línea del archivo donde falló

### 4.3 Reporte de Coverage

```bash
npm run test:cov
```

Output esperado:

```
------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------|---------|----------|---------|---------|-------------------
All files         |   78.50 |    72.30 |   80.15 |   78.50 |
 proyecto.service |   85.71 |    75.00 |   88.88 |   85.71 | 45-47,89
 sprint.service   |   82.35 |    70.00 |   85.71 |   82.35 | 120-125,180
 auth.service     |   90.25 |    85.50 |   92.50 |   90.25 | 67,145
------------------|---------|----------|---------|---------|-------------------
```

**Interpretación**:
- **% Stmts**: Porcentaje de statements ejecutados
- **% Branch**: Porcentaje de ramas condicionales probadas
- **% Funcs**: Porcentaje de funciones llamadas
- **% Lines**: Porcentaje de líneas ejecutadas
- **Uncovered Line #s**: Líneas no cubiertas por tests

**Meta**: 75-80% de coverage general

---

## 5. Troubleshooting

### Problema 1: Tests Fallan con Error de Conexión a BD

**Error**:
```
Error: connect ECONNREFUSED 127.0.0.1:5433
```

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Si no está corriendo, iniciarlo
docker-compose up -d postgres

# Verificar logs
docker-compose logs postgres
```

---

### Problema 2: Tests E2E Fallan con 401 Unauthorized

**Error**:
```
Expected status 200, received 401
```

**Posibles causas**:
1. Token JWT expirado
2. Usuario de prueba no existe
3. Configuración de JWT incorrecta

**Solución**:
```bash
# Verificar variables de entorno
cat .env | grep JWT

# Limpiar base de datos de test
docker-compose exec postgres psql -U postgres -d sigp_inei -c "TRUNCATE usuarios CASCADE;"

# Ejecutar seeds
npm run seed:run
```

---

### Problema 3: Tests de Redis Fallan

**Error**:
```
Error: Redis connection failed
```

**Solución**:
```bash
# Verificar Redis
docker-compose ps redis

# Reiniciar Redis
docker-compose restart redis

# Limpiar cache de Redis
docker-compose exec redis redis-cli FLUSHALL
```

---

### Problema 4: Tests Lentos

**Síntoma**: Tests tardan más de 2 minutos

**Soluciones**:

1. **Ejecutar solo tests específicos**:
```bash
npm run test -- proyecto.service
```

2. **Limpiar datos de test entre ejecuciones**:
```bash
docker-compose exec postgres psql -U postgres -d sigp_inei -c "DELETE FROM proyectos WHERE codigo LIKE 'PRY-E2E%';"
```

3. **Aumentar timeout de Jest** (en `jest.config.js`):
```javascript
{
  testTimeout: 30000 // 30 segundos
}
```

---

### Problema 5: Mock no Funciona Correctamente

**Error**:
```
TypeError: Cannot read property 'findOne' of undefined
```

**Solución**:
```typescript
// Asegúrate de que el mock esté correctamente definido
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ProyectoService,
      {
        provide: getRepositoryToken(Proyecto),
        useValue: {
          findOne: jest.fn(),
          find: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
      },
    ],
  }).compile();
});
```

---

## 6. CI/CD

### 6.1 GitHub Actions (Recomendado)

Crea `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: 1234
          POSTGRES_DB: sigp_inei
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6380:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      minio:
        image: minio/minio
        env:
          MINIO_ROOT_USER: minioadmin
          MINIO_ROOT_PASSWORD: minioadmin
        ports:
          - 9000:9000
        options: >-
          --health-cmd "curl -f http://localhost:9000/minio/health/live"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Run unit tests
        run: npm run test:cov

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_HOST: localhost
          DATABASE_PORT: 5433
          REDIS_HOST: localhost
          REDIS_PORT: 6380
          MINIO_ENDPOINT: localhost
          MINIO_PORT: 9000

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

### 6.2 Ejecutar Localmente como CI

```bash
# Simular pipeline de CI localmente
docker-compose up -d
npm ci --legacy-peer-deps
npm run test:cov
npm run test:e2e
```

---

## 7. Comandos Rápidos

### Comandos Frecuentes

```bash
# Iniciar infraestructura
docker-compose up -d

# Tests rápidos (solo unitarios)
npm run test

# Tests completos
npm run test && npm run test:e2e

# Coverage
npm run test:cov

# Limpiar y reiniciar
docker-compose down -v && docker-compose up -d
npm run migration:run
npm run seed:run
```

### Scripts Útiles para Agregar a package.json

```json
{
  "scripts": {
    "test:unit": "jest --testRegex=\\.spec\\.ts$",
    "test:integration": "jest --config ./test/jest-e2e.json test/integration",
    "test:all": "npm run test:unit && npm run test:e2e",
    "test:watch:unit": "jest --watch --testRegex=\\.spec\\.ts$",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:clear": "jest --clearCache"
  }
}
```

---

## 8. Mejores Prácticas

### Antes de Hacer Commit

```bash
# 1. Ejecutar linter
npm run lint

# 2. Formatear código
npm run format

# 3. Ejecutar tests
npm run test

# 4. Verificar que todo pase
echo "All checks passed ✅"
```

### Escribir Nuevos Tests

1. **Sigue el patrón AAA** (Arrange-Act-Assert):
```typescript
it('should create proyecto', async () => {
  // Arrange: Preparar datos y mocks
  const createDto = { codigo: 'PRY001', nombre: 'Test' };
  repository.save.mockResolvedValue({ id: 1, ...createDto });

  // Act: Ejecutar la función
  const result = await service.create(createDto);

  // Assert: Verificar resultados
  expect(result.id).toBe(1);
  expect(repository.save).toHaveBeenCalled();
});
```

2. **Nombres descriptivos**:
```typescript
// ❌ Mal
it('test1', () => {});

// ✅ Bien
it('should throw ConflictException when codigo already exists', () => {});
```

3. **Cleanup en afterEach**:
```typescript
afterEach(async () => {
  await repository.delete({ codigo: 'TEST' });
  jest.clearAllMocks();
});
```

---

## 9. Recursos Adicionales

### Documentación

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
- [TypeORM Testing](https://typeorm.io/testing)

### Archivos de Referencia

- `TEST_REPORT.md` - Reporte detallado de tests
- `TEST_SUMMARY.md` - Resumen visual de tests
- Tests existentes en `src/` y `test/` - Ejemplos de implementación

---

## 10. Checklist de Testing

Antes de considerar el testing completo:

- [ ] Todos los tests unitarios pasan
- [ ] Todos los tests E2E pasan
- [ ] Todos los tests de integración pasan
- [ ] Coverage > 75%
- [ ] No hay tests flakey (que fallan aleatoriamente)
- [ ] CI/CD pipeline configurado
- [ ] Documentación actualizada
- [ ] Tests en código limpio y mantenible

---

## Conclusión

Esta guía proporciona todo lo necesario para ejecutar y mantener la suite de tests del proyecto SIGP Backend. Para dudas específicas, consulta los archivos de tests existentes como referencia.

**Happy Testing! 🧪**

---

**Última Actualización**: 2025-12-14
**Versión**: 1.0
