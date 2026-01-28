# Credenciales de Usuarios de Prueba - SIGP

**Generado:** 15 de Diciembre, 2025
**Última actualización:** 15 de Diciembre, 2025 - Todos los usuarios reseteados
**Contraseña para todos los usuarios:** `Password123!`

> ✅ **Todos los 7 usuarios han sido validados y están operativos**
> - Contraseña unificada: `Password123!`
> - Intentos fallidos: 0
> - Bloqueos: Ninguno
> - Estado: Activos
> - Login: ✓ Probado y funcionando
> - Permisos: ✓ Validados (ADMIN bypass automático, PMO con permisos específicos)

---

## Usuarios Principales para Pruebas (7 Roles)

### 1. ADMIN - Administrador del Sistema
- **Email:** `admin@inei.gob.pe`
- **Username:** `cadmin`
- **Nombre:** Carlos Administrador
- **Teléfono:** 987654321
- **Permisos:** Acceso total al sistema

### 2. PMO - Project Management Office
- **Email:** `pmo@inei.gob.pe`
- **Username:** `mpmo`
- **Nombre:** María PMO
- **Teléfono:** 987654322
- **Permisos:** Gestión de proyectos y portafolio

### 3. COORDINADOR - Coordinador de Proyectos
- **Email:** `coordinador@inei.gob.pe`
- **Username:** `lcoordinador`
- **Nombre:** Luis Coordinador
- **Teléfono:** 987654323
- **Permisos:** Coordinación de actividades

### 4. SCRUM_MASTER - Facilitador Ágil
- **Email:** `scrummaster@inei.gob.pe`
- **Username:** `ascrum`
- **Nombre:** Ana Scrum
- **Teléfono:** 987654324
- **Permisos:** Gestión de sprints y dailies

### 5. PATROCINADOR - Sponsor del Proyecto
- **Email:** `patrocinador@inei.gob.pe`
- **Username:** `jpatrocinador`
- **Nombre:** Jorge Patrocinador
- **Teléfono:** 987654325
- **Permisos:** Aprobaciones y visibilidad ejecutiva

### 6. DESARROLLADOR - Miembro del Equipo
- **Email:** `desarrollador@inei.gob.pe`
- **Username:** `pdesarrollador`
- **Nombre:** Pedro Desarrollador
- **Teléfono:** 987654326
- **Permisos:** Ejecución de tareas y subtareas

### 7. IMPLEMENTADOR - Implementador de Soluciones
- **Email:** `implementador@inei.gob.pe`
- **Username:** `limplementador`
- **Nombre:** Laura Implementadora
- **Teléfono:** 987654327
- **Permisos:** Implementación y despliegue

---

## Cómo Usar las Credenciales

### Login vía API

```bash
# Ejemplo: Login con ADMIN
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inei.gob.pe",
    "password": "Password123!"
  }'
```

### Login vía PowerShell

```powershell
# Ejemplo: Login con SCRUM_MASTER
$loginBody = @{
    email = "scrummaster@inei.gob.pe"
    password = "Password123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = $response.accessToken
```

---

## Jerarquía de Roles

| Rol | Nivel | Descripción |
|-----|-------|-------------|
| **ADMIN** | 100 | Acceso completo al sistema |
| **PMO** | 90 | Gestión de portafolio de proyectos |
| **COORDINADOR** | 80 | Coordinación de actividades |
| **SCRUM_MASTER** | 70 | Facilitación de metodologías ágiles |
| **PATROCINADOR** | 60 | Sponsor y aprobaciones |
| **DESARROLLADOR** | 50 | Ejecución de tareas |
| **IMPLEMENTADOR** | 50 | Implementación técnica |

---

## Escenarios de Prueba Recomendados

### Prueba de Autenticación
- Login con cada rol
- Validar token JWT generado
- Verificar información del usuario en response

### Prueba de Permisos
- Crear un Sprint con ADMIN → ✓ Permitido
- Crear un Sprint con DESARROLLADOR → ✗ Denegado (403)
- Listar Sprints con cualquier rol → ✓ Permitido

### Prueba de Scrum/Kanban
1. **ADMIN** crea un Proyecto y Épica
2. **SCRUM_MASTER** crea un Sprint
3. **SCRUM_MASTER** crea Historias de Usuario
4. **DESARROLLADOR** crea Tareas
5. **DESARROLLADOR** actualiza estado de Tareas

### Prueba de Daily Meetings
1. **SCRUM_MASTER** crea Daily Meeting
2. **SCRUM_MASTER** agrega participantes (Ana, Pedro, Laura)
3. **DESARROLLADOR** reporta progreso en Daily

---

## Resetear Contraseñas y Desbloquear Usuarios

Si algún usuario tiene contraseña diferente o está bloqueado:

### Método Recomendado (SQL)
```bash
# Ejecuta el script SQL que actualiza los 7 usuarios principales
powershell -Command "Get-Content update-passwords.sql | docker-compose exec -T postgres psql -U postgres -d sigp_inei"
```

### Métodos Alternativos
```bash
# Script PowerShell para resetear todos los usuarios
.\reset-usuarios.ps1

# Script PowerShell solo para admin (legacy)
.\reset-admin.ps1
```

Estos scripts:
- Actualizan contraseña de los 7 usuarios a `Password123!`
- Resetean intentos fallidos a 0
- Eliminan bloqueos de todos los usuarios
- Activan todos los usuarios

## Validar Permisos de Usuarios

### Validar ADMIN
```bash
.\test-admin-permisos.ps1
```
Verifica que ADMIN tiene bypass automático a todos los endpoints.

### Validar PMO
```bash
.\test-pmo-permisos.ps1
```
Verifica que PMO tiene los permisos correctos y compara con DESARROLLADOR.

### Validar API General
```bash
.\test-api.ps1
```
Verifica que la API está respondiendo correctamente.

## Volver a Generar Usuarios

Si necesitas recrear estos usuarios, ejecuta:

```bash
# Método 1: Script PowerShell (Recomendado)
.\create-test-users.ps1

# Método 2: Script de Seed (Más complejo)
npm run seed:run
```

---

## Información Adicional

### IDs en Base de Datos
Los usuarios fueron creados con los siguientes IDs:
- ID 1-2: ADMIN (usuarios de prueba previos)
- ID 16: COORDINADOR (Luis Coordinador)
- ID 17: SCRUM_MASTER (Ana Scrum)
- ID 18: PATROCINADOR (Jorge Patrocinador)
- ID 19: DESARROLLADOR (Pedro Desarrollador)
- ID 20: IMPLEMENTADOR (Laura Implementadora)

### Estado de los Usuarios
- Todos los usuarios están **activos** (`activo = true`)
- Sin intentos fallidos de login
- Sin bloqueos

### Tokens JWT
- **Access Token:** Expira en 24 horas
- **Refresh Token:** Expira en 7 días
- Los tokens se generan al hacer login

---

## Seguridad

⚠️ **IMPORTANTE:**
- Estos usuarios son **SOLO PARA AMBIENTE DE DESARROLLO**
- **NO USAR** en producción
- La contraseña `Password123!` es débil por diseño (facilita testing)
- En producción, usar contraseñas fuertes y únicas

---

**Última actualización:** 15 de Diciembre, 2025
**Usuarios creados:** 7 (todos los roles del sistema)
**Script de creación:** `create-test-users.ps1`
