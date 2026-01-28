# SIGP Backend - Indice de Documentacion

## Estructura de Carpetas

```
sigp-backend/
├── docs/                    # Documentacion del proyecto
│   ├── api/                 # Documentacion de API
│   ├── guides/              # Guias y manuales
│   ├── reports/             # Reportes de pruebas
│   └── specs/               # Especificaciones tecnicas
│
├── scripts/                 # Scripts de prueba y utilidades
│   ├── tests/               # Scripts de pruebas (.ps1)
│   ├── utils/               # Utilidades (reset, usuarios, etc.)
│   └── outputs/             # Resultados de pruebas (.txt, .json)
│
├── src/                     # Codigo fuente
├── test/                    # Tests unitarios y e2e (Jest)
└── database/                # Migraciones y seeds
```

---

## Documentacion (docs/)

### Guias (docs/guides/)

| Archivo | Descripcion |
|---------|-------------|
| [BACKEND_STRUCTURE_GUIDE.md](guides/BACKEND_STRUCTURE_GUIDE.md) | Estructura completa del backend NestJS |
| [IMPLEMENTATION_SUMMARY.md](guides/IMPLEMENTATION_SUMMARY.md) | Resumen de implementacion de modulos |
| [TESTING_GUIDE.md](guides/TESTING_GUIDE.md) | Guia completa para ejecutar pruebas |
| [CREDENCIALES_PRUEBA.md](guides/CREDENCIALES_PRUEBA.md) | Credenciales de usuarios de prueba |
| [POLITICA_PERMISOS.md](guides/POLITICA_PERMISOS.md) | Politica de roles y permisos |
| [GUIA_DAILY_MEETINGS_TESTS.md](guides/GUIA_DAILY_MEETINGS_TESTS.md) | Guia para pruebas de Daily Meetings |
| [INSTRUCCIONES_FASE_12_13.md](guides/INSTRUCCIONES_FASE_12_13.md) | Instrucciones fases 12 y 13 |
| [INTEGRACION_FASE12.md](guides/INTEGRACION_FASE12.md) | Integracion de fase 12 |
| [INDICE_DOCUMENTACION.md](guides/INDICE_DOCUMENTACION.md) | Indice original de documentacion |

### Reportes (docs/reports/)

| Archivo | Descripcion |
|---------|-------------|
| [REPORTE_FINAL_TESTS_AGILE.md](reports/REPORTE_FINAL_TESTS_AGILE.md) | Reporte final de pruebas Agile |
| [RESUMEN_EJECUTIVO_AGILE.md](reports/RESUMEN_EJECUTIVO_AGILE.md) | Resumen ejecutivo del modulo Agile |
| [TEST_REPORT.md](reports/TEST_REPORT.md) | Reporte general de pruebas |
| [TEST_SUMMARY.md](reports/TEST_SUMMARY.md) | Resumen de pruebas |
| [PLAN_TESTS_AGILE.md](reports/PLAN_TESTS_AGILE.md) | Plan de pruebas Agile |
| [DOCUMENTACION_API_GENERADA.md](reports/DOCUMENTACION_API_GENERADA.md) | Documentacion API generada |
| [DAILY_MEETINGS_TEST_SUMMARY.md](reports/DAILY_MEETINGS_TEST_SUMMARY.md) | Resumen pruebas Daily Meetings |
| [DAILY_MEETINGS_TESTS_MATRIX.md](reports/DAILY_MEETINGS_TESTS_MATRIX.md) | Matriz de pruebas Daily Meetings |
| [FASE_10_DAILY_MEETINGS_REPORT.md](reports/FASE_10_DAILY_MEETINGS_REPORT.md) | Reporte fase 10 Daily Meetings |
| [FASE_12_13_METRICAS_REPORTE.md](reports/FASE_12_13_METRICAS_REPORTE.md) | Metricas fases 12-13 |
| [FASE12_*.md](reports/) | Reportes de fase 12 |
| [SUBTAREAS_*.md](reports/) | Reportes de subtareas |

### Especificaciones Tecnicas (docs/specs/)

| Archivo | Descripcion |
|---------|-------------|
| 01_AUTENTICACION.md | Especificacion del modulo de autenticacion |
| 02_PLANNING.md | Especificacion del modulo de planificacion |
| 03_POI.md | Especificacion del modulo POI |
| 04_ARQUITECTURA_BD.md | Arquitectura de base de datos |
| 05_AGILE.md | Especificacion del modulo Agile |

### API (docs/api/)

Documentacion Swagger/OpenAPI generada automaticamente.

---

## Scripts de Prueba (scripts/)

### Tests (scripts/tests/)

**Scripts principales de prueba:**

| Script | Descripcion | Comando |
|--------|-------------|---------|
| `simular-flujo-kanban.ps1` | Simulacion completa de flujo Kanban | `powershell -File scripts/tests/simular-flujo-kanban.ps1` |
| `test-agile-exhaustivo.ps1` | Pruebas exhaustivas del modulo Agile | `powershell -File scripts/tests/test-agile-exhaustivo.ps1` |
| `test-planning-fixed.ps1` | Pruebas del modulo Planning | `powershell -File scripts/tests/test-planning-fixed.ps1` |
| `test-poi-simple.ps1` | Pruebas del modulo POI | `powershell -File scripts/tests/test-poi-simple.ps1` |
| `test-historial-cambios.ps1` | Pruebas de historial de cambios | `powershell -File scripts/tests/test-historial-cambios.ps1` |

**Scripts de permisos y roles:**

| Script | Descripcion |
|--------|-------------|
| `test-admin-permisos.ps1` | Prueba permisos de ADMIN |
| `test-pmo-permisos.ps1` | Prueba permisos de PMO |
| `comparar-tokens.ps1` | Comparacion de tokens JWT |

**Scripts adicionales:**

| Script | Descripcion |
|--------|-------------|
| `test-agile-fase12-participantes.ps1` | Pruebas de participantes fase 12 |
| `test-bugs.ps1` / `test-bugs-simple.ps1` | Pruebas de bugs |
| `test-api.ps1` | Prueba basica de API |

### Utilidades (scripts/utils/)

| Script | Descripcion | Uso |
|--------|-------------|-----|
| `create-test-users.ps1` | Crea 7 usuarios de prueba | Ejecutar una vez para setup |
| `reset-usuarios.ps1` | Resetea passwords de usuarios | Cuando se bloquean cuentas |
| `reset-admin.ps1` | Resetea solo el usuario admin | Emergencia |
| `update-passwords.sql` | SQL para actualizar passwords | Via psql |
| `fix-encoding.ps1` | Corrige encoding de archivos | Problemas de charset |
| `fix-syntax.ps1` | Corrige errores de sintaxis | Problemas de PowerShell |

### Outputs (scripts/outputs/)

Resultados de ejecuciones de pruebas (no ejecutar, solo referencia):

- `test-*-output.txt` - Logs de salida de pruebas
- `test-*-results.json` - Resultados en formato JSON
- `FASE12_*.txt` - Outputs visuales de fase 12

---

## Como Ejecutar Pruebas

### 1. Requisitos Previos

```bash
# Iniciar contenedores Docker
docker-compose up -d

# Verificar que la API esta corriendo
curl http://localhost:3010/api/v1/auth/login
```

### 2. Crear Usuarios de Prueba (solo primera vez)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/utils/create-test-users.ps1
```

### 3. Ejecutar Pruebas

**Prueba rapida de API:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/tests/test-api.ps1
```

**Prueba completa del modulo Agile:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/tests/test-agile-exhaustivo.ps1
```

**Simulacion de flujo Kanban:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/tests/simular-flujo-kanban.ps1
```

### 4. Si hay problemas de login

```powershell
# Resetear passwords de todos los usuarios
powershell -ExecutionPolicy Bypass -File scripts/utils/reset-usuarios.ps1
```

---

## Usuarios de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| ADMIN | admin@inei.gob.pe | Password123! |
| PMO | pmo@inei.gob.pe | Password123! |
| COORDINADOR | coordinador@inei.gob.pe | Password123! |
| SCRUM_MASTER | scrummaster@inei.gob.pe | Password123! |
| PATROCINADOR | patrocinador@inei.gob.pe | Password123! |
| DESARROLLADOR | desarrollador@inei.gob.pe | Password123! |
| IMPLEMENTADOR | implementador@inei.gob.pe | Password123! |

---

## Tests Unitarios (Jest)

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests con cobertura
npm run test:cov

# Ejecutar tests e2e
npm run test:e2e

# Ejecutar test especifico
npm run test -- --testPathPattern="tarea.service"
```

---

## Endpoints Principales

### Autenticacion
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/logout` - Logout

### Modulo Agile
- `GET /api/v1/tareas` - Listar tareas
- `POST /api/v1/tareas` - Crear tarea
- `PATCH /api/v1/tareas/:id/estado` - Cambiar estado
- `GET /api/v1/tareas/:id/evidencias` - Listar evidencias
- `POST /api/v1/tareas/:id/evidencias` - Agregar evidencia
- `GET /api/v1/actividades/:id/tablero-kanban` - Tablero Kanban
- `GET /api/v1/actividades/:id/tareas` - Tareas de actividad

### Swagger
- `http://localhost:3010/api/docs` - Documentacion interactiva
