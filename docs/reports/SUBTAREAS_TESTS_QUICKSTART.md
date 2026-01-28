# Quick Start - Tests de Subtareas

## Cambios Realizados

Se agregaron **30 nuevos tests** para Subtareas en la **Fase 9** del script `test-agile-exhaustivo.ps1`.

### Antes vs Despues

| Metrica | Antes | Despues | Incremento |
|---------|-------|---------|------------|
| Tests de Subtareas | 4 | 34 | +750% |
| Total de tests script | 219 | 249 | +30 |
| Endpoints de Subtareas cubiertos | 3/7 | 7/7 | 100% |
| Estados validados | 2/5 | 4/5 | 80% |

## Archivos Modificados

1. **test-agile-exhaustivo.ps1**
   - Lineas 494-565: Nueva Fase 9 (30 tests)
   - Lineas 60-65: 6 nuevos IDs en hashtable
   - Fases 9-10 renumeradas a 10-11 (45 tests actualizados)

## Ejecucion Rapida

### Pre-requisitos

```powershell
# 1. Backend debe estar corriendo
cd "E:\Sistema de Gestion de Proyectos\sigp-backend"
npm run start:dev

# 2. En otra terminal, ejecutar tests
.\test-agile-exhaustivo.ps1
```

### Ver Solo Fase 9

```powershell
# Ejecutar script completo y filtrar salida
.\test-agile-exhaustivo.ps1 | Select-String -Pattern "FASE 9|9\.\d+" -Context 0,1
```

### Ver Resumen Final

```powershell
# Al final del script se muestra:
# - Total: 249 tests
# - Pasadas: ~XXX
# - Fallidas: ~XXX
# - Fallos esperados: ~30 (incluye los 6 de Fase 9)
# - Tasa de exito: ~XX%
```

## Tests de la Fase 9

### Cobertura por Seccion

| Seccion | Tests | Descripcion |
|---------|-------|-------------|
| 9.1 Creacion avanzada | 4 | Responsables, fechas, prioridades |
| 9.2 Estados y flujos | 5 | Por hacer → Finalizado |
| 9.3 Asignacion | 3 | Asignar/reasignar responsables |
| 9.4 Estadisticas | 2 | Metricas de tarea |
| 9.5 Filtros | 3 | Query params y nested routes |
| 9.6 Actualizacion | 3 | Modificacion de campos |
| 9.7 Validaciones negocio | 4 | KANBAN only, duplicados |
| 9.8 Validaciones permisos | 1 | Rol DESARROLLADOR |
| 9.9 Eliminacion | 5 | Soft delete |

### Tests que Deben Fallar (ShouldFail = true)

```
9.21 - Rechazar sin tareaId                    (400 Bad Request)
9.22 - Rechazar tarea SCRUM (solo KANBAN)      (400 Bad Request)
9.23 - Rechazar codigo duplicado               (409 Conflict)
9.24 - Rechazar tarea inexistente              (404 Not Found)
9.25 - Rechazar creacion sin permisos          (403 Forbidden)
9.30 - Rechazar eliminacion sin permisos       (403 Forbidden)
```

**Total**: 6 tests negativos (validaciones esperadas)

## Validacion Post-Ejecucion

### 1. Verificar Resultados JSON

```powershell
$results = Get-Content .\test-agile-results.json | ConvertFrom-Json
Write-Host "Total: $($results.Summary.Total)"
Write-Host "Pasados: $($results.Summary.Passed)"
Write-Host "Fallidos: $($results.Summary.Failed)"
Write-Host "Fallos esperados: $($results.Summary.ExpectedFail)"
```

### 2. Verificar IDs Guardados

```powershell
$results = Get-Content .\test-agile-results.json | ConvertFrom-Json
$results.IDs | Format-List subtarea*
```

**Salida esperada**:
```
subtareaId        : X
subtareaId2       : Y
subtareaId3       : Z  # Nuevo
subtareaId4       : W  # Nuevo
subtareaId5       : V  # Nuevo
subtareaId6       : U  # Nuevo
subtareaId7       : T  # Nuevo
subtareaDeleteId  : S  # Nuevo
```

### 3. Verificar Tests de Fase 9

```powershell
# Filtrar solo tests de Fase 9 en la salida
.\test-agile-exhaustivo.ps1 | Select-String "9\.\d+ -" | Measure-Object
# Debe mostrar: Count: 30
```

## Debugging

### Si algun test falla inesperadamente:

#### Error 401 Unauthorized
```powershell
# Los tokens pueden haber expirado, regenerar tokens en el script
# Actualizar las variables $adminToken, $pmoToken, $devToken en lineas 9-11
```

#### Error 404 Not Found (subtarea no existe)
```powershell
# Verificar que las subtareas base se crearon en Fase 4
# Tests 4.13 y 4.14 deben pasar primero
```

#### Error 400 Bad Request (tareaId invalido)
```powershell
# Verificar que las tareas KANBAN se crearon en Fase 4
# Tests 4.5 y 4.6 deben pasar primero
# $ids.tareaKanbanId y $ids.tareaKanbanId2 deben tener valores
```

#### Error 403 Forbidden
```powershell
# Verificar que el token corresponde al rol esperado
# Tests 9.1-9.4, 9.26-9.27 requieren ADMIN, PMO o COORDINADOR
# Test 9.12 usa DESARROLLADOR (debe pasar)
# Tests 9.25, 9.30 usan DESARROLLADOR (deben fallar)
```

### Ejecutar Solo un Test Especifico

Modificar el script temporalmente para comentar otros tests o extraer el test individual:

```powershell
# Ejemplo: Test 9.13
$baseUrl = "http://localhost:3010/api/v1"
$adminToken = "..." # Tu token

$tareaKanbanId = 123 # ID de tu tarea KANBAN

$response = Invoke-RestMethod -Uri "$baseUrl/tareas/$tareaKanbanId/subtareas/estadisticas" `
    -Method GET `
    -Headers @{Authorization="Bearer $adminToken"}

$response | ConvertTo-Json -Depth 10
```

## Endpoints Documentados

Todos los endpoints de Subtareas estan documentados en Swagger:
```
http://localhost:3010/api/docs
```

Buscar por tag: **subtareas**

## Estructura de Datos

### CreateSubtareaDto
```json
{
  "tareaId": 123,           // Required, debe ser tarea KANBAN
  "codigo": "SUBTASK-001",  // Required, unique por tarea
  "nombre": "Nombre",       // Required, max 200
  "descripcion": "...",     // Optional
  "estado": "Por hacer",    // Optional, default "Por hacer"
  "prioridad": "Alta",      // Optional, default "Media"
  "responsableId": 15,      // Optional, userId
  "horasEstimadas": 5.5,    // Optional
  "fechaInicio": "2025-02-01", // Optional
  "fechaFin": "2025-02-05"  // Optional
}
```

### UpdateSubtareaDto
```json
{
  "codigo": "...",          // Optional
  "nombre": "...",          // Optional
  "descripcion": "...",     // Optional
  "estado": "Finalizado",   // Optional
  "prioridad": "Baja",      // Optional
  "responsableId": 13,      // Optional
  "horasEstimadas": 6,      // Optional
  "horasReales": 5.5,       // Optional
  "evidenciaUrl": "https://...", // Optional
  "fechaInicio": "...",     // Optional
  "fechaFin": "..."         // Optional
}
```

### Estadisticas Response
```json
{
  "total": 5,
  "porEstado": {
    "Por hacer": 1,
    "En progreso": 2,
    "Finalizado": 2
  },
  "horasEstimadas": 20,
  "horasReales": 15.5,
  "progreso": 40  // % de subtareas finalizadas
}
```

## Checklist de Validacion

- [ ] Backend corriendo en puerto 3010
- [ ] Tokens validos en el script
- [ ] Test 0.1-0.8 (Setup POI) pasaron
- [ ] Test 4.5-4.6 (Tareas KANBAN) pasaron
- [ ] Test 4.13-4.14 (Subtareas base) pasaron
- [ ] Script ejecutado sin errores de sintaxis
- [ ] Fase 9 muestra "=== FASE 9: SUBTAREAS DETALLADAS ==="
- [ ] 30 tests ejecutados en Fase 9
- [ ] 24 tests pasaron (verdes)
- [ ] 6 tests fallaron como esperado (amarillos)
- [ ] 0 tests fallaron inesperadamente (rojos)
- [ ] IDs guardados: subtareaId3-7, subtareaDeleteId
- [ ] JSON generado: test-agile-results.json

## Contacto

Si tienes dudas o encuentras problemas:
1. Revisar logs del backend (consola donde corre npm run start:dev)
2. Revisar Swagger docs (http://localhost:3010/api/docs)
3. Revisar codigo fuente:
   - Controller: `src/modules/agile/subtareas/controllers/subtarea.controller.ts`
   - Service: `src/modules/agile/subtareas/services/subtarea.service.ts`
   - DTOs: `src/modules/agile/subtareas/dto/`

---

**Total de tests agregados**: 30
**Archivo modificado**: `test-agile-exhaustivo.ps1`
**Fecha**: 2025-12-15
