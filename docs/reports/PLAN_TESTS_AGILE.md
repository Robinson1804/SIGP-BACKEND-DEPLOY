# Plan de Implementación de Tests Módulo Agile

## 📊 Estado Actual

**Tests Implementados:** 66/340 (19.4%)
- ✅ Pasados: 51 (77.27%)
- ❌ Fallidos: 7
  - Esperados: 7 (validaciones de seguridad)
  - Inesperados: 0

**Cobertura por Fase:**
| Fase | Tests | Estado | Éxito |
|------|-------|--------|-------|
| Setup POI | 8 | ✅ Completo | 100% |
| Épicas | 10 | ✅ Completo | 100% |
| Sprints | 12 | ✅ Completo | 100% |
| Historias Usuario | 16 | ⚠️ Parcial | 81% |
| Tareas | 16 | ⚠️ Parcial | 37.5% |
| Tableros | 4 | ✅ Completo | 100% |

## 🔴 Problemas Críticos Identificados

### 1. HU-Requerimientos (Tests 3.14-3.16)
**Problema:** Endpoint devuelve 404
**Causa Raíz:**
- ✅ Entidad existe: `hu-requerimiento.entity.ts`
- ✅ DTO existe: `vincular-requerimiento.dto.ts`
- ❌ Falta endpoint en `historia-usuario.controller.ts`
- ❌ Falta método en `historia-usuario.service.ts`

**Solución:**
```typescript
// En historia-usuario.controller.ts
@Post(':id/requerimientos')
@Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
vincularRequerimiento(
  @Param('id', ParseIntPipe) id: number,
  @Body() vincularDto: VincularRequerimientoDto,
  @CurrentUser('id') userId: number,
) {
  return this.huService.vincularRequerimiento(id, vincularDto, userId);
}

@Get(':id/requerimientos')
getRequerimientos(@Param('id', ParseIntPipe) id: number) {
  return this.huService.getRequerimientos(id);
}

@Delete(':id/requerimientos/:requerimientoId')
@Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
desvincularRequerimiento(
  @Param('id', ParseIntPipe) id: number,
  @Param('requerimientoId', ParseIntPipe) requerimientoId: number,
) {
  return this.huService.desvincularRequerimiento(id, requerimientoId);
}
```

### 2. Subtareas (Tests 4.12-4.16)
**Problema:** Todos los endpoints retornan 400/404
**Posibles Causas:**
- Validación fallando en DTO (usa `TareaEstado` - verificar si debería ser `SubtareaEstado`)
- IDs no guardados correctamente
- Problemas en service/repository

**Investigación Requerida:**
1. Revisar enums de estado (¿SubtareaEstado vs TareaEstado?)
2. Verificar que el ID se guarda en `$ids.tareaId2`
3. Debug del DTO y validaciones

## 📋 Plan de Implementación por Fases

### FASE A: Corrección de Bugs (Alta Prioridad)
**Objetivo:** Llevar los tests actuales al 100%
**Duración Estimada:** 2-4 horas

1. **Bug HU-Requerimientos** (30 min)
   - Agregar endpoints al controller
   - Implementar métodos en service
   - Validar tests 3.14-3.16

2. **Bug Subtareas** (1-2 horas)
   - Investigar problema de validación
   - Corregir DTOs/Enums
   - Validar tests 4.12-4.16

**Agente Sugerido:** `error-detective` para investigar subtareas

---

### FASE B: Criterios de Aceptación (15 tests)
**Estado:** Entidad inline en HU, sin endpoints CRUD separados
**Objetivo:** Endpoints CRUD completos para gestión independiente

**Tests a Implementar:**
```powershell
# 6.1 Creación
- Crear criterio vía endpoint separado
- Crear múltiples criterios
- Validar orden automático
- Rechazar sin HU válida

# 6.2 Consulta
- Listar criterios de una HU
- Obtener criterio por ID
- Filtrar por orden

# 6.3 Actualización
- Actualizar given/when/then
- Reordenar criterios
- Cambiar orden de múltiples criterios

# 6.4 Eliminación
- Eliminar criterio
- Validar no se puede eliminar último criterio
- Recalcular órdenes tras eliminación

# 6.5 Validaciones
- Rechazar duplicados
- Validar permisos
```

**Implementación:**
1. Crear `CriterioAceptacionController`
2. Crear `CriterioAceptacionService`
3. Crear DTOs: Create, Update, Reordenar
4. Agregar relación eager en HU
5. Crear 15 tests en script

**Agente Sugerido:** `fullstack-developer`

---

### FASE C: Dependencias HU (10 tests)
**Estado:** Endpoints implementados en controller, sin tests
**Objetivo:** Validar funcionalidad completa de dependencias

**Tests a Implementar:**
```powershell
# 7.1 Creación
- Agregar dependencia "bloqueada por"
- Agregar dependencia "bloquea a"
- Crear dependencias múltiples
- Rechazar dependencias circulares

# 7.2 Consulta
- Listar dependencias de HU
- Obtener grafo de dependencias
- Validar estado de dependencias

# 7.3 Eliminación
- Eliminar dependencia
- Validar permisos

# 7.4 Validaciones
- Rechazar dependencia duplicada
- Rechazar auto-dependencia
- Rechazar ciclos (A→B→C→A)
```

**Implementación:**
- Solo crear tests (endpoints ya existen)
- Validar método `agregarDependencia` en service

**Agente Sugerido:** `test-automator`

---

### FASE D: Subtareas Detalladas (20 tests)
**Estado:** CRUD básico implementado, expandir cobertura
**Objetivo:** Tests completos incluyendo workflows y estados

**Tests a Implementar:**
```powershell
# 8.1 Creación avanzada
- Crear subtarea con responsable
- Crear subtarea con estimación
- Crear subtarea con fechas
- Validar campos obligatorios

# 8.2 Estados y flujos
- Cambiar estado Pendiente → En progreso
- Cambiar estado En progreso → Finalizado
- Rechazar estado inválido
- Validar no retroceder estados

# 8.3 Asignación
- Asignar responsable
- Cambiar responsable
- Rechazar usuario no del equipo

# 8.4 Estadísticas
- Obtener estadísticas de tarea
- Validar % completado
- Horas consumidas vs estimadas

# 8.5 Filtros
- Filtrar por estado
- Filtrar por responsable
- Filtrar por tarea padre

# 8.6 Validaciones
- Rechazar sin tareaId
- Validar permisos por rol
```

**Agente Sugerido:** `test-automator`

---

### FASE E: Daily Meetings (30 tests)
**Estado:** Controller completo, sin tests
**Objetivo:** Tests completos para SCRUM y Kanban

**Tests a Implementar:**
```powershell
# 9.1 Creación SCRUM
- Crear daily meeting de sprint
- Crear daily con fecha/hora/lugar
- Crear daily con notas
- Rechazar sin sprint

# 9.2 Creación KANBAN
- Crear daily meeting de actividad
- Rechazar sin actividad

# 9.3 Consulta
- Listar todas las dailies
- Filtrar por tipo (SCRUM/KANBAN)
- Filtrar por proyecto
- Filtrar por sprint
- Filtrar por rango de fechas
- Obtener daily por ID
- Obtener resumen de daily

# 9.4 Actualización
- Actualizar fecha/hora
- Actualizar notas
- Actualizar lugar

# 9.5 Consultas anidadas
- Listar dailies de proyecto
- Listar dailies de sprint
- Listar dailies de actividad

# 9.6 Eliminación
- Eliminar daily meeting
- Validar permisos

# 9.7 Validaciones
- Rechazar creación sin permisos
- Validar fecha no puede ser futura > 1 día
```

**Agente Sugerido:** `test-automator`

---

### FASE F: Daily Participantes (18 tests)
**Estado:** Endpoints en controller, sin tests
**Objetivo:** Tests completos de participantes

**Tests a Implementar:**
```powershell
# 10.1 Creación
- Agregar participante a daily
- Agregar múltiples participantes
- Agregar con "Qué hice"/"Qué haré"/"Bloqueadores"
- Rechazar participante duplicado

# 10.2 Consulta
- Listar participantes de daily
- Obtener participante por ID
- Filtrar por usuario

# 10.3 Actualización
- Actualizar "Qué hice"
- Actualizar "Qué haré"
- Actualizar "Bloqueadores"
- Actualizar asistencia
- Cambiar estado presente/ausente

# 10.4 Eliminación
- Eliminar participante
- Validar permisos

# 10.5 Validaciones
- Rechazar sin usuario válido
- Validar permisos (solo SCRUM_MASTER/ADMIN)
- Desarrollador puede actualizar solo sus datos
```

**Agente Sugerido:** `test-automator`

---

### FASE G: Comentarios (25 tests)
**Estado:** ❌ Solo entidad, sin service/controller/DTOs
**Objetivo:** Implementación completa + tests

**Funcionalidad a Implementar:**
1. **Service:** `ComentarioService`
2. **Controller:** `ComentarioController`
3. **DTOs:**
   - `CreateComentarioDto`
   - `UpdateComentarioDto`
4. **Endpoints:**
   - `POST /comentarios` - Crear
   - `GET /comentarios?entidadTipo=HU&entidadId=X` - Listar
   - `GET /comentarios/:id` - Obtener
   - `PATCH /comentarios/:id` - Actualizar
   - `DELETE /comentarios/:id` - Eliminar
5. **Nested endpoints:**
   - `GET /historias-usuario/:id/comentarios`
   - `GET /tareas/:id/comentarios`
   - `GET /subtareas/:id/comentarios`

**Tests a Implementar:**
```powershell
# 11.1 Creación
- Crear comentario en HU
- Crear comentario en Tarea
- Crear comentario en Subtarea
- Crear con mención a usuario (@username)
- Rechazar sin contenido

# 11.2 Consulta
- Listar comentarios de HU
- Listar comentarios de Tarea
- Listar comentarios de Subtarea
- Filtrar por autor
- Filtrar por fecha
- Obtener comentario por ID

# 11.3 Actualización
- Actualizar contenido
- Solo autor puede actualizar
- Validar campo editado = true

# 11.4 Eliminación
- Eliminar comentario (soft delete)
- Solo autor/admin pueden eliminar

# 11.5 Menciones
- Detectar menciones @usuario
- Validar usuarios mencionados existen

# 11.6 Validaciones
- Rechazar contenido vacío
- Validar permisos por rol
- Validar entidad existe
```

**Agente Sugerido:** `fullstack-developer`

---

### FASE H: Historial de Cambios (20 tests)
**Estado:** ❌ Solo entidad, sin service/controller/DTOs
**Objetivo:** Implementación completa + tests

**Funcionalidad a Implementar:**
1. **Service:** `HistorialCambioService`
2. **Middleware/Interceptor:** Registro automático de cambios
3. **Controller:** Solo lectura (no crear/actualizar manual)
4. **DTOs:** Response DTO
5. **Endpoints:**
   - `GET /historial-cambios?entidadTipo=HU&entidadId=X`
   - `GET /historial-cambios/:id`
6. **Nested endpoints:**
   - `GET /historias-usuario/:id/historial`
   - `GET /tareas/:id/historial`
   - `GET /sprints/:id/historial`

**Tests a Implementar:**
```powershell
# 12.1 Registro automático
- Crear HU registra cambio
- Actualizar HU registra cambio
- Cambiar estado registra cambio
- Asignar usuario registra cambio

# 12.2 Consulta
- Listar historial de HU
- Listar historial de Tarea
- Listar historial de Sprint
- Filtrar por tipo de cambio
- Filtrar por usuario
- Filtrar por rango de fechas

# 12.3 Detalle de cambios
- Ver valores anteriores (oldValue)
- Ver valores nuevos (newValue)
- Ver descripción del cambio
- Identificar usuario que hizo cambio

# 12.4 Filtros avanzados
- Cambios en último día
- Cambios por usuario específico
- Cambios de campo específico (ej: "estado")

# 12.5 Validaciones
- Solo lectura (no POST/PATCH/DELETE)
- Validar permisos de visualización
```

**Implementación Especial:**
- Usar interceptor para capturar cambios automáticamente
- Implementar comparación de objetos (diff)

**Agente Sugerido:** `fullstack-developer`

---

### FASE I: Métricas y Reportes (18 tests)
**Estado:** Algunas métricas implementadas, expandir cobertura
**Objetivo:** Tests completos de analytics

**Tests a Implementar:**
```powershell
# 13.1 Métricas de Proyecto
- Velocity del proyecto
- Story points completados
- Burnup chart del proyecto
- Distribución por estado
- Distribución por prioridad

# 13.2 Métricas de Sprint
- Velocity del sprint
- Burndown chart (ya existe)
- Métricas de sprint (ya existe)
- Eficiencia del sprint (planned vs completed)

# 13.3 Métricas de Equipo
- Story points por desarrollador
- Tareas completadas por usuario
- Tiempo promedio por tarea
- Tasa de completado

# 13.4 Reportes
- Reporte de épicas con progreso
- Reporte de HU bloqueadas
- Reporte de tareas atrasadas
- Resumen ejecutivo del proyecto

# 13.5 Validaciones
- Validar permisos (solo PMO/ADMIN/COORDINADOR)
- Validar fechas válidas
```

**Agente Sugerido:** `test-automator`

---

## 🚀 Estrategia de Ejecución con Agentes

### Opción 1: Paralelo Máximo (Más Rápido - 4-6 horas)
Ejecutar agentes en paralelo para fases independientes:

```bash
# Grupo 1: Correcciones (Secuencial)
Agente 1: error-detective → Investigar y corregir bugs (Fase A)

# Grupo 2: Implementaciones Full-Stack (Paralelo)
Agente 2: fullstack-developer → Comentarios (Fase G)
Agente 3: fullstack-developer → Historial de Cambios (Fase H)
Agente 4: fullstack-developer → Criterios de Aceptación (Fase B)

# Grupo 3: Solo Tests (Paralelo - después de Grupo 1)
Agente 5: test-automator → Dependencias HU (Fase C)
Agente 6: test-automator → Subtareas detalladas (Fase D)
Agente 7: test-automator → Daily Meetings (Fase E)
Agente 8: test-automator → Daily Participantes (Fase F)
Agente 9: test-automator → Métricas y Reportes (Fase I)
```

**Total:** 9 agentes en 3 oleadas

### Opción 2: Paralelo Moderado (Balance - 6-8 horas)
```bash
# Paso 1: Correcciones
1 agente: Fase A (bugs)

# Paso 2: Implementaciones (2-3 en paralelo)
2 agentes: Fases G, H (más complejas)

# Paso 3: Tests + 1 implementación (4 en paralelo)
4 agentes: Fases B, C, D, E

# Paso 4: Tests finales (2 en paralelo)
2 agentes: Fases F, I
```

**Total:** 4-5 agentes en 4 pasos

### Opción 3: Secuencial (Más Control - 8-12 horas)
1 agente a la vez, validando cada fase antes de continuar

---

## 📊 Cobertura Final Proyectada

| Categoría | Tests Actual | Tests Plan | Total Final |
|-----------|--------------|------------|-------------|
| Setup POI | 8 | 0 | 8 |
| Épicas | 10 | 0 | 10 |
| Sprints | 12 | 0 | 12 |
| Historias Usuario | 16 | 0 | 16 |
| Tareas | 16 | 0 | 16 |
| Tableros | 4 | 0 | 4 |
| **Criterios Aceptación** | 0 | 15 | **15** |
| **Dependencias HU** | 0 | 10 | **10** |
| **Subtareas Detalladas** | 0 | 20 | **20** |
| **Daily Meetings** | 0 | 30 | **30** |
| **Daily Participantes** | 0 | 18 | **18** |
| **Comentarios** | 0 | 25 | **25** |
| **Historial Cambios** | 0 | 20 | **20** |
| **Métricas/Reportes** | 0 | 18 | **18** |
| **TOTAL** | **66** | **156** | **222** |

**Tasa de Completado Final:** 222/340 = **65.3%**

---

## ✅ Comandos de Ejecución

### Ejecutar tests actuales:
```powershell
.\test-agile-exhaustivo.ps1
```

### Ejecutar tests de una fase específica:
```powershell
# Ejemplo: solo daily meetings
.\test-agile-exhaustivo.ps1 | Select-String "FASE.*DAILY"
```

### Validar cobertura:
```powershell
npm run test:e2e -- --coverage
```

---

## 🎯 Próximos Pasos Recomendados

1. **INMEDIATO:** Corregir bugs Fase A (30-120 min)
   - Arreglar HU-Requerimientos
   - Investigar Subtareas

2. **CORTO PLAZO:** Implementar funcionalidades faltantes (4-8 horas)
   - Comentarios
   - Historial de Cambios
   - Criterios de Aceptación

3. **MEDIANO PLAZO:** Completar tests (4-6 horas)
   - Daily Meetings completo
   - Dependencias HU
   - Métricas avanzadas

4. **OPCIONAL:** Tests adicionales para llegar a 340
   - Tests de integración
   - Tests de performance
   - Tests de carga
   - Tests de seguridad avanzados

---

## 📝 Notas de Implementación

### Buenas Prácticas
- Mantener patrón consistente con tests existentes
- Usar tokens JWT reales (ya generados en script)
- Validar códigos únicos con timestamp
- Guardar IDs para tests dependientes
- Usar flags `ShouldFail` para validaciones esperadas

### Estructura de Test
```powershell
Test-Api -Name "X.Y - Descripción clara" `
  -Method POST `
  -Endpoint "/ruta" `
  -Token $tokenAdecuado `
  -Body @{campo="valor"} `
  -ExpectedStatus 200 `
  -SaveIdAs "variableId"
```

### Validaciones de Seguridad
Siempre incluir tests de:
- Rechazar sin autenticación (401)
- Rechazar sin permisos (403)
- Validar campos obligatorios (400)
- Validar duplicados (409)
- Validar referencias (404)
