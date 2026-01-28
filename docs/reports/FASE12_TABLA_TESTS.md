# Fase 12: Tabla Completa de Tests - Participantes de Daily Meetings

## Resumen General

| Metrica | Valor |
|---------|-------|
| Total de Tests | 45 |
| Tests de Exito | 35 (77.8%) |
| Tests de Fallo Esperado | 10 (22.2%) |
| Duracion Estimada | 15-20 segundos |

## Tabla Completa de Tests

| # | Nombre del Test | Metodo | Endpoint | Token | Status | Tipo |
|---|----------------|--------|----------|-------|--------|------|
| 12.1 | Agregar participante basico a daily SCRUM | POST | /daily-meetings/:id/participantes | Admin | 200 | Exito |
| 12.2 | Agregar participante con que hice/hare completo | POST | /daily-meetings/:id/participantes | Admin | 200 | Exito |
| 12.3 | Agregar participante con impedimentos | POST | /daily-meetings/:id/participantes | PMO | 200 | Exito |
| 12.4 | Agregar participante a otra daily Kanban | POST | /daily-meetings/:id/participantes | Admin | 200 | Exito |
| 12.5 | Agregar participante solo con impedimentos | POST | /daily-meetings/:id/participantes | PMO | 200 | Exito |
| 12.6 | Rechazar participante duplicado (mismo usuario) | POST | /daily-meetings/:id/participantes | Admin | 409 | Fallo Esperado |
| 12.7 | Rechazar agregar sin permisos (dev) | POST | /daily-meetings/:id/participantes | Dev | 403 | Fallo Esperado |
| 12.8 | Rechazar sin usuarioId valido | POST | /daily-meetings/:id/participantes | Admin | 400 | Fallo Esperado |
| 12.9 | Rechazar con usuarioId inexistente | POST | /daily-meetings/:id/participantes | Admin | 404 | Fallo Esperado |
| 12.10 | Rechazar agregar a daily inexistente | POST | /daily-meetings/99999/participantes | Admin | 404 | Fallo Esperado |
| 12.11 | Actualizar solo que hice ayer | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.12 | Actualizar solo que hare hoy | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.13 | Actualizar solo impedimentos | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.14 | Limpiar impedimentos (vacio) | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.15 | Marcar asistencia como presente (true) | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.16 | Marcar asistencia como ausente (false) | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.17 | Cambiar asistencia de false a true | PATCH | /participantes/:id | PMO | 200 | Exito |
| 12.18 | Actualizar todos los campos juntos | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.19 | Actualizar que hice y que hare juntos | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.20 | Actualizar que hare e impedimentos | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.21 | Admin puede actualizar cualquier participante | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.22 | PMO puede actualizar cualquier participante | PATCH | /participantes/:id | PMO | 200 | Exito |
| 12.23 | Scrum Master puede actualizar cualquier | PATCH | /participantes/:id | SM | 200 | Exito |
| 12.24 | Coordinador puede actualizar cualquier | PATCH | /participantes/:id | Coord | 200 | Exito |
| 12.25 | Dev NO puede actualizar datos de otros (Admin) | PATCH | /participantes/:id | Dev | 403 | Fallo Esperado |
| 12.26 | Dev NO puede actualizar datos de otros (PMO) | PATCH | /participantes/:id | Dev | 403 | Fallo Esperado |
| 12.27 | Obtener daily con participantes actualizados | GET | /daily-meetings/:id | Admin | 200 | Exito |
| 12.28 | Verificar participantes en resumen detallado | GET | /daily-meetings/:id/resumen | Admin | 200 | Exito |
| 12.29 | Obtener daily Kanban con participantes | GET | /daily-meetings/:id | PMO | 200 | Exito |
| 12.30 | Verificar datos completos de participantes | GET | /daily-meetings/:id | Dev | 200 | Exito |
| 12.31 | Eliminar participante por Admin | DELETE | /participantes/:id | Admin | 200 | Exito |
| 12.32 | Verificar participante eliminado no aparece | GET | /daily-meetings/:id | Admin | 200 | Exito |
| 12.33 | Rechazar eliminar sin permisos (dev) | DELETE | /participantes/:id | Dev | 403 | Fallo Esperado |
| 12.34 | Crear participante temporal para test PMO | POST | /daily-meetings/:id/participantes | Admin | 200 | Exito |
| 12.35 | PMO puede eliminar participante | DELETE | /participantes/:id | PMO | 200 | Exito |
| 12.36 | Crear participante temporal para test SM | POST | /daily-meetings/:id/participantes | Admin | 200 | Exito |
| 12.37 | Scrum Master puede eliminar participante | DELETE | /participantes/:id | SM | 200 | Exito |
| 12.38 | Rechazar actualizar participante inexistente | PATCH | /participantes/99999 | Admin | 404 | Fallo Esperado |
| 12.39 | Rechazar eliminar participante inexistente | DELETE | /participantes/99999 | Admin | 404 | Fallo Esperado |
| 12.40 | Actualizar con body vacio debe ser exitoso | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.41 | Actualizar con texto largo en que hice | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.42 | Actualizar con texto largo en impedimentos | PATCH | /participantes/:id | Admin | 200 | Exito |
| 12.43 | Verificar estado final en daily SCRUM | GET | /daily-meetings/:id | Admin | 200 | Exito |
| 12.44 | Verificar estado final en daily Kanban | GET | /daily-meetings/:id | Admin | 200 | Exito |
| 12.45 | Verificar conteo de participantes en resumen | GET | /daily-meetings/:id/resumen | PMO | 200 | Exito |

## Distribucion por Metodo HTTP

| Metodo | Cantidad | % |
|--------|----------|---|
| POST | 10 | 22.2% |
| PATCH | 22 | 48.9% |
| GET | 10 | 22.2% |
| DELETE | 3 | 6.7% |
| **Total** | **45** | **100%** |

## Distribucion por Token (Rol)

| Token | Rol | Cantidad | % |
|-------|-----|----------|---|
| Admin | ADMIN | 29 | 64.4% |
| PMO | PMO | 7 | 15.6% |
| Dev | DESARROLLADOR | 5 | 11.1% |
| SM | SCRUM_MASTER | 2 | 4.4% |
| Coord | COORDINADOR | 2 | 4.4% |
| **Total** | - | **45** | **100%** |

## Distribucion por Status Code

| Status | Descripcion | Cantidad | % |
|--------|-------------|----------|---|
| 200 | OK (Success) | 35 | 77.8% |
| 400 | Bad Request | 1 | 2.2% |
| 403 | Forbidden | 4 | 8.9% |
| 404 | Not Found | 4 | 8.9% |
| 409 | Conflict | 1 | 2.2% |
| **Total** | - | **45** | **100%** |

## Tests por Seccion

### 12.1: Agregar Participantes (5 tests)
Tests que validan la creacion de participantes con diferentes configuraciones.

### 12.2: Validaciones de Negocio (5 tests)
Tests que validan rechazos por duplicados, permisos, datos invalidos.

### 12.3: Actualizacion Individual (4 tests)
Tests que actualizan un solo campo a la vez (queHice, queHare, impedimentos).

### 12.4: Campo Asistencia (3 tests)
Tests especificos para el campo boolean `asistio`.

### 12.5: Actualizacion Multiple (3 tests)
Tests que actualizan varios campos simultaneamente.

### 12.6: Permisos de Actualizacion (6 tests)
Tests que validan permisos por rol (Admin, PMO, SM, Coord, Dev).

### 12.7: Consulta (4 tests)
Tests que consultan participantes via GET en daily meetings.

### 12.8: Eliminacion (3 tests)
Tests que eliminan participantes y validan permisos.

### 12.9: Permisos de Eliminacion (4 tests)
Tests que validan permisos de eliminacion por rol (PMO, SM).

### 12.10: Validaciones Adicionales (3 tests)
Tests que validan errores 404 y body vacio.

### 12.11: Textos Largos (2 tests)
Tests con textos de 500+ caracteres en campos.

### 12.12: Verificacion Final (3 tests)
Tests que verifican estado final de los datos.

## Campos Validados por Test

| Campo | Tests que lo usan | Ejemplo |
|-------|-------------------|---------|
| usuarioId | 12.1-12.10, 12.34, 12.36 | 13, 14, 15 |
| queHiceAyer | 12.2-12.3, 12.11, 12.18-12.19, 12.41 | "Complete implementacion..." |
| queHareHoy | 12.2, 12.12, 12.18-12.20 | "Trabajare en perfiles..." |
| impedimentos | 12.3, 12.5, 12.13-12.14, 12.18, 12.20, 12.42 | "Bloqueado por..." |
| asistio | 12.15-12.18, 12.23 | true, false |

## Permisos Validados

### Crear Participantes (POST)

| Rol | Permitido | Tests |
|-----|-----------|-------|
| ADMIN | Si | 12.1-12.4, 12.34, 12.36 |
| PMO | Si | 12.3, 12.5 |
| COORDINADOR | Si | (implementado, no testado) |
| SCRUM_MASTER | Si | (implementado, no testado) |
| DESARROLLADOR | No | 12.7 (403) |

### Actualizar Participantes (PATCH)

| Rol | Permite actualizar | Tests |
|-----|-------------------|-------|
| ADMIN | Todos | 12.11-12.21 |
| PMO | Todos | 12.17, 12.22 |
| SCRUM_MASTER | Todos | 12.23 |
| COORDINADOR | Todos | 12.24 |
| DESARROLLADOR | Solo propios* | 12.25-12.26 (403) |

*Nota: Actualmente retorna 403. Requiere implementacion.

### Eliminar Participantes (DELETE)

| Rol | Permitido | Tests |
|-----|-----------|-------|
| ADMIN | Si | 12.31 |
| PMO | Si | 12.35 |
| SCRUM_MASTER | Si | 12.37 |
| COORDINADOR | Si | (implementado, no testado) |
| DESARROLLADOR | No | 12.33 (403) |

## Validaciones de Negocio Cubiertas

| Validacion | Status Code | Tests |
|------------|-------------|-------|
| Participante duplicado | 409 Conflict | 12.6 |
| Sin permisos para crear | 403 Forbidden | 12.7 |
| UsuarioId invalido | 400 Bad Request | 12.8 |
| Usuario inexistente | 404 Not Found | 12.9 |
| Daily inexistente | 404 Not Found | 12.10 |
| Sin permisos para actualizar | 403 Forbidden | 12.25-12.26 |
| Sin permisos para eliminar | 403 Forbidden | 12.33 |
| Participante inexistente (update) | 404 Not Found | 12.38 |
| Participante inexistente (delete) | 404 Not Found | 12.39 |

## IDs Guardados Durante Tests

| Variable | Test que lo crea | Uso posterior |
|----------|-----------------|---------------|
| participanteAdmin | 12.1 | 12.11-12.12, 12.15, 12.18, 12.21, 12.24-12.25, 12.33, 12.40-12.41, 12.43 |
| participantePmo | 12.2 | 12.13-12.14, 12.16-12.17, 12.22, 12.26, 12.31 |
| participanteDev | 12.3 | 12.19-12.20, 12.23, 12.42 |

## Payloads de Ejemplo

### CreateParticipanteDto Basico
```json
{
  "usuarioId": 13
}
```

### CreateParticipanteDto Completo
```json
{
  "usuarioId": 14,
  "queHiceAyer": "Complete la implementacion del modulo de autenticacion incluyendo login, registro y recuperacion de contraseña",
  "queHareHoy": "Trabajare en el sistema de perfiles de usuario y configuracion de cuentas"
}
```

### CreateParticipanteDto con Impedimentos
```json
{
  "usuarioId": 15,
  "queHiceAyer": "Revise y aprobe 5 pull requests del equipo",
  "queHareHoy": "Continuare con code review y empezare testing de integracion",
  "impedimentos": "Esperando respuesta del equipo de infraestructura sobre acceso a ambiente de staging"
}
```

### UpdateParticipanteDto Individual
```json
{
  "queHiceAyer": "Complete toda la funcionalidad de autenticacion incluyendo OAuth2 y JWT"
}
```

### UpdateParticipanteDto Multiple
```json
{
  "queHiceAyer": "Finalice integracion con sistema de notificaciones via email y SMS",
  "queHareHoy": "Trabajare en la dashboard de administracion y reportes",
  "impedimentos": "Ninguno por el momento",
  "asistio": true
}
```

### UpdateParticipanteDto Asistencia
```json
{
  "asistio": true
}
```

## Orden de Ejecucion Recomendado

Los tests deben ejecutarse en orden secuencial (12.1 → 12.45) porque:

1. **12.1-12.3** crean participantes y guardan IDs
2. **12.11-12.26** usan esos IDs para actualizar
3. **12.27-12.30** consultan los datos actualizados
4. **12.31** elimina uno de los participantes
5. **12.32** verifica que fue eliminado
6. **12.34-12.37** crean y eliminan participantes temporales
7. **12.43-12.45** verifican estado final

## Dependencias Entre Tests

```
12.1 (crea) → 12.11-12.12, 12.15, 12.18, 12.21, etc. (usan ID)
12.2 (crea) → 12.13-12.14, 12.16-12.17, 12.22, etc. (usan ID)
12.3 (crea) → 12.19-12.20, 12.23, etc. (usan ID)
12.31 (elimina) → 12.32 (verifica eliminacion)
12.34 (crea temp) → 12.35 (elimina temp)
12.36 (crea temp) → 12.37 (elimina temp)
```

## Tiempo Estimado por Seccion

| Seccion | Tests | Tiempo Estimado |
|---------|-------|-----------------|
| 12.1 | 5 | 2-3 seg |
| 12.2 | 5 | 2-3 seg |
| 12.3 | 4 | 2 seg |
| 12.4 | 3 | 1-2 seg |
| 12.5 | 3 | 1-2 seg |
| 12.6 | 6 | 2-3 seg |
| 12.7 | 4 | 2 seg |
| 12.8 | 3 | 1-2 seg |
| 12.9 | 4 | 2 seg |
| 12.10 | 3 | 1-2 seg |
| 12.11 | 2 | 1 seg |
| 12.12 | 3 | 1-2 seg |
| **Total** | **45** | **15-20 seg** |

---

**Ultima Actualizacion:** 2025-12-15
**Version:** 1.0
**Estado:** Completo
