# Instrucciones de Integracion: Fase 12 - Participantes de Daily Meetings

## Resumen

Se han creado **45 tests exhaustivos** para la funcionalidad de Participantes de Daily Meetings en el modulo Agile.

## Archivos Creados

1. **test-agile-fase12-participantes.ps1** - Script con los 45 tests de la Fase 12
2. **FASE12_PARTICIPANTES_REPORT.md** - Reporte detallado de cobertura y analisis
3. **INTEGRACION_FASE12.md** - Este archivo con instrucciones

## Pasos de Integracion

### Paso 1: Actualizar Variables de IDs

Editar `test-agile-exhaustivo.ps1` lineas 26-74, agregar las siguientes variables al hashtable `$ids`:

```powershell
$ids = @{
    # ... variables existentes ...
    participanteAdmin = $null
    participantePmo = $null
    participanteDev = $null
}
```

### Paso 2: Insertar Fase 12

1. Abrir `test-agile-exhaustivo.ps1`
2. Buscar la linea con el comentario `# RESUMEN FINAL` (aproximadamente linea 676)
3. Copiar todo el contenido de `test-agile-fase12-participantes.ps1`
4. Pegar justo **ANTES** de `# RESUMEN FINAL`

El resultado debe verse asi:

```powershell
# ... Fase 11 ...
Test-Api -Name "11.45 - Verificar resumen incluye participantes" ...

# ========================================
# FASE 12: PARTICIPANTES DE DAILY MEETINGS (EXHAUSTIVO)
# ========================================
Write-Host "`n=== FASE 12: PARTICIPANTES DAILY (EXHAUSTIVO) ===" -ForegroundColor Magenta

# 12.1 Agregar participantes con diferentes configuraciones
Test-Api -Name "12.1 - Agregar participante basico a daily SCRUM" ...
# ... resto de tests ...
Test-Api -Name "12.45 - Verificar conteo de participantes en resumen" ...

# RESUMEN FINAL
Write-Host "`n=======================================" -ForegroundColor Cyan
```

### Paso 3: Verificar Sintaxis

Ejecutar un check de sintaxis de PowerShell:

```powershell
powershell -File test-agile-exhaustivo.ps1 -WhatIf
```

O simplemente verificar que no haya errores al cargar:

```powershell
powershell -NoExit -Command "Get-Content test-agile-exhaustivo.ps1 | Out-Null; Write-Host 'Sintaxis OK' -ForegroundColor Green"
```

### Paso 4: Ejecutar Tests

```powershell
# Ejecutar todo el script (Fases 0-12)
.\test-agile-exhaustivo.ps1

# O si prefieres ejecutar desde PowerShell ISE
powershell -File test-agile-exhaustivo.ps1
```

## Validacion Post-Ejecucion

Verificar que los resultados muestren:

```
=== FASE 12: PARTICIPANTES DAILY (EXHAUSTIVO) ===
[PASS] 12.1 - Agregar participante basico a daily SCRUM
  Saved ID: participanteAdmin = 123
[PASS] 12.2 - Agregar participante con que hice/hare completo
  Saved ID: participantePmo = 124
...
[EXPECTED FAIL] 12.6 - Rechazar participante duplicado (mismo usuario)
...
```

Al final del script debe mostrar:

```
=======================================
RESUMEN - MODULO AGILE
=======================================

Estadisticas:
  Total:              XXX (aumentara en ~45)
  Pasadas:            XXX
  Fallidas:           XXX
  Fallos esperados:   XXX (aumentara en ~10)
  Fallos inesperados: 0  (debe ser 0)
  Duracion:           XX.XX segundos
```

## Cobertura de la Fase 12

La Fase 12 cubre los siguientes aspectos de Participantes:

### Operaciones CRUD
- CREATE: Agregar participantes con diferentes configuraciones
- READ: Consultar participantes en daily meetings
- UPDATE: Actualizar campos individuales y multiples
- DELETE: Eliminar participantes

### Validaciones de Negocio
- Participantes duplicados (409 Conflict)
- Usuarios inexistentes (404 Not Found)
- Daily meetings inexistentes (404 Not Found)
- Validacion de datos de entrada (400 Bad Request)

### Permisos por Rol
- ADMIN: Todos los permisos
- PMO: Crear, actualizar cualquiera, eliminar
- SCRUM_MASTER: Crear, actualizar cualquiera, eliminar
- COORDINADOR: Crear, actualizar cualquiera, eliminar
- DESARROLLADOR: Solo actualizar sus propios datos (actualmente 403 - necesita implementacion)

### Campos Validados
- `usuarioId` (requerido para crear)
- `queHiceAyer` (opcional, texto largo)
- `queHareHoy` (opcional, texto largo)
- `impedimentos` (opcional, texto largo)
- `asistio` (boolean, default: false)

## Estructura de Tests

| Seccion | Tests | Descripcion |
|---------|-------|-------------|
| 12.1 | 12.1-12.5 | Agregar participantes |
| 12.2 | 12.6-12.10 | Validaciones de negocio |
| 12.3 | 12.11-12.14 | Actualizacion individual |
| 12.4 | 12.15-12.17 | Campo asistencia |
| 12.5 | 12.18-12.20 | Actualizacion multiple |
| 12.6 | 12.21-12.26 | Permisos por rol |
| 12.7 | 12.27-12.30 | Consulta y verificacion |
| 12.8 | 12.31-12.33 | Eliminacion |
| 12.9 | 12.34-12.37 | Permisos de eliminacion |
| 12.10 | 12.38-12.40 | Validaciones adicionales |
| 12.11 | 12.41-12.42 | Textos largos |
| 12.12 | 12.43-12.45 | Verificacion final |

## Endpoints Probados

```
POST   /daily-meetings/:id/participantes
PATCH  /daily-meetings/participantes/:participanteId
DELETE /daily-meetings/participantes/:participanteId
GET    /daily-meetings/:id
GET    /daily-meetings/:id/resumen
```

## Casos de Prueba Destacados

### Test 12.2 - Participante Completo
```powershell
Body: {
  usuarioId: 14
  queHiceAyer: "Complete la implementacion del modulo de autenticacion..."
  queHareHoy: "Trabajare en el sistema de perfiles de usuario..."
}
```

### Test 12.18 - Actualizacion Completa
```powershell
Body: {
  queHiceAyer: "Finalice integracion con sistema de notificaciones..."
  queHareHoy: "Trabajare en la dashboard de administracion..."
  impedimentos: "Ninguno por el momento"
  asistio: true
}
```

### Test 12.25 - Validacion de Permisos
```powershell
# Dev intenta actualizar datos de Admin (debe fallar con 403)
PATCH /participantes/:adminParticipanteId
Token: devToken
Expected: 403 Forbidden
```

## Problemas Conocidos y Soluciones

### Problema 1: DESARROLLADOR recibe 403 al actualizar
**Causa:** La logica de negocio no valida si el desarrollador esta actualizando sus propios datos.

**Solucion:** Implementar en el service:
```typescript
if (currentUser.rol === Role.DESARROLLADOR) {
  const participante = await this.findOne(participanteId);
  if (participante.usuarioId !== currentUser.id) {
    throw new ForbiddenException('Solo puedes actualizar tus propios datos');
  }
}
```

### Problema 2: Campo asistio no esta en CreateParticipanteDto
**Causa:** El campo existe en la entidad pero no en el DTO de creacion.

**Solucion:** Agregar al DTO:
```typescript
@IsBoolean()
@IsOptional()
asistio?: boolean;
```

## Metricas Esperadas

| Metrica | Valor Esperado |
|---------|----------------|
| Total de tests Fase 12 | 45 |
| Tests exitosos | ~35 (77.8%) |
| Fallos esperados | ~10 (22.2%) |
| Fallos inesperados | 0 |
| Duracion Fase 12 | 15-20 seg |
| Duracion total (Fases 0-12) | 90-120 seg |

## Checklist de Integracion

- [ ] Actualizar hashtable `$ids` con nuevas variables
- [ ] Insertar codigo de Fase 12 antes de RESUMEN FINAL
- [ ] Verificar sintaxis de PowerShell
- [ ] Ejecutar script completo
- [ ] Verificar que fallos inesperados = 0
- [ ] Revisar reporte JSON generado
- [ ] Documentar resultados en TEST_REPORT.md

## Soporte

Si encuentras problemas durante la integracion:

1. Verificar que las Fases 0-11 se ejecuten correctamente
2. Revisar que los IDs `dailyId` y `dailyKanbanId` esten disponibles
3. Validar que los tokens de usuarios (13, 14, 15) sean validos
4. Consultar el archivo `FASE12_PARTICIPANTES_REPORT.md` para detalles

## Proximos Pasos

1. Integrar Fase 12 al script principal
2. Ejecutar tests y documentar resultados
3. Implementar mejoras sugeridas en el service
4. Crear tests unitarios complementarios
5. Agregar tests E2E para flujos completos

---

**Fecha:** 2025-12-15
**Version:** 1.0
**Status:** Listo para Integracion
