# INSTRUCCIONES DE USO - FASES 12 Y 13

## Requisitos Previos

1. **Backend ejecutándose**:
   ```bash
   npm run start:dev
   ```
   Debe estar corriendo en `http://localhost:3010`

2. **Tokens válidos**:
   Los tokens en el script ya están configurados para:
   - Usuario 13 (ADMIN)
   - Usuario 14 (PMO)
   - Usuario 15 (DESARROLLADOR)

3. **PowerShell 5.1 o superior**

---

## Ejecución Completa

Para ejecutar todas las fases (0-13):

```powershell
cd "E:\Sistema de Gestion de Proyectos\sigp-backend"
.\test-agile-exhaustivo.ps1
```

**Tiempo estimado**: ~3-4 minutos
**Total de tests**: 248 tests

---

## Ejecución Solo de Fases 12 y 13

Si ya ejecutaste las fases previas y solo quieres probar las nuevas:

### Opción 1: Ejecutar script completo (recomendado)
El script crea las entidades necesarias en las fases previas, por lo que es mejor ejecutarlo completo.

### Opción 2: Ejecutar manualmente endpoints específicos

**Fase 12 - Historial**:
```powershell
$baseUrl = "http://localhost:3010/api/v1"
$adminToken = "TU_TOKEN_AQUI"

# Ejemplo: Obtener historial de una HU
Invoke-RestMethod -Uri "$baseUrl/historias-usuario/1/historial" -Headers @{"Authorization"="Bearer $adminToken"} -Method GET

# Ejemplo: Estadísticas de cambios
Invoke-RestMethod -Uri "$baseUrl/historial-cambios/estadisticas?fechaDesde=2025-01-01&fechaHasta=2025-12-31" -Headers @{"Authorization"="Bearer $adminToken"} -Method GET
```

**Fase 13 - Métricas**:
```powershell
# Ejemplo: Métricas de un sprint
Invoke-RestMethod -Uri "$baseUrl/sprints/1/metricas" -Headers @{"Authorization"="Bearer $adminToken"} -Method GET

# Ejemplo: Estadísticas de una épica
Invoke-RestMethod -Uri "$baseUrl/epicas/1/estadisticas" -Headers @{"Authorization"="Bearer $adminToken"} -Method GET
```

---

## Interpretación de Resultados

### Códigos de Color

- **[PASS]** (Verde): Test exitoso
- **[FAIL]** (Rojo): Test falló inesperadamente
- **[EXPECTED FAIL]** (Amarillo): Validación negativa exitosa (ej: rechazar entidad inexistente)
- **[UNEXPECTED FAIL]** (Magenta): Error inesperado
- **[ERROR]** (Rojo): Error en la ejecución del test

### Ejemplo de Salida Exitosa

```
=== FASE 12: HISTORIAL DE CAMBIOS ===
[PASS] 12.1 - Obtener historial de Historia de Usuario
[PASS] 12.2 - Obtener historial de Tarea
[PASS] 12.3 - Obtener historial de Sprint
...
[EXPECTED FAIL] 12.22 - Rechazar entidad inexistente
[EXPECTED FAIL] 12.23 - Validar estadísticas requieren fechas
[EXPECTED FAIL] 12.24 - Validar acceso con autenticación

=== FASE 13: METRICAS Y REPORTES AVANZADOS ===
[PASS] 13.1 - Verificar métricas completas del Sprint 1
[PASS] 13.2 - Verificar métricas del Sprint 2
...
[EXPECTED FAIL] 13.17 - Rechazar métricas de sprint inexistente
```

### Resumen Final

Al finalizar, verás un resumen como:

```
=======================================
RESUMEN - MODULO AGILE
=======================================

Estadísticas:
  Total:              248
  Pasadas:            242
  Fallidas:           0
  Fallos esperados:   6
  Fallos inesperados: 0
  Duración:           187.45 segundos

  Tasa de éxito: 97.58%
```

---

## Solución de Problemas

### Error: "401 Unauthorized"

**Causa**: Tokens expirados
**Solución**: Generar nuevos tokens haciendo login:

```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admintest4@inei.gob.pe","password":"tu_password"}'
```

Actualizar los tokens en el script (líneas 9-11).

### Error: "404 Not Found" en endpoints de métricas

**Causa**: Backend no está ejecutándose o rutas incorrectas
**Solución**:
1. Verificar que el backend está corriendo: `curl http://localhost:3010/api/v1/health`
2. Revisar logs del backend para errores

### Error: "Conexión rechazada"

**Causa**: Backend no está ejecutándose
**Solución**:
```bash
npm run start:dev
```

### Tests fallando en Fase 12

**Causa probable**: No hay historial de cambios porque no se ejecutaron fases previas
**Solución**: Ejecutar el script completo desde la Fase 0

### Tests fallando en Fase 13

**Causa probable**: IDs de entidades no existen (no se crearon en fases previas)
**Solución**: Ejecutar el script completo desde la Fase 0

---

## Verificación Manual de Endpoints

### Fase 12 - Endpoints de Historial

1. **Historial por entidad** (requiere ID de entidad existente):
   - `/historias-usuario/:id/historial`
   - `/tareas/:id/historial`
   - `/sprints/:id/historial`
   - `/epicas/:id/historial`
   - `/subtareas/:id/historial`

2. **Consulta general**:
   - `/historial-cambios`
   - `/historial-cambios?entidadTipo=HU`
   - `/historial-cambios?usuarioId=13`
   - `/historial-cambios?accion=CREAR`
   - `/historial-cambios?fechaDesde=2025-01-01&fechaHasta=2025-12-31`

3. **Especiales**:
   - `/historial-cambios/recientes`
   - `/historial-cambios/estadisticas?fechaDesde=2025-01-01&fechaHasta=2025-12-31`

### Fase 13 - Endpoints de Métricas

1. **Sprint** (requiere ID de sprint existente):
   - `/sprints/:id/metricas`
   - `/sprints/:id/burndown`
   - `/sprints/:id/tablero`

2. **Épica** (requiere ID de épica existente):
   - `/epicas/:id/estadisticas`

3. **Tarea/Subtareas** (requiere ID de tarea existente):
   - `/tareas/:id/subtareas/estadisticas`

4. **Comentarios**:
   - `/historias-usuario/:id/comentarios/count`
   - `/tareas/:id/comentarios/count`
   - `/subtareas/:id/comentarios/count`

5. **Daily Meeting** (requiere ID de daily existente):
   - `/daily-meetings/:id/resumen`

---

## Swagger UI

Puedes probar manualmente todos estos endpoints en:

```
http://localhost:3010/api/docs
```

1. Autenticarse con el botón "Authorize" (usar token de admin/pmo)
2. Navegar a la sección correspondiente:
   - **Historial de Cambios**: Tag "Historial de Cambios"
   - **Sprints**: Tag "Sprints"
   - **Épicas**: Tag "Épicas"
   - etc.
3. Hacer clic en el endpoint deseado
4. Click en "Try it out"
5. Ingresar parámetros
6. Click en "Execute"

---

## Datos de Ejemplo

### Para probar manualmente (después de ejecutar el script)

El script guarda IDs en `test-agile-results.json`. Puedes consultarlos:

```powershell
Get-Content test-agile-results.json | ConvertFrom-Json | Select-Object -ExpandProperty IDs
```

Ejemplo de salida:
```json
{
  "proyectoId": 123,
  "sprintId": 456,
  "epicaId": 789,
  "huId": 101,
  "tareaId": 112
}
```

Usar estos IDs para pruebas manuales.

---

## Logs del Backend

Para ver detalles de las peticiones en tiempo real:

```bash
# Terminal del backend (npm run start:dev)
# Los logs mostrarán cada petición HTTP
```

---

## Resultados Guardados

Después de ejecutar, encontrarás:

1. **test-agile-results.json**: Resultados completos + IDs guardados
2. **Consola**: Salida colorizada en tiempo real
3. **Logs del backend**: En la terminal donde ejecutas npm

---

## Preguntas Frecuentes

**P: ¿Puedo ejecutar solo la Fase 12 o 13?**
R: No directamente. El script depende de IDs creados en fases previas. Ejecuta el script completo.

**P: ¿Cuánto tiempo tarda el script completo?**
R: ~3-4 minutos para 248 tests.

**P: ¿Los tests modifican la base de datos?**
R: Sí, crean entidades de prueba. Usar en ambiente de desarrollo/testing solamente.

**P: ¿Puedo ejecutar en producción?**
R: NO. Solo ejecutar en ambientes de desarrollo o testing.

**P: ¿Cómo limpiar datos de prueba?**
R: Todos los tests usan soft delete (activo=false). Opcionalmente, limpiar manualmente desde la BD o reiniciar la BD de testing.

**P: ¿Los tokens expiran?**
R: Sí, después de 24 horas (según config). Regenerar tokens si es necesario.

---

## Contacto y Soporte

Para dudas o problemas:
1. Revisar logs del backend
2. Verificar que el servidor está corriendo
3. Consultar documentación en `CLAUDE.md`
4. Revisar el código del controller/service correspondiente

---

**Versión**: 1.0
**Fecha**: 2025-12-15
**Compatible con**: NestJS 11, PostgreSQL 14+
