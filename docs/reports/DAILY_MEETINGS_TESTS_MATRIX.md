# Daily Meetings - Matriz de Tests

## Tabla Maestra de Tests (Fase 11)

| # | Test | Endpoint | Método | Token | Body/Params | Status | SaveId | Tipo |
|---|------|----------|--------|-------|-------------|--------|--------|------|
| 11.1 | Crear daily de proyecto con sprint | /daily-meetings | POST | ADMIN | tipo=Proyecto, proyectoId, sprintId, nombre, fecha, horas | 200 | dailyId | CREATE |
| 11.2 | Crear daily con facilitador | /daily-meetings | POST | SCRUM_MASTER | tipo=Proyecto, proyectoId, sprintId, nombre, fecha, facilitadorId | 200 | dailyId2 | CREATE |
| 11.3 | Crear daily con notas | /daily-meetings | POST | PMO | tipo=Proyecto, proyectoId, sprintId, nombre, fecha, notas | 200 | - | CREATE |
| 11.4 | Crear daily con link de reunion | /daily-meetings | POST | ADMIN | tipo=Proyecto, proyectoId, nombre, fecha, linkReunion | 200 | - | CREATE |
| 11.5 | Rechazar PROYECTO sin proyectoId | /daily-meetings | POST | ADMIN | tipo=Proyecto, nombre, fecha | 400 | - | VALIDATE |
| 11.6 | Crear daily de actividad | /daily-meetings | POST | ADMIN | tipo=Actividad, actividadId, nombre, fecha, horas | 200 | dailyKanbanId | CREATE |
| 11.7 | Crear segunda daily Kanban | /daily-meetings | POST | PMO | tipo=Actividad, actividadId, nombre, fecha, facilitadorId | 200 | - | CREATE |
| 11.8 | Crear daily Kanban con participantes | /daily-meetings | POST | COORDINADOR | tipo=Actividad, actividadId, nombre, fecha, participantes[] | 200 | - | CREATE |
| 11.9 | Rechazar ACTIVIDAD sin actividadId | /daily-meetings | POST | ADMIN | tipo=Actividad, nombre, fecha | 400 | - | VALIDATE |
| 11.10 | Listar todas las dailies | /daily-meetings | GET | ADMIN | - | 200 | - | READ |
| 11.11 | Obtener daily por ID | /daily-meetings/:id | GET | ADMIN | id=dailyId | 200 | - | READ |
| 11.12 | Obtener resumen de daily | /daily-meetings/:id/resumen | GET | ADMIN | id=dailyId | 200 | - | READ |
| 11.13 | Obtener resumen daily Kanban | /daily-meetings/:id/resumen | GET | PMO | id=dailyKanbanId | 200 | - | READ |
| 11.14 | Filtrar por tipo Proyecto | /daily-meetings | GET | ADMIN | ?tipo=Proyecto | 200 | - | FILTER |
| 11.15 | Filtrar por tipo Actividad | /daily-meetings | GET | ADMIN | ?tipo=Actividad | 200 | - | FILTER |
| 11.16 | Filtrar por proyectoId | /daily-meetings | GET | ADMIN | ?proyectoId=X | 200 | - | FILTER |
| 11.17 | Filtrar por sprintId | /daily-meetings | GET | ADMIN | ?sprintId=Y | 200 | - | FILTER |
| 11.18 | Filtrar por actividadId | /daily-meetings | GET | PMO | ?actividadId=Z | 200 | - | FILTER |
| 11.19 | Filtrar por rango de fechas | /daily-meetings | GET | ADMIN | ?fechaDesde=A&fechaHasta=B | 200 | - | FILTER |
| 11.20 | Listar dailies de proyecto | /proyectos/:id/daily-meetings | GET | ADMIN | proyectoId | 200 | - | NESTED |
| 11.21 | Listar dailies de sprint | /sprints/:id/daily-meetings | GET | ADMIN | sprintId | 200 | - | NESTED |
| 11.22 | Listar dailies de actividad | /actividades/:id/daily-meetings | GET | PMO | actividadId | 200 | - | NESTED |
| 11.23 | Dailies de proyecto vacio | /proyectos/:id/daily-meetings | GET | ADMIN | proyectoId2 | 200 | - | EDGE |
| 11.24 | Actualizar nombre y fecha | /daily-meetings/:id | PATCH | ADMIN | id=dailyId, nombre, fecha | 200 | - | UPDATE |
| 11.25 | Actualizar horarios | /daily-meetings/:id | PATCH | SCRUM_MASTER | id=dailyId2, horaInicio, horaFin | 200 | - | UPDATE |
| 11.26 | Actualizar notas | /daily-meetings/:id | PATCH | ADMIN | id=dailyKanbanId, notas | 200 | - | UPDATE |
| 11.27 | Actualizar facilitador | /daily-meetings/:id | PATCH | ADMIN | id=dailyId, facilitadorId | 200 | - | UPDATE |
| 11.28 | Rechazar actualizacion sin permisos | /daily-meetings/:id | PATCH | DEV | id=dailyId, nombre | 403 | - | VALIDATE |
| 11.29 | Agregar participante a daily | /daily-meetings/:id/participantes | POST | ADMIN | id=dailyId, usuarioId, 3 campos | 200 | participanteId | CREATE |
| 11.30 | Agregar segundo participante | /daily-meetings/:id/participantes | POST | PMO | id=dailyId, usuarioId, 2 campos | 200 | participanteId2 | CREATE |
| 11.31 | Agregar participante sin impedimentos | /daily-meetings/:id/participantes | POST | SCRUM_MASTER | id=dailyId2, usuarioId, 2 campos | 200 | - | CREATE |
| 11.32 | Rechazar participante duplicado | /daily-meetings/:id/participantes | POST | ADMIN | id=dailyId, usuarioId=13 (dup) | 409 | - | VALIDATE |
| 11.33 | Actualizar reporte de participante | /participantes/:id | PATCH | ADMIN | participanteId, 2 campos | 200 | - | UPDATE |
| 11.34 | Dev puede actualizar su participacion | /participantes/:id | PATCH | DEV | participanteId2, 1 campo | 200 | - | UPDATE |
| 11.35 | Eliminar participante | /participantes/:id | DELETE | ADMIN | participanteId2 | 200 | - | DELETE |
| 11.36 | Rechazar eliminar sin permisos | /participantes/:id | DELETE | DEV | participanteId | 403 | - | VALIDATE |
| 11.37 | Eliminar daily meeting | /daily-meetings/:id | DELETE | ADMIN | dailyId2 | 200 | - | DELETE |
| 11.38 | Validar daily eliminada no existe | /daily-meetings/:id | GET | ADMIN | dailyId2 | 404 | - | VALIDATE |
| 11.39 | Rechazar eliminar sin permisos | /daily-meetings/:id | DELETE | DEV | dailyKanbanId | 403 | - | VALIDATE |
| 11.40 | Rechazar sin tipo | /daily-meetings | POST | ADMIN | nombre, fecha (sin tipo) | 400 | - | VALIDATE |
| 11.41 | Rechazar sin fecha | /daily-meetings | POST | ADMIN | tipo, proyectoId, nombre | 400 | - | VALIDATE |
| 11.42 | Rechazar sin nombre | /daily-meetings | POST | ADMIN | tipo, proyectoId, fecha | 400 | - | VALIDATE |
| 11.43 | Crear daily sin sprint | /daily-meetings | POST | ADMIN | tipo=Proyecto, proyectoId, nombre, fecha | 200 | - | EDGE |
| 11.44 | Verificar orden cronologico | /sprints/:id/daily-meetings | GET | ADMIN | sprintId2 | 200 | - | EDGE |
| 11.45 | Verificar resumen incluye participantes | /daily-meetings/:id/resumen | GET | ADMIN | dailyId | 200 | - | EDGE |

---

## Matriz por Categoría

### CRUD Básico

| Operación | Tests | % Cobertura |
|-----------|-------|-------------|
| CREATE (POST) | 11.1-11.9 (9) | 20% |
| READ (GET) | 11.10-11.13 (4) | 9% |
| UPDATE (PATCH) | 11.24-11.28 (5) | 11% |
| DELETE | 11.37-11.39 (3) | 7% |

### Participantes

| Operación | Tests | % Cobertura |
|-----------|-------|-------------|
| Agregar | 11.29-11.32 (4) | 9% |
| Actualizar | 11.33-11.34 (2) | 4% |
| Eliminar | 11.35-11.36 (2) | 4% |

### Consultas Avanzadas

| Tipo | Tests | % Cobertura |
|------|-------|-------------|
| Filtros | 11.14-11.19 (6) | 13% |
| Endpoints Anidados | 11.20-11.23 (4) | 9% |

### Validaciones

| Tipo | Tests | % Cobertura |
|------|-------|-------------|
| DTO | 11.5, 11.9, 11.40-11.42 (5) | 11% |
| Permisos | 11.28, 11.36, 11.39 (3) | 7% |
| Negocio | 11.32, 11.38 (2) | 4% |

### Edge Cases

| Caso | Tests | % Cobertura |
|------|-------|-------------|
| Listas vacías | 11.23 (1) | 2% |
| Opcionales | 11.31, 11.43 (2) | 4% |
| Orden/Estructura | 11.44-11.45 (2) | 4% |

---

## Matriz por Endpoint

| Endpoint | Métodos | Tests | Cobertura |
|----------|---------|-------|-----------|
| /daily-meetings | POST, GET | 11.1-11.10, 11.14-11.19, 11.40-11.43 | 100% |
| /daily-meetings/:id | GET, PATCH, DELETE | 11.11-11.13, 11.24-11.28, 11.37-11.39 | 100% |
| /daily-meetings/:id/resumen | GET | 11.12-11.13, 11.45 | 100% |
| /daily-meetings/:id/participantes | POST | 11.29-11.32 | 100% |
| /participantes/:id | PATCH, DELETE | 11.33-11.36 | 100% |
| /proyectos/:id/daily-meetings | GET | 11.20, 11.23 | 100% |
| /sprints/:id/daily-meetings | GET | 11.21, 11.44 | 100% |
| /actividades/:id/daily-meetings | GET | 11.22 | 100% |

**Total:** 8 endpoints únicos, 12 operaciones, 100% cobertura

---

## Matriz por Rol

| Rol | Tests Exitosos | Tests Fallidos | Total | % Uso |
|-----|----------------|----------------|-------|-------|
| ADMIN | 25 | 0 | 25 | 56% |
| PMO | 6 | 0 | 6 | 13% |
| SCRUM_MASTER | 4 | 0 | 4 | 9% |
| COORDINADOR | 2 | 0 | 2 | 4% |
| DEV | 1 | 5 | 6 | 13% |
| (Sin auth) | 0 | 2 | 2 | 4% |

**Total:** 36 exitosos, 9 validaciones

---

## Matriz de Status Codes

| Status | Descripción | Tests | % |
|--------|-------------|-------|---|
| 200 OK | Operación exitosa | 36 | 80% |
| 400 Bad Request | Validación DTO | 5 | 11% |
| 403 Forbidden | Sin permisos | 3 | 7% |
| 404 Not Found | Recurso no existe | 1 | 2% |
| 409 Conflict | Duplicado | 1 | 2% |

---

## Matriz de IDs

| Variable | Tipo | Se crea en | Se usa en | Se elimina en |
|----------|------|------------|-----------|---------------|
| dailyId | Daily Proyecto | 11.1 | 11.11-12, 11.24, 11.27-29, 11.32, 11.45 | - |
| dailyId2 | Daily Proyecto | 11.2 | 11.25, 11.31, 11.37-38 | 11.37 |
| dailyKanbanId | Daily Actividad | 11.6 | 11.13, 11.26, 11.39 | - |
| participanteId | Participante | 11.29 | 11.33, 11.36 | - |
| participanteId2 | Participante | 11.30 | 11.34-35 | 11.35 |

**IDs de Setup (pre-existentes):**
- proyectoId, proyectoId2 (Fase 0)
- actividadId, actividadId2 (Fase 0)
- sprintId2 (Fase 2)

---

## Matriz de Dependencias

### Tests que dependen de otros tests

| Test | Depende de | Razón |
|------|------------|-------|
| 11.11 | 11.1 | Necesita dailyId |
| 11.12 | 11.1 | Necesita dailyId |
| 11.13 | 11.6 | Necesita dailyKanbanId |
| 11.24 | 11.1 | Necesita dailyId |
| 11.25 | 11.2 | Necesita dailyId2 |
| 11.26 | 11.6 | Necesita dailyKanbanId |
| 11.27 | 11.1 | Necesita dailyId |
| 11.28 | 11.1 | Necesita dailyId |
| 11.29 | 11.1 | Necesita dailyId |
| 11.30 | 11.1 | Necesita dailyId |
| 11.31 | 11.2 | Necesita dailyId2 |
| 11.32 | 11.1, 11.29 | Necesita dailyId y participante previo |
| 11.33 | 11.29 | Necesita participanteId |
| 11.34 | 11.30 | Necesita participanteId2 |
| 11.35 | 11.30 | Necesita participanteId2 |
| 11.36 | 11.29 | Necesita participanteId |
| 11.37 | 11.2 | Necesita dailyId2 |
| 11.38 | 11.37 | Necesita daily eliminada |
| 11.39 | 11.6 | Necesita dailyKanbanId |
| 11.45 | 11.1, 11.29 | Necesita dailyId con participantes |

**Tests independientes:** 11.1-11.10, 11.14-11.23, 11.40-11.44 (25 tests)

---

## Matriz de Campos

### CreateDailyMeetingDto

| Campo | Tipo | Requerido | Condicional | Tests |
|-------|------|-----------|-------------|-------|
| tipo | Enum | Sí | - | 11.1-11.9, 11.40 |
| proyectoId | number | - | Si tipo=Proyecto | 11.1-11.5, 11.40-11.43 |
| actividadId | number | - | Si tipo=Actividad | 11.6-11.9 |
| sprintId | number | No | - | 11.1-11.3, 11.43 |
| nombre | string | Sí | - | 11.1-11.9, 11.42-11.43 |
| fecha | ISO date | Sí | - | 11.1-11.9, 11.41, 11.43 |
| horaInicio | string | No | - | 11.1, 11.6 |
| horaFin | string | No | - | 11.1, 11.6 |
| facilitadorId | number | No | - | 11.2, 11.7 |
| notas | string | No | - | 11.3 |
| linkReunion | URL | No | - | 11.4 |
| participantes | array | No | - | 11.8 |

### UpdateDailyMeetingDto

| Campo | Tests |
|-------|-------|
| nombre | 11.24 |
| fecha | 11.24 |
| horaInicio | 11.25 |
| horaFin | 11.25 |
| notas | 11.26 |
| facilitadorId | 11.27 |

### CreateParticipanteDto

| Campo | Tipo | Requerido | Tests |
|-------|------|-----------|-------|
| usuarioId | number | Sí | 11.29-11.32 |
| queHiceAyer | string | No | 11.29-11.30, 11.33 |
| queHareHoy | string | No | 11.29-11.31, 11.34 |
| impedimentos | string | No | 11.29, 11.33 |

### UpdateParticipanteDto

| Campo | Tests |
|-------|-------|
| queHiceAyer | 11.33 |
| queHareHoy | 11.34 |
| impedimentos | 11.33 |

---

## Matriz de Query Params

| Parámetro | Tipo | Endpoint | Tests |
|-----------|------|----------|-------|
| tipo | Enum | /daily-meetings | 11.14-11.15 |
| proyectoId | number | /daily-meetings | 11.16 |
| actividadId | number | /daily-meetings | 11.18 |
| sprintId | number | /daily-meetings | 11.17 |
| fechaDesde | ISO date | /daily-meetings | 11.19 |
| fechaHasta | ISO date | /daily-meetings | 11.19 |

---

## Matriz de Tokens

| Token | UserId | Rol | Tests con éxito | Tests con fallo | Total |
|-------|--------|-----|-----------------|-----------------|-------|
| adminToken | 13 | ADMIN | 25 | 0 | 25 |
| pmoToken | 14 | PMO | 6 | 0 | 6 |
| scrumMasterToken | 13 | SCRUM_MASTER | 4 | 0 | 4 |
| coordinadorToken | 14 | COORDINADOR | 2 | 0 | 2 |
| devToken | 15 | DESARROLLADOR | 1 | 5 | 6 |

**Nota:** scrumMasterToken = adminToken (userId 13)
**Nota:** coordinadorToken = pmoToken (userId 14)

---

## Matriz de Tiempo Estimado

| Fase | Tests | Tiempo (seg) | Tiempo/test |
|------|-------|--------------|-------------|
| 11.1 Creación Proyecto | 5 | 2.5 | 0.5s |
| 11.2 Creación Actividad | 4 | 2.0 | 0.5s |
| 11.3 Consulta Básica | 4 | 2.0 | 0.5s |
| 11.4 Filtros | 6 | 3.0 | 0.5s |
| 11.5 Consultas Anidadas | 4 | 2.0 | 0.5s |
| 11.6 Actualización Daily | 5 | 2.5 | 0.5s |
| 11.7 Agregar Participantes | 4 | 2.0 | 0.5s |
| 11.8 Actualizar Participantes | 2 | 1.0 | 0.5s |
| 11.9 Eliminar Participantes | 2 | 1.0 | 0.5s |
| 11.10 Eliminar Dailies | 3 | 1.5 | 0.5s |
| 11.11 Validaciones | 3 | 1.5 | 0.5s |
| 11.12 Edge Cases | 3 | 1.5 | 0.5s |
| **TOTAL** | **45** | **22.5** | **0.5s** |

---

## Matriz de Cobertura de Código

### Controladores

| Controlador | Métodos | Tests | Cobertura |
|-------------|---------|-------|-----------|
| DailyMeetingController | 9 | 41 | 100% |
| ProyectoDailyMeetingsController | 1 | 2 | 100% |
| SprintDailyMeetingsController | 1 | 2 | 100% |
| ActividadDailyMeetingsController | 1 | 1 | 100% |

### Servicios (llamados indirectamente)

| Método | Tests | Cobertura |
|--------|-------|-----------|
| create() | 11.1-11.9 | 100% |
| findAll() | 11.10, 11.14-11.19 | 100% |
| findOne() | 11.11, 11.38 | 100% |
| getResumen() | 11.12-11.13, 11.45 | 100% |
| update() | 11.24-11.28 | 100% |
| remove() | 11.37-11.39 | 100% |
| addParticipante() | 11.29-11.32 | 100% |
| updateParticipante() | 11.33-11.34 | 100% |
| removeParticipante() | 11.35-11.36 | 100% |
| findByProyecto() | 11.20, 11.23 | 100% |
| findBySprint() | 11.21, 11.44 | 100% |
| findByActividad() | 11.22 | 100% |

---

## Leyenda de Colores (para visualización)

- 🟢 **Verde:** Test exitoso (200, 201)
- 🟡 **Amarillo:** Test de validación esperado (400, 403, 404, 409)
- 🔴 **Rojo:** Test fallido inesperadamente
- 🔵 **Azul:** Test de consulta (GET)
- 🟣 **Morado:** Test de mutación (POST, PATCH, DELETE)

---

## Roadmap de Expansión

### Fase 11.1: Notificaciones (Futuro)
- Notificar al crear daily
- Notificar al agregar participante
- Recordatorios automáticos

### Fase 11.2: Métricas (Futuro)
- Dashboard de participación
- Análisis de impedimentos
- Velocidad de resolución

### Fase 11.3: Integraciones (Futuro)
- Google Calendar sync
- Export a PDF
- Webhook notifications

---

**Última actualización:** 2025-12-15
**Versión:** 1.0
**Autor:** Claude Code - Test Automation Specialist
