# SIGP API - Quick Reference

## Base URL
```
Development: http://localhost:3010/api/v1
Production:  https://api.sigp.inei.gob.pe/api/v1
```

## Authentication

All endpoints (except login/register) require Bearer token:
```
Authorization: Bearer {accessToken}
```

---

## 🔐 AUTH ENDPOINTS (✅ Implemented)

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@inei.gob.pe",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Perez",
  "rol": "DESARROLLADOR",
  "telefono": "999888777"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@inei.gob.pe",
  "password": "password123"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```

### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer {token}
```

### Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "eyJhbGci..."
}
```

---

## 📋 PLANNING ENDPOINTS (To Implement)

### PGD
```http
GET    /api/v1/pgd                     # List all PGDs
GET    /api/v1/pgd/:id                 # Get PGD by ID
POST   /api/v1/pgd                     # Create PGD (ADMIN, PMO)
PATCH  /api/v1/pgd/:id                 # Update PGD (ADMIN, PMO)
DELETE /api/v1/pgd/:id                 # Delete PGD (ADMIN, PMO)
```

### OEI
```http
GET    /api/v1/oei                     # List all OEIs
GET    /api/v1/pgd/:pgdId/oei          # Get OEIs by PGD
GET    /api/v1/oei/:id                 # Get OEI by ID
POST   /api/v1/oei                     # Create OEI (ADMIN, PMO)
PATCH  /api/v1/oei/:id                 # Update OEI
DELETE /api/v1/oei/:id                 # Delete OEI
```

### OGD
```http
GET    /api/v1/ogd                     # List all OGDs
POST   /api/v1/ogd                     # Create OGD
GET    /api/v1/ogd/:id                 # Get OGD by ID
PATCH  /api/v1/ogd/:id                 # Update OGD
DELETE /api/v1/ogd/:id                 # Delete OGD
```

### OEGD
```http
GET    /api/v1/oegd                    # List all OEGDs
GET    /api/v1/ogd/:ogdId/oegd         # Get OEGDs by OGD
POST   /api/v1/oegd                    # Create OEGD
GET    /api/v1/oegd/:id                # Get OEGD by ID
PATCH  /api/v1/oegd/:id                # Update OEGD
DELETE /api/v1/oegd/:id                # Delete OEGD
```

### Acciones Estratégicas
```http
GET    /api/v1/acciones-estrategicas                    # List all
GET    /api/v1/oegd/:oegdId/acciones-estrategicas       # By OEGD
POST   /api/v1/acciones-estrategicas                    # Create
GET    /api/v1/acciones-estrategicas/:id                # Get by ID
PATCH  /api/v1/acciones-estrategicas/:id                # Update
DELETE /api/v1/acciones-estrategicas/:id                # Delete
```

---

## 📊 POI ENDPOINTS (To Implement)

### Proyectos
```http
GET    /api/v1/proyectos               # List projects
POST   /api/v1/proyectos               # Create (ADMIN, PMO)
GET    /api/v1/proyectos/:id           # Get project
PATCH  /api/v1/proyectos/:id           # Update (ADMIN, PMO)
DELETE /api/v1/proyectos/:id           # Delete (ADMIN, PMO)
PATCH  /api/v1/proyectos/:id/estado    # Change state
```

Query params:
```
?estado=En desarrollo
&accionEstrategicaId=1
&scrumMasterId=5
&coordinadorId=3
&anio=2024
&page=1
&limit=10
```

### Actividades
```http
GET    /api/v1/actividades             # List activities
POST   /api/v1/actividades             # Create
GET    /api/v1/actividades/:id         # Get activity
PATCH  /api/v1/actividades/:id         # Update
DELETE /api/v1/actividades/:id         # Delete
```

### Subproyectos
```http
GET    /api/v1/proyectos/:proyectoId/subproyectos       # List
POST   /api/v1/proyectos/:proyectoId/subproyectos       # Create
GET    /api/v1/subproyectos/:id                         # Get
PATCH  /api/v1/subproyectos/:id                         # Update
DELETE /api/v1/subproyectos/:id                         # Delete
```

### Documentos
```http
GET    /api/v1/proyectos/:proyectoId/documentos         # List
GET    /api/v1/subproyectos/:subproyectoId/documentos   # List
POST   /api/v1/documentos                                # Upload
GET    /api/v1/documentos/:id                            # Get
GET    /api/v1/documentos/:id/descargar                  # Download
PATCH  /api/v1/documentos/:id/aprobar                    # Approve (PMO)
```

### Actas
```http
GET    /api/v1/proyectos/:proyectoId/actas              # List
POST   /api/v1/actas/reunion                             # Create meeting act
POST   /api/v1/actas/constitucion                        # Create constitution act
GET    /api/v1/actas/:id                                 # Get
PATCH  /api/v1/actas/:id/aprobar                         # Approve
```

### Requerimientos
```http
GET    /api/v1/proyectos/:proyectoId/requerimientos     # List
POST   /api/v1/requerimientos                            # Create
GET    /api/v1/requerimientos/:id                        # Get
PATCH  /api/v1/requerimientos/:id                        # Update
DELETE /api/v1/requerimientos/:id                        # Delete
```

### Cronogramas
```http
GET    /api/v1/proyectos/:proyectoId/cronogramas        # List
POST   /api/v1/cronogramas                               # Create
GET    /api/v1/cronogramas/:id                           # Get
PATCH  /api/v1/cronogramas/:id                           # Update
DELETE /api/v1/cronogramas/:id                           # Delete
GET    /api/v1/cronogramas/:id/exportar?formato=xlsx    # Export
```

### Informes de Sprint
```http
GET    /api/v1/proyectos/:proyectoId/informes-sprint    # List
GET    /api/v1/sprints/:sprintId/informe                # Get by sprint
POST   /api/v1/sprints/:sprintId/generar-informe        # Generate (auto)
PATCH  /api/v1/informes-sprint/:id/enviar               # Send (SM)
PATCH  /api/v1/informes-sprint/:id/aprobar-coordinador  # Approve (Coord)
PATCH  /api/v1/informes-sprint/:id/aprobar-pmo          # Approve (PMO)
```

### Informes de Actividad
```http
GET    /api/v1/actividades/:actividadId/informes        # List
POST   /api/v1/informes-actividad                       # Create
GET    /api/v1/informes-actividad/:id                   # Get
PATCH  /api/v1/informes-actividad/:id                   # Update
PATCH  /api/v1/informes-actividad/:id/aprobar           # Approve (PMO)
DELETE /api/v1/informes-actividad/:id                   # Delete
```

---

## 🏃 AGILE ENDPOINTS (To Implement)

### Épicas
```http
GET    /api/v1/proyectos/:proyectoId/epicas             # List
POST   /api/v1/epicas                                    # Create
GET    /api/v1/epicas/:id                                # Get
GET    /api/v1/epicas/:id/estadisticas                   # Get stats
PATCH  /api/v1/epicas/:id                                # Update
DELETE /api/v1/epicas/:id                                # Delete
```

### Sprints
```http
GET    /api/v1/proyectos/:proyectoId/sprints            # List
POST   /api/v1/sprints                                   # Create
GET    /api/v1/sprints/:id                               # Get
PATCH  /api/v1/sprints/:id                               # Update
PATCH  /api/v1/sprints/:id/iniciar                       # Start sprint
PATCH  /api/v1/sprints/:id/cerrar                        # Close sprint
GET    /api/v1/sprints/:id/burndown                      # Burndown chart
GET    /api/v1/sprints/:id/metricas                      # Metrics
DELETE /api/v1/sprints/:id                               # Delete
```

### Historias de Usuario
```http
GET    /api/v1/proyectos/:proyectoId/historias-usuario  # List
GET    /api/v1/sprints/:sprintId/historias-usuario      # By sprint
GET    /api/v1/epicas/:epicaId/historias-usuario        # By epic
POST   /api/v1/historias-usuario                         # Create
GET    /api/v1/historias-usuario/:id                     # Get
PATCH  /api/v1/historias-usuario/:id                     # Update
PATCH  /api/v1/historias-usuario/:id/estado              # Change state
PATCH  /api/v1/historias-usuario/:id/mover-sprint        # Move to sprint
PATCH  /api/v1/historias-usuario/:id/asignar             # Assign to user
POST   /api/v1/historias-usuario/:id/vincular-requerimiento  # Link requirement
POST   /api/v1/historias-usuario/:id/dependencias        # Add dependency
DELETE /api/v1/historias-usuario/:id                     # Delete
```

Query params:
```
?estado=En desarrollo
&prioridad=Must
&asignadoA=5
&enBacklog=true
```

### Tareas
```http
GET    /api/v1/historias-usuario/:huId/tareas           # List (SCRUM)
GET    /api/v1/actividades/:actividadId/tareas          # List (KANBAN)
POST   /api/v1/tareas                                    # Create
GET    /api/v1/tareas/:id                                # Get
PATCH  /api/v1/tareas/:id                                # Update
PATCH  /api/v1/tareas/:id/estado                         # Change state
PATCH  /api/v1/tareas/:id/validar                        # Validate (SM/Coord)
PATCH  /api/v1/tareas/:id/mover                          # Move (board)
DELETE /api/v1/tareas/:id                                # Delete
```

### Subtareas (Kanban only)
```http
GET    /api/v1/tareas/:tareaId/subtareas                # List
POST   /api/v1/subtareas                                 # Create
GET    /api/v1/subtareas/:id                             # Get
PATCH  /api/v1/subtareas/:id                             # Update
DELETE /api/v1/subtareas/:id                             # Delete
```

### Tablero
```http
GET    /api/v1/sprints/:sprintId/tablero                # Scrum board
GET    /api/v1/actividades/:actividadId/tablero         # Kanban board
```

### Backlog
```http
GET    /api/v1/proyectos/:proyectoId/backlog            # Get backlog
PATCH  /api/v1/proyectos/:proyectoId/backlog/reordenar  # Reorder
```

### Daily Meetings
```http
GET    /api/v1/proyectos/:proyectoId/daily-meetings     # List
GET    /api/v1/sprints/:sprintId/daily-meetings         # By sprint
POST   /api/v1/daily-meetings                            # Create
GET    /api/v1/daily-meetings/:id                        # Get
PATCH  /api/v1/daily-meetings/:id                        # Update
DELETE /api/v1/daily-meetings/:id                        # Delete
```

---

## 👥 RRHH ENDPOINTS (To Implement)

### Personal
```http
GET    /api/v1/personal                                  # List
POST   /api/v1/personal                                  # Create
GET    /api/v1/personal/:id                              # Get
GET    /api/v1/personal/:id/disponibilidad               # Availability
PATCH  /api/v1/personal/:id                              # Update
DELETE /api/v1/personal/:id                              # Delete
```

Query params:
```
?divisionId=1
&disponible=true
&habilidad=TypeScript
&busqueda=Juan
```

### Divisiones
```http
GET    /api/v1/divisiones                                # List
POST   /api/v1/divisiones                                # Create
GET    /api/v1/divisiones/:id                            # Get
PATCH  /api/v1/divisiones/:id                            # Update
DELETE /api/v1/divisiones/:id                            # Delete
```

### Habilidades
```http
GET    /api/v1/habilidades                               # List
POST   /api/v1/habilidades                               # Create
GET    /api/v1/habilidades/:id                           # Get
POST   /api/v1/personal/:id/habilidades                  # Assign to personnel
PATCH  /api/v1/habilidades/:id                           # Update
DELETE /api/v1/habilidades/:id                           # Delete
```

### Asignaciones
```http
GET    /api/v1/asignaciones                              # List
POST   /api/v1/asignaciones                              # Create
PATCH  /api/v1/asignaciones/:id                          # Update
DELETE /api/v1/asignaciones/:id                          # Delete
```

---

## 🔔 NOTIFICACIONES ENDPOINTS (To Implement)

### Notificaciones
```http
GET    /api/v1/notificaciones                            # List
GET    /api/v1/notificaciones/conteo                     # Count unread
PATCH  /api/v1/notificaciones/:id/leer                   # Mark as read
PATCH  /api/v1/notificaciones/leer-todas                 # Mark all as read
```

Query params:
```
?leida=false
&tipo=Aprobaciones
```

### Preferencias
```http
GET    /api/v1/notificaciones/preferencias               # Get preferences
PUT    /api/v1/notificaciones/preferencias               # Update preferences
```

---

## 📊 DASHBOARD ENDPOINTS (To Implement)

### General Dashboard
```http
GET    /api/v1/dashboard                                 # General metrics
```

Response:
```json
{
  "proyectos": {
    "total": 15,
    "enCurso": 8,
    "atrasados": 2,
    "completados": 5,
    "porSalud": { "verde": 10, "amarillo": 3, "rojo": 2 }
  },
  "sprints": {
    "activos": 5,
    "velocidadPromedio": 18.5
  },
  "tareas": {
    "completadasHoy": 12,
    "enProgreso": 45,
    "bloqueadas": 3
  }
}
```

### Project Dashboard
```http
GET    /api/v1/dashboard/proyecto/:id                    # Project specific
```

### OEI Progress
```http
GET    /api/v1/dashboard/avance-oei                      # OEI progress
```

---

## 📦 STORAGE ENDPOINTS (✅ Implemented)

```http
POST   /api/v1/storage/upload                            # Upload file
GET    /api/v1/storage/:key                              # Get file
DELETE /api/v1/storage/:key                              # Delete file
```

---

## 📝 Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "timestamp": "2025-12-13T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos invalidos",
    "details": [
      {
        "field": "nombre",
        "message": "El nombre es requerido"
      }
    ]
  },
  "timestamp": "2025-12-13T10:30:00Z"
}
```

---

## 🔑 Common Query Parameters

### Pagination
```
?page=1&limit=10&sortBy=created_at&sortOrder=DESC
```

### Filtering (entity-specific)
```
?estado=Activo
&tipo=Proyecto
&busqueda=keyword
&fechaDesde=2024-01-01
&fechaHasta=2024-12-31
```

---

## 📊 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful delete |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 422 | Unprocessable - Business rule violation |
| 500 | Internal Server Error |

---

## 🔐 Role-Based Access Examples

```http
# ADMIN & PMO only
POST /api/v1/proyectos
Roles: ADMIN, PMO

# All authenticated users
GET /api/v1/proyectos
Roles: (all)

# Specific role
PATCH /api/v1/sprints/:id/cerrar
Roles: ADMIN, PMO, SCRUM_MASTER

# Approval endpoints
PATCH /api/v1/actas/:id/aprobar
Roles: ADMIN, PMO, PATROCINADOR
```

---

## 🚀 Quick Testing with cURL

### Login
```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@inei.gob.pe","password":"password123"}'
```

### Get Protected Resource
```bash
curl http://localhost:3010/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Resource
```bash
curl -X POST http://localhost:3010/api/v1/proyectos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PROY-001",
    "nombre": "Nuevo Proyecto",
    "accionEstrategicaId": 1
  }'
```

---

## 📖 See Also

- **Swagger UI:** http://localhost:3010/api/docs (interactive documentation)
- **Full API Spec:** `05_ESPECIFICACION_APIs.md`
- **Database Schema:** `04_ARQUITECTURA_BD.md`

---

**Last Updated:** December 2025
**Version:** 1.0.0
