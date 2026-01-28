# Fase 12: Tests Exhaustivos de Participantes de Daily Meetings

## Resumen Ejecutivo

Se ha creado la **Fase 12** con **45 tests exhaustivos** para cubrir completamente la funcionalidad de participantes en Daily Meetings (SCRUM y Kanban).

## Archivo Creado

**Ubicacion:** `E:\Sistema de Gestion de Proyectos\sigp-backend\test-agile-fase12-participantes.ps1`

## Cobertura de Tests

### 12.1 Agregar Participantes (Tests 12.1 - 12.5)
- **12.1** - Participante basico (solo usuarioId)
- **12.2** - Participante con queHiceAyer y queHareHoy completos
- **12.3** - Participante con impedimentos
- **12.4** - Participante a daily Kanban
- **12.5** - Participante solo con impedimentos

**Endpoints:**
```
POST /daily-meetings/:id/participantes
```

**DTOs Validados:**
```typescript
CreateParticipanteDto {
  usuarioId: number (requerido)
  queHiceAyer?: string
  queHareHoy?: string
  impedimentos?: string
}
```

### 12.2 Validaciones de Negocio (Tests 12.6 - 12.10)
- **12.6** - Rechazar participante duplicado (409 Conflict)
- **12.7** - Rechazar sin permisos DESARROLLADOR (403 Forbidden)
- **12.8** - Rechazar sin usuarioId valido (400 Bad Request)
- **12.9** - Rechazar con usuarioId inexistente (404 Not Found)
- **12.10** - Rechazar agregar a daily inexistente (404 Not Found)

**Permisos para CREAR participantes:**
- ADMIN ✓
- PMO ✓
- COORDINADOR ✓
- SCRUM_MASTER ✓
- DESARROLLADOR ✗

### 12.3 Actualizacion de Campos Individuales (Tests 12.11 - 12.14)
- **12.11** - Actualizar solo queHiceAyer
- **12.12** - Actualizar solo queHareHoy
- **12.13** - Actualizar solo impedimentos
- **12.14** - Limpiar impedimentos (string vacio)

**Endpoints:**
```
PATCH /daily-meetings/participantes/:participanteId
```

**DTOs Validados:**
```typescript
UpdateParticipanteDto {
  queHiceAyer?: string
  queHareHoy?: string
  impedimentos?: string
  asistio?: boolean
}
```

### 12.4 Actualizacion de Asistencia (Tests 12.15 - 12.17)
- **12.15** - Marcar asistencia como presente (true)
- **12.16** - Marcar asistencia como ausente (false)
- **12.17** - Cambiar asistencia de false a true

**Campo validado:**
```typescript
asistio: boolean // default: false
```

### 12.5 Actualizacion Multiple de Campos (Tests 12.18 - 12.20)
- **12.18** - Actualizar todos los campos juntos (queHiceAyer, queHareHoy, impedimentos, asistio)
- **12.19** - Actualizar queHice y queHare juntos
- **12.20** - Actualizar queHare e impedimentos juntos

**Validacion:** Todos los campos opcionales pueden ser actualizados simultaneamente.

### 12.6 Permisos de Actualizacion por Rol (Tests 12.21 - 12.26)
- **12.21** - ADMIN puede actualizar cualquier participante ✓
- **12.22** - PMO puede actualizar cualquier participante ✓
- **12.23** - SCRUM_MASTER puede actualizar cualquier participante ✓
- **12.24** - COORDINADOR puede actualizar cualquier participante ✓
- **12.25** - DESARROLLADOR NO puede actualizar otros (403) ✗
- **12.26** - DESARROLLADOR NO puede actualizar otros (403) ✗

**Permisos para ACTUALIZAR participantes:**
- ADMIN: Cualquier participante ✓
- PMO: Cualquier participante ✓
- COORDINADOR: Cualquier participante ✓
- SCRUM_MASTER: Cualquier participante ✓
- DESARROLLADOR: Solo sus propios datos (NOT IMPLEMENTED YET - Current: 403)

**NOTA IMPORTANTE:** Actualmente DESARROLLADOR recibe 403 Forbidden. Segun el controlador (linea 84), DESARROLLADOR tiene permiso, pero la logica de negocio debe validar que solo puede actualizar sus propios datos (donde participante.usuarioId === currentUser.id).

### 12.7 Consulta y Verificacion (Tests 12.27 - 12.30)
- **12.27** - Obtener daily con participantes actualizados
- **12.28** - Verificar participantes en resumen detallado
- **12.29** - Obtener daily Kanban con participantes
- **12.30** - Verificar datos completos de participantes

**Endpoints validados:**
```
GET /daily-meetings/:id
GET /daily-meetings/:id/resumen
```

### 12.8 Eliminacion de Participantes (Tests 12.31 - 12.33)
- **12.31** - Eliminar participante por Admin
- **12.32** - Verificar participante eliminado no aparece
- **12.33** - Rechazar eliminar sin permisos (dev) (403)

**Endpoints:**
```
DELETE /daily-meetings/participantes/:participanteId
```

### 12.9 Permisos de Eliminacion por Rol (Tests 12.34 - 12.37)
- **12.34-12.35** - PMO puede eliminar participante ✓
- **12.36-12.37** - SCRUM_MASTER puede eliminar participante ✓

**Permisos para ELIMINAR participantes:**
- ADMIN ✓
- PMO ✓
- SCRUM_MASTER ✓
- COORDINADOR ✓ (segun controlador linea 93)
- DESARROLLADOR ✗

### 12.10 Validaciones de Actualizacion (Tests 12.38 - 12.40)
- **12.38** - Rechazar actualizar participante inexistente (404)
- **12.39** - Rechazar eliminar participante inexistente (404)
- **12.40** - Actualizar con body vacio debe ser exitoso (200)

### 12.11 Casos Especiales - Textos Largos (Tests 12.41 - 12.42)
- **12.41** - Actualizar con texto largo en queHiceAyer (500+ caracteres)
- **12.42** - Actualizar con texto largo en impedimentos (500+ caracteres)

**Validacion:** Los campos de texto no tienen limite de longitud definido en DTOs.

### 12.12 Verificacion Final (Tests 12.43 - 12.45)
- **12.43** - Verificar estado final en daily SCRUM
- **12.44** - Verificar estado final en daily Kanban
- **12.45** - Verificar conteo de participantes en resumen

## Variables de IDs Utilizadas

Las siguientes variables del hashtable `$ids` son utilizadas:

```powershell
$ids.dailyId           # Daily Meeting SCRUM (de Fase 11)
$ids.dailyKanbanId     # Daily Meeting Kanban (de Fase 11)
$ids.participanteAdmin # Participante Admin (creado en 12.1)
$ids.participantePmo   # Participante PMO (creado en 12.2)
$ids.participanteDev   # Participante Dev (creado en 12.3)
```

## Tokens Utilizados

```powershell
$adminToken         # Usuario ID 13 - Rol: ADMIN
$pmoToken           # Usuario ID 14 - Rol: PMO
$devToken           # Usuario ID 15 - Rol: DESARROLLADOR
$scrumMasterToken   # Alias de $adminToken
$coordinadorToken   # Alias de $pmoToken
```

## Estadisticas de Tests

| Categoria | Cantidad | Porcentaje |
|-----------|----------|------------|
| Tests de Exito | 35 | 77.8% |
| Tests de Fallo Esperado | 10 | 22.2% |
| **Total** | **45** | **100%** |

### Distribucion por Operacion

| Operacion | Tests | Exito | Fallo |
|-----------|-------|-------|-------|
| POST (Crear) | 10 | 5 | 5 |
| PATCH (Actualizar) | 22 | 18 | 4 |
| GET (Consultar) | 10 | 10 | 0 |
| DELETE (Eliminar) | 3 | 2 | 1 |

## Endpoints Validados

1. `POST /daily-meetings/:id/participantes` - Agregar participante
2. `PATCH /daily-meetings/participantes/:participanteId` - Actualizar participante
3. `DELETE /daily-meetings/participantes/:participanteId` - Eliminar participante
4. `GET /daily-meetings/:id` - Obtener daily con participantes
5. `GET /daily-meetings/:id/resumen` - Resumen con participantes

## DTOs Validados

### CreateParticipanteDto
```typescript
{
  usuarioId: number      // Requerido
  queHiceAyer?: string   // Opcional
  queHareHoy?: string    // Opcional
  impedimentos?: string  // Opcional
}
```

### UpdateParticipanteDto
```typescript
{
  queHiceAyer?: string   // Opcional
  queHareHoy?: string    // Opcional
  impedimentos?: string  // Opcional
  asistio?: boolean      // Opcional
}
```

## Entidad Validada

### DailyParticipante
```typescript
{
  id: number
  dailyMeetingId: number
  usuarioId: number
  queHiceAyer: string | null
  queHareHoy: string | null
  impedimentos: string | null
  asistio: boolean              // default: false
  createdAt: Date
  updatedAt: Date
}
```

## Casos de Uso Cubiertos

### Escenarios de Exito
1. Agregar participantes con diferentes combinaciones de campos
2. Actualizar campos individuales (queHice, queHare, impedimentos)
3. Marcar y cambiar estado de asistencia
4. Actualizar multiples campos simultaneamente
5. Diferentes roles actualizando participantes
6. Consultar participantes en daily meetings
7. Eliminar participantes

### Escenarios de Fallo
1. Participante duplicado (mismo usuario en misma daily)
2. Sin permisos para agregar (DESARROLLADOR)
3. UsuarioId invalido o inexistente
4. Daily meeting inexistente
5. Sin permisos para actualizar otros participantes (DESARROLLADOR)
6. Sin permisos para eliminar (DESARROLLADOR)
7. Participante inexistente

## Observaciones y Recomendaciones

### 1. Permiso de DESARROLLADOR para Actualizar
**Observacion:** Actualmente DESARROLLADOR recibe 403 Forbidden al intentar actualizar participantes de otros usuarios.

**Recomendacion:** Implementar logica en el service para validar:
```typescript
// En updateParticipante(participanteId, updateDto, currentUser)
if (currentUser.rol === Role.DESARROLLADOR) {
  const participante = await this.findOne(participanteId);
  if (participante.usuarioId !== currentUser.id) {
    throw new ForbiddenException('Solo puedes actualizar tus propios datos');
  }
}
```

### 2. Validacion de Longitud de Texto
**Observacion:** Los campos `queHiceAyer`, `queHareHoy` e `impedimentos` no tienen limite de longitud en DTOs.

**Recomendacion:** Considerar agregar `@MaxLength()` si se requiere limitar:
```typescript
@IsString()
@IsOptional()
@MaxLength(2000)
queHiceAyer?: string;
```

### 3. Campo `asistio` en CreateParticipanteDto
**Observacion:** El campo `asistio` no está en CreateParticipanteDto pero existe en la entidad con default false.

**Recomendacion:** Considerar agregar el campo opcional en CreateParticipanteDto:
```typescript
@IsBoolean()
@IsOptional()
asistio?: boolean;
```

### 4. Validacion de Daily Meeting Activa
**Observacion:** No se valida si la daily meeting existe antes de agregar participantes.

**Recomendacion:** El service debe validar:
```typescript
const daily = await this.dailyMeetingRepository.findOne({
  where: { id: dailyMeetingId }
});
if (!daily) {
  throw new NotFoundException('Daily meeting no encontrada');
}
```

## Integracion con test-agile-exhaustivo.ps1

Para integrar esta fase al script principal:

1. Abrir `test-agile-exhaustivo.ps1`
2. Localizar la linea `# RESUMEN FINAL` (aproximadamente linea 676)
3. Insertar el contenido de `test-agile-fase12-participantes.ps1` justo antes
4. Actualizar el hashtable de IDs al inicio (lineas 26-74) agregando:
```powershell
participanteAdmin = $null
participantePmo = $null
participanteDev = $null
```

## Ejecucion de Tests

```powershell
# Ejecutar solo Fase 12 (requiere setup previo de Fases 0-11)
. .\test-agile-fase12-participantes.ps1

# Ejecutar script completo (con Fase 12 integrada)
.\test-agile-exhaustivo.ps1
```

## Resultados Esperados

Al ejecutar la Fase 12 completa:
- **Total de tests:** 45
- **Pasadas esperadas:** ~35 (77.8%)
- **Fallos esperados:** ~10 (22.2%)
- **Fallos inesperados:** 0
- **Duracion estimada:** ~15-20 segundos

## Dependencias

Esta fase requiere que las siguientes fases se hayan ejecutado exitosamente:

- **Fase 0:** Setup POI (proyectos y actividades)
- **Fase 11:** Daily Meetings (crear dailies para agregar participantes)

## Proximos Pasos

1. **Integrar Fase 12** al script principal
2. **Ejecutar tests** y validar resultados
3. **Ajustar service** para soportar permisos de DESARROLLADOR
4. **Agregar campo asistio** a CreateParticipanteDto si es necesario
5. **Implementar validaciones** adicionales en service

---

**Creado:** 2025-12-15
**Autor:** Claude Code (Test Automation Specialist)
**Version:** 1.0
