# Guía de Tests - Daily Meetings (Fase 11)

## Resumen Rápido

- **Archivo:** `test-agile-exhaustivo.ps1`
- **Fase:** 11 (Daily Meetings)
- **Tests:** 45 tests (11.1 - 11.45)
- **Líneas:** 575-674
- **Tiempo estimado:** 20-30 segundos

---

## Ejecución

### Opción 1: Ejecutar Script Completo
```powershell
.\test-agile-exhaustivo.ps1
```

Esto ejecutará TODAS las fases (0-11), aproximadamente 200+ tests en total.

### Opción 2: Ejecutar Solo Fase 11 (Recomendado para desarrollo)
Crear un script temporal con solo la Fase 11:

```powershell
# Copiar líneas 1-157 (headers y función Test-Api)
# Copiar líneas 164-183 (Fase 0: Setup POI) - REQUERIDO
# Copiar líneas 219-223 (Crear Sprint 2) - REQUERIDO
# Copiar líneas 575-674 (Fase 11: Daily Meetings)
# Copiar líneas 676-716 (Resumen final)
```

O comentar las fases que no necesites.

---

## Pre-requisitos

### 1. Backend Corriendo
```bash
npm run start:dev
```
Backend debe estar en: http://localhost:3010

### 2. Base de Datos
Base de datos con esquema actualizado y datos de test.

### 3. Tokens Válidos
Los tokens están hardcoded en el script (líneas 9-13). Si expiran, necesitas regenerarlos.

### 4. Datos de Setup
La Fase 11 depende de:
- **Fase 0:** Acción Estratégica, Proyectos POI, Actividades POI
- **Fase 2:** Sprint 2 (línea 221)

**Opción A:** Ejecutar el script completo una vez para crear todos los datos.
**Opción B:** Tener datos de test pre-cargados en la BD.

---

## IDs Necesarios

La Fase 11 utiliza los siguientes IDs del hashtable `$ids`:

| Variable | Descripción | Se crea en |
|----------|-------------|------------|
| `$ids.proyectoId` | Proyecto POI principal | Fase 0 (línea 171) |
| `$ids.proyectoId2` | Segundo proyecto POI | Fase 0 (línea 173) |
| `$ids.actividadId` | Actividad Kanban 1 | Fase 0 (línea 175) |
| `$ids.actividadId2` | Actividad Kanban 2 | Fase 0 (línea 177) |
| `$ids.sprintId2` | Sprint 2 del proyecto | Fase 2 (línea 221) |

Si ejecutas solo la Fase 11, asegúrate de que estos IDs existan en la BD o modifícalos manualmente en el script.

---

## IDs Generados

La Fase 11 guarda los siguientes IDs:

| Variable | Descripción | Test |
|----------|-------------|------|
| `$ids.dailyId` | Daily principal (Proyecto + Sprint 2) | 11.1 |
| `$ids.dailyId2` | Segunda daily (se elimina) | 11.2 |
| `$ids.dailyKanbanId` | Daily Kanban (Actividad 1) | 11.6 |
| `$ids.participanteId` | Participante 1 (usuario 13) | 11.29 |
| `$ids.participanteId2` | Participante 2 (se elimina) | 11.30 |

---

## Estructura de Tests

### Creación (9 tests)
```
11.1-11.5  → Crear dailies Proyecto (Scrum)
11.6-11.9  → Crear dailies Actividad (Kanban)
```

### Consulta (10 tests)
```
11.10-11.13 → Consulta básica (listar, detalle, resumen)
11.14-11.19 → Filtros (tipo, proyecto, sprint, actividad, fechas)
11.20-11.23 → Endpoints anidados (proyecto, sprint, actividad)
```

### Actualización (7 tests)
```
11.24-11.28 → Actualizar daily (nombre, horarios, notas, facilitador, permisos)
11.29-11.32 → Agregar participantes
11.33-11.34 → Actualizar participantes
```

### Eliminación (5 tests)
```
11.35-11.36 → Eliminar participantes
11.37-11.39 → Eliminar dailies
```

### Validaciones (9 tests)
```
11.5, 11.9     → Validar campos requeridos por tipo
11.28, 11.36, 11.39 → Validar permisos (403)
11.32          → Validar duplicados (409)
11.38          → Validar eliminación (404)
11.40-11.42    → Validar DTO (400)
```

### Edge Cases (5 tests)
```
11.23 → Proyecto sin dailies
11.43 → Daily sin sprint
11.44 → Orden cronológico
11.45 → Resumen con participantes
```

---

## Endpoints Probados

### CRUD Principal
- `POST /daily-meetings` - Crear daily
- `GET /daily-meetings` - Listar con filtros
- `GET /daily-meetings/:id` - Detalle
- `GET /daily-meetings/:id/resumen` - Resumen
- `PATCH /daily-meetings/:id` - Actualizar
- `DELETE /daily-meetings/:id` - Eliminar

### Participantes
- `POST /daily-meetings/:id/participantes` - Agregar
- `PATCH /participantes/:participanteId` - Actualizar
- `DELETE /participantes/:participanteId` - Eliminar

### Endpoints Anidados
- `GET /proyectos/:proyectoId/daily-meetings`
- `GET /sprints/:sprintId/daily-meetings`
- `GET /actividades/:actividadId/daily-meetings`

---

## Datos de Prueba

### Daily Proyecto (Scrum)
```javascript
{
  tipo: "Proyecto",
  proyectoId: <ID>,
  sprintId: <ID>,                 // Opcional
  nombre: "Daily Scrum - Sprint 2 - Dia 1",
  fecha: "2025-01-30",
  horaInicio: "09:00",            // Opcional
  horaFin: "09:15",               // Opcional
  facilitadorId: 13,              // Opcional
  notas: "...",                   // Opcional
  linkReunion: "https://...",     // Opcional
  participantes: [...]            // Opcional
}
```

### Daily Actividad (Kanban)
```javascript
{
  tipo: "Actividad",
  actividadId: <ID>,
  nombre: "Daily Kanban - Actividad 1 - Dia 1",
  fecha: "2025-02-03",
  horaInicio: "10:00",
  horaFin: "10:15",
  facilitadorId: 14,
  participantes: [
    {
      usuarioId: 13,
      queHiceAyer: "Diseño de mockups",
      queHareHoy: "Implementar componentes",
      impedimentos: "Falta acceso a Figma"
    }
  ]
}
```

### Participante
```javascript
{
  usuarioId: 13,
  queHiceAyer: "Completé endpoints de login",
  queHareHoy: "Implementar validaciones JWT",
  impedimentos: "Ninguno"  // Opcional
}
```

---

## Filtros Soportados

```powershell
# Filtrar por tipo
GET /daily-meetings?tipo=Proyecto
GET /daily-meetings?tipo=Actividad

# Filtrar por contexto
GET /daily-meetings?proyectoId=1
GET /daily-meetings?sprintId=2
GET /daily-meetings?actividadId=3

# Filtrar por rango de fechas
GET /daily-meetings?fechaDesde=2025-01-30&fechaHasta=2025-02-05

# Combinar filtros
GET /daily-meetings?tipo=Proyecto&proyectoId=1&sprintId=2
```

---

## Roles y Permisos

### Crear/Actualizar/Eliminar Daily
- ✅ ADMIN
- ✅ PMO
- ✅ COORDINADOR
- ✅ SCRUM_MASTER
- ❌ DESARROLLADOR (403 Forbidden)

### Agregar/Eliminar Participante
- ✅ ADMIN
- ✅ PMO
- ✅ COORDINADOR
- ✅ SCRUM_MASTER
- ❌ DESARROLLADOR (403 Forbidden)

### Actualizar Participante
- ✅ ADMIN
- ✅ PMO
- ✅ COORDINADOR
- ✅ SCRUM_MASTER
- ✅ DESARROLLADOR (solo su propia participación)

### Consultar
- ✅ Todos los roles autenticados

---

## Validaciones de DTO

### Campos Requeridos
- `tipo`: Enum ("Proyecto" o "Actividad")
- `nombre`: String (max 200 caracteres)
- `fecha`: ISO 8601 date string

### Validaciones Condicionales
- Si `tipo = "Proyecto"` → `proyectoId` es requerido
- Si `tipo = "Actividad"` → `actividadId` es requerido

### Campos Opcionales
- `sprintId`: number
- `horaInicio`, `horaFin`: String "HH:MM"
- `facilitadorId`: number
- `notas`: String
- `linkReunion`: URL válida
- `participantes`: Array de CreateParticipanteDto

---

## Tests Negativos (ShouldFail)

Estos tests DEBEN FALLAR (es lo esperado):

| Test | Descripción | Status Esperado |
|------|-------------|-----------------|
| 11.5 | PROYECTO sin proyectoId | 400 Bad Request |
| 11.9 | ACTIVIDAD sin actividadId | 400 Bad Request |
| 11.28 | Actualizar sin permisos | 403 Forbidden |
| 11.32 | Participante duplicado | 409 Conflict |
| 11.36 | Eliminar participante sin permisos | 403 Forbidden |
| 11.38 | GET daily eliminada | 404 Not Found |
| 11.39 | Eliminar daily sin permisos | 403 Forbidden |
| 11.40 | Sin tipo | 400 Bad Request |
| 11.41 | Sin fecha | 400 Bad Request |
| 11.42 | Sin nombre | 400 Bad Request |

**Total:** 9 tests negativos de 45 (20%)

---

## Resultados Esperados

### Métricas
- **Total tests:** 45
- **Tests exitosos:** 36 (80%)
- **Tests de validación (fail):** 9 (20%)
- **Tasa de éxito:** 100% (36 passed + 9 expected fail)

### Output del Script
```
=== FASE 11: DAILY MEETINGS ===

[PASS] 11.1 - Crear daily de proyecto con sprint
  Saved ID: dailyId = 123

[PASS] 11.2 - Crear daily con facilitador
  Saved ID: dailyId2 = 124

...

[EXPECTED FAIL] 11.5 - Rechazar PROYECTO sin proyectoId

...

[PASS] 11.29 - Agregar participante a daily
  Saved ID: participanteId = 456

...

[EXPECTED FAIL] 11.38 - Validar daily eliminada no existe

=======================================
RESUMEN - MODULO AGILE
=======================================

Estadisticas:
  Total:              45
  Pasadas:            36
  Fallidas:           0
  Fallos esperados:   9
  Fallos inesperados: 0
  Duracion:           25.3 segundos

  Tasa de exito: 100%
```

---

## Troubleshooting

### Error: Tokens Expirados
**Síntoma:** Tests fallan con 401 Unauthorized

**Solución:**
1. Regenerar tokens:
```bash
# Login como admin
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admintest4@inei.gob.pe","password":"Admin123!"}'

# Copiar token y actualizar línea 9 del script
```

### Error: IDs No Existen
**Síntoma:** Tests fallan con 404 Not Found en creación

**Solución:**
1. Ejecutar Fase 0 primero (líneas 164-183)
2. Ejecutar Fase 2 test 2.2 para crear Sprint 2 (línea 221)
3. O modificar IDs manualmente en el script con IDs existentes en tu BD

### Error: Daily Ya Existe
**Síntoma:** Tests fallan con 409 Conflict en creación

**Solución:**
1. Limpiar dailies anteriores:
```sql
DELETE FROM daily_participante;
DELETE FROM daily_meeting;
```
2. O usar fechas diferentes en el script

### Error: Participante Duplicado
**Síntoma:** Test 11.32 no falla (debería fallar)

**Causa:** El participante no se agregó en test 11.29

**Solución:**
1. Verificar que test 11.29 ejecutó correctamente
2. Verificar constraint en BD: UNIQUE(dailyMeetingId, usuarioId)

---

## Casos de Uso Reales

### 1. Daily Scrum Stand-up
```javascript
// Test 11.1
POST /daily-meetings
{
  tipo: "Proyecto",
  proyectoId: 1,
  sprintId: 2,
  nombre: "Daily Scrum - Sprint 2 - Dia 1",
  fecha: "2025-01-30",
  horaInicio: "09:00",
  horaFin: "09:15"
}
```

### 2. Daily con Participantes Predefinidos
```javascript
// Test 11.8
POST /daily-meetings
{
  tipo: "Actividad",
  actividadId: 1,
  nombre: "Daily Kanban - Actividad 1 - Dia 1",
  fecha: "2025-02-05",
  participantes: [
    {
      usuarioId: 13,
      queHiceAyer: "Diseño de mockups",
      queHareHoy: "Implementar componentes",
      impedimentos: "Falta acceso a Figma"
    }
  ]
}
```

### 3. Agregar Participante Durante Daily
```javascript
// Test 11.29
POST /daily-meetings/123/participantes
{
  usuarioId: 13,
  queHiceAyer: "Completé endpoints de login",
  queHareHoy: "Implementar validaciones JWT",
  impedimentos: "Ninguno"
}
```

### 4. Dev Actualiza Su Participación
```javascript
// Test 11.34
PATCH /participantes/456
{
  queHareHoy: "Completar testing E2E",
  impedimentos: "Bloqueado por revisión de código"
}
```

### 5. Obtener Resumen de Daily
```javascript
// Test 11.12
GET /daily-meetings/123/resumen

// Response
{
  id: 123,
  nombre: "Daily Scrum - Sprint 2 - Dia 1",
  fecha: "2025-01-30",
  tipo: "Proyecto",
  proyecto: { id: 1, nombre: "..." },
  sprint: { id: 2, nombre: "..." },
  facilitador: { id: 13, nombre: "..." },
  participantes: [
    {
      id: 456,
      usuario: { id: 13, nombre: "..." },
      queHiceAyer: "...",
      queHareHoy: "...",
      impedimentos: "..."
    }
  ],
  totalParticipantes: 1,
  totalImpedimentos: 0
}
```

### 6. Listar Dailies de un Sprint
```javascript
// Test 11.21
GET /sprints/2/daily-meetings

// Response: Array de dailies del sprint ordenadas por fecha
```

---

## Integración con Otros Módulos

### Módulo POI
- **Proyectos:** Contexto para dailies tipo "Proyecto"
- **Actividades:** Contexto para dailies tipo "Actividad"

### Módulo Agile
- **Sprints:** Opcional, agrupa dailies por sprint

### Módulo Auth/RRHH
- **Usuarios:** Facilitador y participantes

---

## Próximos Pasos

### 1. Ejecutar Tests
```powershell
.\test-agile-exhaustivo.ps1
```

### 2. Revisar Resultados
Verificar que:
- 36 tests pasan (verde)
- 9 tests fallan esperadamente (amarillo)
- 0 tests fallan inesperadamente (rojo)

### 3. Analizar Cobertura
Ver archivo: `FASE_10_DAILY_MEETINGS_REPORT.md`

### 4. Features Futuras
- Notificaciones automáticas
- Recordatorios programados
- Export a PDF
- Dashboard de impedimentos

---

## Referencias

### Archivos
1. **Script de tests:** `test-agile-exhaustivo.ps1` (líneas 575-674)
2. **Reporte detallado:** `FASE_10_DAILY_MEETINGS_REPORT.md`
3. **Resumen ejecutivo:** `DAILY_MEETINGS_TEST_SUMMARY.md`
4. **Esta guía:** `GUIA_DAILY_MEETINGS_TESTS.md`

### Código Fuente
1. **Controladores:** `src/modules/agile/daily-meetings/controllers/daily-meeting.controller.ts`
2. **DTOs:** `src/modules/agile/daily-meetings/dto/create-daily-meeting.dto.ts`
3. **Enums:** `src/modules/agile/daily-meetings/enums/daily-meeting.enum.ts`
4. **Servicio:** `src/modules/agile/daily-meetings/services/daily-meeting.service.ts`
5. **Entidades:** `src/modules/agile/daily-meetings/entities/`

---

**Documento generado:** 2025-12-15
**Autor:** Claude Code
**Versión:** 1.0
