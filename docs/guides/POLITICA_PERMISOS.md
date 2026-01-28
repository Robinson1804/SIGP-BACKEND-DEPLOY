# Política de Permisos - SIGP

**Fecha:** 15 de Diciembre, 2025
**Versión:** 1.0

---

## Resumen Ejecutivo

El sistema SIGP implementa un sistema de control de acceso basado en roles (RBAC) con una **política especial para el rol ADMIN**: el administrador tiene acceso completo a todos los endpoints del sistema, sin excepciones.

---

## Jerarquía de Roles

| Rol | Nivel | Descripción |
|-----|-------|-------------|
| **ADMIN** | 100 | **Acceso total al sistema** (bypass automático) |
| **PMO** | 90 | Gestión de portafolio de proyectos |
| **COORDINADOR** | 80 | Coordinación de actividades y proyectos |
| **SCRUM_MASTER** | 70 | Facilitación de metodologías ágiles |
| **PATROCINADOR** | 60 | Sponsor y aprobaciones ejecutivas |
| **DESARROLLADOR** | 50 | Ejecución de tareas y desarrollo |
| **IMPLEMENTADOR** | 50 | Implementación técnica |

---

## Política de Acceso del ADMIN

### Regla Principal

> ✅ **El rol ADMIN tiene acceso a TODOS los endpoints del sistema, sin importar qué roles se especifiquen en el decorador `@Roles()`.**

### Implementación Técnica

**Archivo:** `src/common/guards/roles.guard.ts`

```typescript
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!requiredRoles) {
    return true;
  }

  const { user } = context.switchToHttp().getRequest();

  if (!user) {
    throw new ForbiddenException('User not authenticated');
  }

  // ADMIN always has access to everything
  if (user.rol === Role.ADMIN) {
    return true;  // ✅ BYPASS AUTOMÁTICO
  }

  const hasRole = requiredRoles.some((role) => user.rol === role);

  if (!hasRole) {
    throw new ForbiddenException('Insufficient permissions for this operation');
  }

  return true;
}
```

**Líneas clave:** 26-29

### Beneficios

1. **Simplicidad:** No es necesario agregar `Role.ADMIN` a cada decorador `@Roles()`
2. **Mantenibilidad:** Política centralizada y fácil de auditar
3. **Seguridad:** Garantiza que el administrador siempre pueda acceder para solucionar problemas
4. **Consistencia:** Comportamiento predecible en todo el sistema

---

## Niveles de Acceso por Operación

### Operaciones de Lectura (GET)

La mayoría de endpoints GET **NO requieren roles específicos**, solo autenticación:

```typescript
@Get()
findAll() {  // Cualquier usuario autenticado puede listar
  return this.service.findAll();
}
```

**Usuarios permitidos:** Todos los roles autenticados

### Operaciones de Creación (POST)

Requieren roles de gestión:

```typescript
@Post()
@Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

**Usuarios permitidos:**
- ✅ ADMIN (siempre)
- ✅ PMO
- ✅ COORDINADOR
- ✅ SCRUM_MASTER
- ❌ PATROCINADOR
- ❌ DESARROLLADOR
- ❌ IMPLEMENTADOR

### Operaciones de Actualización (PATCH/PUT)

Pueden permitir más roles dependiendo del contexto:

```typescript
@Patch(':id')
@Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
update(@Param('id') id: number, @Body() dto: UpdateDto) {
  return this.service.update(id, dto);
}
```

**Usuarios permitidos:**
- ✅ ADMIN (siempre)
- ✅ PMO
- ✅ COORDINADOR
- ✅ SCRUM_MASTER
- ✅ DESARROLLADOR (para sus propias tareas)
- ❌ PATROCINADOR
- ❌ IMPLEMENTADOR

### Operaciones de Eliminación (DELETE)

Requieren roles de alto nivel:

```typescript
@Delete(':id')
@Roles(Role.ADMIN, Role.PMO)
remove(@Param('id') id: number) {
  return this.service.remove(id);
}
```

**Usuarios permitidos:**
- ✅ ADMIN (siempre)
- ✅ PMO
- ❌ Otros roles

---

## Matriz de Permisos por Módulo

### Módulo Agile

| Operación | ADMIN | PMO | COORD | SCRUM | PATRON | DEV | IMPL |
|-----------|-------|-----|-------|-------|--------|-----|------|
| Ver Sprints | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear Sprint | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Actualizar Sprint | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar Sprint | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver Tareas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear Tarea | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Actualizar Tarea | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Daily Meetings | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

### Módulo POI (Proyectos)

| Operación | ADMIN | PMO | COORD | SCRUM | PATRON | DEV | IMPL |
|-----------|-------|-----|-------|-------|--------|-----|------|
| Ver Proyectos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear Proyecto | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Actualizar Proyecto | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Eliminar Proyecto | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Módulo Planning (Planificación Estratégica)

| Operación | ADMIN | PMO | COORD | SCRUM | PATRON | DEV | IMPL |
|-----------|-------|-----|-------|-------|--------|-----|------|
| Ver PGD/OEI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear PGD/OEI | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Actualizar PGD/OEI | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Eliminar PGD/OEI | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Casos de Uso

### Caso 1: ADMIN puede acceder a todo

**Escenario:** El administrador necesita corregir un error en una tarea creada por un SCRUM_MASTER.

**Acción:**
```bash
PATCH /api/v1/tareas/123
Authorization: Bearer <admin-token>
```

**Resultado:** ✅ Permitido (aunque el endpoint requiera SCRUM_MASTER)

### Caso 2: DESARROLLADOR no puede crear Sprints

**Escenario:** Un desarrollador intenta crear un nuevo sprint.

**Acción:**
```bash
POST /api/v1/sprints
Authorization: Bearer <dev-token>
```

**Resultado:** ❌ 403 Forbidden

### Caso 3: Todos pueden ver (lectura)

**Escenario:** Cualquier usuario autenticado quiere ver la lista de tareas.

**Acción:**
```bash
GET /api/v1/tareas
Authorization: Bearer <any-token>
```

**Resultado:** ✅ Permitido para todos

---

## Verificación de Permisos

### Script de Prueba

Ejecutar el script de verificación:

```bash
.\test-admin-permisos.ps1
```

Este script:
1. Autentica como ADMIN
2. Autentica como DESARROLLADOR
3. Prueba acceso a endpoints protegidos
4. Verifica que ADMIN puede acceder a todo
5. Verifica que otros roles son bloqueados según corresponda

### Resultado Esperado

```
[OK] ADMIN puede acceder a todos los endpoints
[OK] DESARROLLADOR es bloqueado en endpoints restringidos
```

---

## Mejores Prácticas

### Para Desarrolladores

1. **Siempre usar `@UseGuards(JwtAuthGuard, RolesGuard)`** en controladores protegidos
2. **Especificar roles explícitamente** con `@Roles()` (excepto para endpoints públicos de lectura)
3. **NO agregar `Role.ADMIN` a los decoradores** - el bypass es automático
4. **Documentar en Swagger** los roles requeridos para cada endpoint

### Ejemplo de Implementación Correcta

```typescript
@Controller('sprints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintController {

  // Lectura: Cualquier usuario autenticado
  @Get()
  findAll() {
    return this.sprintService.findAll();
  }

  // Creación: Solo roles de gestión
  @Post()
  @Roles(Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  // NO es necesario agregar Role.ADMIN - tiene acceso automático
  create(@Body() dto: CreateSprintDto) {
    return this.sprintService.create(dto);
  }

  // Eliminación: Solo alto nivel
  @Delete(':id')
  @Roles(Role.PMO)
  // ADMIN puede eliminar aunque no esté en la lista
  remove(@Param('id') id: number) {
    return this.sprintService.remove(id);
  }
}
```

---

## Auditoría y Seguridad

### Logs de Acceso

El sistema registra automáticamente:
- Usuario que hace la petición
- Rol del usuario
- Endpoint accedido
- Resultado (permitido/denegado)

### Monitoreo de ADMIN

Se recomienda:
1. Revisar regularmente los accesos del ADMIN
2. Usar cuentas ADMIN solo cuando sea necesario
3. Implementar MFA para cuentas ADMIN (futuro)
4. Rotar contraseñas regularmente

---

## Preguntas Frecuentes

**P: ¿Por qué ADMIN tiene acceso a todo?**
R: Para garantizar que siempre haya una forma de solucionar problemas y mantener el sistema, independientemente de las configuraciones de permisos.

**P: ¿Puedo restringir el acceso de ADMIN?**
R: No con la configuración actual. Si necesitas restringir ADMIN, debes modificar `roles.guard.ts` línea 26-29.

**P: ¿Debo agregar Role.ADMIN a cada @Roles()?**
R: No. El bypass es automático. Agregar ADMIN es redundante pero no causa problemas.

**P: ¿Cómo sé qué roles puede usar un endpoint?**
R: Revisa la documentación Swagger en `/api/docs` o el código del controlador.

**P: ¿Un DESARROLLADOR puede ver todo pero no modificar?**
R: Correcto. La mayoría de endpoints GET no tienen restricción de roles, solo requieren autenticación.

---

## Referencias

- **Archivo de implementación:** `src/common/guards/roles.guard.ts`
- **Constantes de roles:** `src/common/constants/roles.constant.ts`
- **Decorador de roles:** `src/common/decorators/roles.decorator.ts`
- **Script de prueba:** `test-admin-permisos.ps1`

---

**Última actualización:** 15 de Diciembre, 2025
**Mantenido por:** Equipo SIGP
