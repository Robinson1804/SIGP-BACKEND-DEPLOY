# Reporte de Ampliacion de Tests - Subtareas (Fase 9)

## Resumen

Se han agregado **30 tests detallados** para el modulo de Subtareas en el archivo `test-agile-exhaustivo.ps1`, expandiendo la cobertura original de 4 tests basicos a un total de **34 tests**.

## Ubicacion

- **Archivo**: `E:\Sistema de Gestion de Proyectos\sigp-backend\test-agile-exhaustivo.ps1`
- **Fase**: 9 - SUBTAREAS DETALLADAS
- **Lineas**: 494-565
- **Tests agregados**: 9.1 - 9.30

## Desglose de Tests por Categoria

### 9.1 Creacion Avanzada (4 tests)

| Test | Descripcion | Endpoint | Valida |
|------|-------------|----------|--------|
| 9.1 | Crear subtarea con responsable | POST /subtareas | Asignacion directa de responsable + prioridad Alta + horas estimadas |
| 9.2 | Crear subtarea con fechas | POST /subtareas | Fechas de inicio/fin + prioridad Media |
| 9.3 | Crear subtarea prioridad Alta | POST /subtareas | Prioridad Alta en tarea KANBAN 2 |
| 9.4 | Crear subtarea prioridad Baja | POST /subtareas | Prioridad Baja para refactoring |

**IDs guardados**: `subtareaId3`, `subtareaId4`, `subtareaId5`, `subtareaId6`

### 9.2 Estados y Flujos (5 tests)

| Test | Descripcion | Endpoint | Valida |
|------|-------------|----------|--------|
| 9.5 | Cambiar estado a En progreso | PATCH /subtareas/:id | Transicion Por hacer → En progreso |
| 9.6 | Cambiar estado a En revision | PATCH /subtareas/:id | Transicion En progreso → En revision |
| 9.7 | Finalizar subtarea con evidencia | PATCH /subtareas/:id | Estado Finalizado + URL evidencia + horas reales |
| 9.8 | Crear subtarea para estadisticas | POST /subtareas | Subtarea adicional para calculos |
| 9.9 | Finalizar para estadisticas | PATCH /subtareas/:id | Segunda subtarea finalizada (% completado) |

**Estados validados**: Por hacer, En progreso, En revision, Finalizado

### 9.3 Asignacion de Responsables (3 tests)

| Test | Descripcion | Endpoint | Valida |
|------|-------------|----------|--------|
| 9.10 | Asignar responsable | PATCH /subtareas/:id | Asignacion inicial de responsable (userId 15) |
| 9.11 | Reasignar responsable | PATCH /subtareas/:id | Cambio de responsable (PMO) |
| 9.12 | Desarrollador actualiza su subtarea | PATCH /subtareas/:id | Permiso DESARROLLADOR para subtareas asignadas |

**Roles probados**: ADMIN, PMO, DESARROLLADOR

### 9.4 Estadisticas (2 tests)

| Test | Descripcion | Endpoint | Valida |
|------|-------------|----------|--------|
| 9.13 | Obtener estadisticas de tarea | GET /tareas/:tareaId/subtareas/estadisticas | Total, por estado, horas estimadas/reales, progreso |
| 9.14 | Obtener estadisticas de tarea 2 | GET /tareas/:tareaId/subtareas/estadisticas | Estadisticas de segunda tarea KANBAN |

**Metricas validadas**:
- Total de subtareas
- Distribucion por estado
- Horas estimadas vs reales
- Porcentaje de completado

### 9.5 Filtros y Consultas (3 tests)

| Test | Descripcion | Endpoint | Valida |
|------|-------------|----------|--------|
| 9.15 | Filtrar subtareas por tarea | GET /subtareas?tareaId=X | Query param filtering |
| 9.16 | Listar subtareas (endpoint anidado) | GET /tareas/:tareaId/subtareas | Nested route |
| 9.17 | Obtener subtarea por ID | GET /subtareas/:id | Detalle con relaciones |

### 9.6 Actualizacion de Campos (3 tests)

| Test | Descripcion | Endpoint | Valida |
|------|-------------|----------|--------|
| 9.18 | Actualizar descripcion y nombre | PATCH /subtareas/:id | Modificacion de textos descriptivos |
| 9.19 | Actualizar horas estimadas | PATCH /subtareas/:id | Modificacion de estimacion + fechas |
| 9.20 | Actualizar prioridad | PATCH /subtareas/:id | Cambio Baja → Media |

### 9.7 Validaciones de Negocio (4 tests - ShouldFail)

| Test | Descripcion | Endpoint | Status Esperado | Valida |
|------|-------------|----------|-----------------|--------|
| 9.21 | Rechazar sin tareaId | POST /subtareas | 400 | Campo requerido |
| 9.22 | Rechazar tarea SCRUM | POST /subtareas | 400 | Solo KANBAN permitido |
| 9.23 | Rechazar codigo duplicado | POST /subtareas | 409 | Unique constraint por tarea |
| 9.24 | Rechazar tarea inexistente | POST /subtareas | 404 | Validacion FK |

### 9.8 Validaciones de Permisos (1 test - ShouldFail)

| Test | Descripcion | Endpoint | Status Esperado | Valida |
|------|-------------|----------|-----------------|--------|
| 9.25 | Rechazar creacion sin permisos | POST /subtareas | 403 | DESARROLLADOR no puede crear |

**Permisos requeridos para crear**: ADMIN, PMO, COORDINADOR

### 9.9 Eliminacion (5 tests)

| Test | Descripcion | Endpoint | Valida |
|------|-------------|----------|--------|
| 9.26 | Crear subtarea para eliminar | POST /subtareas | Setup para test de eliminacion |
| 9.27 | Eliminar subtarea | DELETE /subtareas/:id | Soft delete exitoso |
| 9.28 | Validar eliminacion | GET /subtareas/:id | Entidad sigue existiendo (soft delete) |
| 9.29 | Verificar no aparece en listado | GET /tareas/:tareaId/subtareas | Flag activo=false |
| 9.30 | Rechazar eliminacion sin permisos | DELETE /subtareas/:id | DESARROLLADOR no puede eliminar |

**ID guardado**: `subtareaDeleteId`

## Cobertura de Endpoints

### Endpoints Probados

| Metodo | Endpoint | Tests | Notas |
|--------|----------|-------|-------|
| POST | /subtareas | 9 | Creacion con multiples configuraciones |
| GET | /subtareas | 1 | Con filtro tareaId |
| GET | /subtareas/:id | 2 | Detalle individual |
| PATCH | /subtareas/:id | 11 | Estados, campos, asignaciones |
| DELETE | /subtareas/:id | 2 | Soft delete + validacion permisos |
| GET | /tareas/:tareaId/subtareas | 2 | Endpoint anidado |
| GET | /tareas/:tareaId/subtareas/estadisticas | 2 | Metricas agregadas |

**Total**: 7 endpoints unicos, 29 invocaciones

## Estados Validados

- **Por hacer** (default)
- **En progreso** (transicion activa)
- **En revision** (transicion activa)
- **Finalizado** (con evidencia URL)

**Nota**: El estado "Bloqueado" existe en el enum pero no se probo en esta fase (puede agregarse).

## Prioridades Validadas

- **Alta**: Tests 9.1, 9.3, 9.5-9.7
- **Media**: Tests 9.2, 9.20
- **Baja**: Test 9.4

## Variables de Entorno Utilizadas

### IDs Reutilizados
- `$ids.tareaKanbanId` - Tarea KANBAN principal (de Fase 4)
- `$ids.tareaKanbanId2` - Segunda tarea KANBAN (de Fase 4)
- `$ids.tareaId` - Tarea SCRUM (para test de rechazo)
- `$ids.subtareaId` - Subtarea original (de Fase 4, test 4.13)
- `$ids.subtareaId2` - Segunda subtarea original (de Fase 4, test 4.14)

### IDs Nuevos Creados (agregados al hashtable)
- `$ids.subtareaId3` - Test 9.1
- `$ids.subtareaId4` - Test 9.2
- `$ids.subtareaId5` - Test 9.3
- `$ids.subtareaId6` - Test 9.4
- `$ids.subtareaId7` - Test 9.8
- `$ids.subtareaDeleteId` - Test 9.26

### Tokens Utilizados
- `$adminToken` - Tests de creacion, actualizacion, eliminacion
- `$pmoToken` - Tests de creacion y actualizacion
- `$coordinadorToken` - Test 9.3
- `$devToken` - Tests 9.12, 9.25 (validacion permisos), 9.30

## Cambios en el Script

### 1. Hashtable de IDs (lineas 58-65)
Agregados 6 nuevos campos:
```powershell
subtareaId3 = $null
subtareaId4 = $null
subtareaId5 = $null
subtareaId6 = $null
subtareaId7 = $null
subtareaDeleteId = $null
```

### 2. Renumeracion de Fases
- **Fase 9 antigua** (Participantes de Dailys) → **Fase 10**
- **Fase 10 antigua** (Daily Meetings) → **Fase 11**
- Se actualizaron 45 referencias de tests (11.1 - 11.45)

## Metricas de Calidad

### Distribucion de Tests
- **Tests positivos**: 24 (80%)
- **Tests negativos (ShouldFail)**: 6 (20%)

### Tipos de Validacion
- **Creacion**: 5 tests
- **Consulta**: 5 tests
- **Actualizacion**: 11 tests
- **Eliminacion**: 3 tests
- **Validaciones de negocio**: 4 tests
- **Validaciones de permisos**: 2 tests

### Cobertura de Roles
- **ADMIN**: 21 tests
- **PMO**: 5 tests
- **COORDINADOR**: 1 test
- **DESARROLLADOR**: 3 tests (2 negativos, 1 positivo)

## Casos de Uso Cubiertos

1. **Creacion granular**: Subtareas con responsables, fechas, prioridades
2. **Gestion de estados**: Flujo completo Por hacer → Finalizado
3. **Tracking de horas**: Estimadas vs reales
4. **Asignacion dinamica**: Cambio de responsables
5. **Metricas de progreso**: Estadisticas por tarea
6. **Filtrado**: Por tarea (query params y nested routes)
7. **Validacion de reglas**: Solo KANBAN, unique codes, permisos
8. **Soft delete**: Eliminacion logica sin perder datos

## Proximos Pasos Sugeridos

### Tests Adicionales Potenciales
1. **Estado "Bloqueado"**: Agregar tests para el 5to estado
2. **Validacion de fechas**: fechaFin < fechaInicio
3. **Actualizacion de codigo**: Cambio de codigo unico
4. **Filtros multiples**: Combinar estado + prioridad + responsable
5. **Ordenamiento**: Tests para verificar orden por prioridad/fecha
6. **Relaciones**: Verificar carga de tarea y responsable
7. **Bulk operations**: Crear/actualizar multiples subtareas
8. **Historial de cambios**: Si se implementa auditoria

### Integracion con otros Modulos
1. **Comentarios**: Tests de comentarios en subtareas (ya existente en Fase 7)
2. **Notificaciones**: Eventos al asignar/finalizar subtareas
3. **Tableros Kanban**: Visualizacion de subtareas en tablero

## Comandos de Ejecucion

### Ejecutar solo Fase 9
```powershell
# No hay forma de ejecutar solo una fase, pero puedes comentar las otras
# O ejecutar el script completo:
.\test-agile-exhaustivo.ps1
```

### Ejecutar script completo
```powershell
cd "E:\Sistema de Gestion de Proyectos\sigp-backend"
.\test-agile-exhaustivo.ps1
```

### Ver resultados en JSON
```powershell
Get-Content .\test-agile-results.json | ConvertFrom-Json | Format-List
```

## Conclusiones

La Fase 9 amplifica significativamente la cobertura de tests de Subtareas:

- **Antes**: 4 tests basicos (CRUD minimo)
- **Despues**: 34 tests (8.5x incremento)
- **Endpoints cubiertos**: 7/7 (100%)
- **Estados cubiertos**: 4/5 (80%)
- **Prioridades cubiertas**: 3/3 (100%)
- **Roles validados**: 4/4 (100%)

El conjunto de tests cubre flujos criticos de negocio, validaciones de seguridad, y metricas de seguimiento, asegurando la robustez del modulo de Subtareas en el sistema Agile.

---

**Fecha de creacion**: 2025-12-15
**Autor**: Claude Code (Sonnet 4.5)
**Version del script**: test-agile-exhaustivo.ps1
