# ESPECIFICACION DE APIs - SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Especificacion de APIs REST
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## TABLA DE CONTENIDOS

1. [Convenciones Generales](#1-convenciones-generales)
2. [Autenticacion](#2-autenticacion)
3. [API de Planning (PGD)](#3-api-de-planning-pgd)
4. [API de POI](#4-api-de-poi)
5. [API de Agile](#5-api-de-agile)
6. [API de RRHH](#6-api-de-rrhh)
7. [API de Notificaciones](#7-api-de-notificaciones)
8. [API de Dashboard](#8-api-de-dashboard)
9. [WebSocket Events](#9-websocket-events)
10. [Codigos de Error](#10-codigos-de-error)

---

## 1. CONVENCIONES GENERALES

### 1.1. Base URL

```
Desarrollo: http://localhost:3010/api/v1
Produccion: https://api.sigp.inei.gob.pe/api/v1
```

### 1.2. Formato de Respuesta Exitosa

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

### 1.3. Formato de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos invalidos",
    "details": [
      { "field": "nombre", "message": "El nombre es requerido" }
    ]
  },
  "timestamp": "2025-12-13T10:30:00Z"
}
```

### 1.4. Headers Requeridos

| Header | Valor | Descripcion |
|--------|-------|-------------|
| `Content-Type` | `application/json` | Tipo de contenido |
| `Authorization` | `Bearer {token}` | Token JWT |
| `Accept-Language` | `es` | Idioma (opcional) |

### 1.5. Paginacion

```
GET /api/v1/recursos?page=1&limit=10&sortBy=created_at&sortOrder=DESC
```

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | 1 | Numero de pagina |
| `limit` | number | 10 | Items por pagina (max 100) |
| `sortBy` | string | created_at | Campo para ordenar |
| `sortOrder` | string | DESC | ASC o DESC |

---

## 2. AUTENTICACION

### 2.1. Login

```
POST /api/v1/auth/login
```

**Request:**
```json
{
  "email": "usuario@inei.gob.pe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "email": "usuario@inei.gob.pe",
      "nombre": "Juan",
      "apellido": "Perez",
      "rol": "SCRUM_MASTER",
      "avatarUrl": null
    }
  }
}
```

### 2.2. Refresh Token

```
POST /api/v1/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

### 2.3. Logout

```
POST /api/v1/auth/logout
```

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Sesion cerrada correctamente"
  }
}
```

### 2.4. Perfil del Usuario

```
GET /api/v1/auth/profile
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@inei.gob.pe",
    "nombre": "Juan",
    "apellido": "Perez",
    "rol": "SCRUM_MASTER",
    "avatarUrl": null,
    "telefono": "999888777",
    "ultimoAcceso": "2025-12-13T09:00:00Z"
  }
}
```

### 2.5. Cambiar Password

```
PUT /api/v1/auth/change-password
```

**Request:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

---

## 3. API DE PLANNING (PGD)

### 3.1. PGD

#### Listar PGDs
```
GET /api/v1/pgd
```
**Roles:** `ADMIN`, `PMO`

**Query params:** `?estado=Activo&anio=2024`

#### Obtener PGD
```
GET /api/v1/pgd/:id
```

#### Crear PGD
```
POST /api/v1/pgd
```
**Roles:** `ADMIN`, `PMO`

**Request:**
```json
{
  "nombre": "Plan de Gobierno Digital 2024-2027",
  "descripcion": "Plan estrategico de transformacion digital",
  "anioInicio": 2024,
  "anioFin": 2027
}
```

#### Actualizar PGD
```
PATCH /api/v1/pgd/:id
```

#### Eliminar PGD
```
DELETE /api/v1/pgd/:id
```

### 3.2. OEI

#### Listar OEIs
```
GET /api/v1/oei
GET /api/v1/pgd/:pgdId/oei
```

#### CRUD OEI
```
POST   /api/v1/oei
GET    /api/v1/oei/:id
PATCH  /api/v1/oei/:id
DELETE /api/v1/oei/:id
```

**Request (POST):**
```json
{
  "pgdId": 1,
  "codigo": "OEI-01",
  "nombre": "Transformacion Digital Institucional",
  "descripcion": "Objetivo estrategico...",
  "indicador": "Porcentaje de servicios digitalizados",
  "metasAnuales": [
    { "anio": 2024, "meta": 25 },
    { "anio": 2025, "meta": 50 },
    { "anio": 2026, "meta": 75 },
    { "anio": 2027, "meta": 100 }
  ]
}
```

### 3.3. OGD

#### CRUD OGD
```
GET    /api/v1/ogd
POST   /api/v1/ogd
GET    /api/v1/ogd/:id
PATCH  /api/v1/ogd/:id
DELETE /api/v1/ogd/:id
```

### 3.4. OEGD

#### CRUD OEGD
```
GET    /api/v1/oegd
GET    /api/v1/ogd/:ogdId/oegd
POST   /api/v1/oegd
GET    /api/v1/oegd/:id
PATCH  /api/v1/oegd/:id
DELETE /api/v1/oegd/:id
```

### 3.5. Acciones Estrategicas

#### CRUD AE
```
GET    /api/v1/acciones-estrategicas
GET    /api/v1/oegd/:oegdId/acciones-estrategicas
POST   /api/v1/acciones-estrategicas
GET    /api/v1/acciones-estrategicas/:id
PATCH  /api/v1/acciones-estrategicas/:id
DELETE /api/v1/acciones-estrategicas/:id
```

---

## 4. API DE POI

### 4.1. Proyectos

#### Listar Proyectos
```
GET /api/v1/proyectos
```
**Roles:** Todos (filtrado por permisos)

**Query params:**
```
?estado=En desarrollo
&accionEstrategicaId=1
&scrumMasterId=5
&coordinadorId=3
&anio=2024
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "PROY-001",
      "nombre": "Sistema de Gestion Documental",
      "descripcion": "...",
      "estado": "En desarrollo",
      "scrumMaster": {
        "id": 5,
        "nombreCompleto": "Juan Perez"
      },
      "accionEstrategica": {
        "id": 1,
        "codigo": "AE-01",
        "nombre": "Modernizar servicios"
      },
      "fechaInicio": "2024-01-15",
      "fechaFin": "2024-12-31",
      "avance": 45.5,
      "totalHUs": 20,
      "husCompletadas": 9
    }
  ],
  "meta": { "total": 15, "page": 1, "limit": 10, "totalPages": 2 }
}
```

#### Obtener Proyecto
```
GET /api/v1/proyectos/:id
```

**Response incluye:** Detalles completos, equipo, metricas

#### Crear Proyecto
```
POST /api/v1/proyectos
```
**Roles:** `ADMIN`, `PMO`

**Request:**
```json
{
  "codigo": "PROY-002",
  "nombre": "Sistema de Inventarios",
  "descripcion": "Sistema para gestion de inventarios",
  "clasificacion": "Gestion interna",
  "accionEstrategicaId": 1,
  "coordinadorId": 3,
  "scrumMasterId": 5,
  "patrocinadorId": 2,
  "coordinacion": "Direccion de TI",
  "areasFinancieras": ["Presupuesto", "Tesoreria"],
  "montoAnual": 150000.00,
  "anios": [2024, 2025],
  "fechaInicio": "2024-02-01",
  "fechaFin": "2025-06-30"
}
```

#### Actualizar Proyecto
```
PATCH /api/v1/proyectos/:id
```
**Roles:** `ADMIN`, `PMO`

#### Eliminar Proyecto
```
DELETE /api/v1/proyectos/:id
```
**Roles:** `ADMIN`, `PMO`

#### Cambiar Estado Proyecto
```
PATCH /api/v1/proyectos/:id/estado
```
**Roles:** `ADMIN`, `PMO`

**Request:**
```json
{
  "estado": "En desarrollo"
}
```

### 4.2. Actividades

#### CRUD Actividades
```
GET    /api/v1/actividades
POST   /api/v1/actividades
GET    /api/v1/actividades/:id
PATCH  /api/v1/actividades/:id
DELETE /api/v1/actividades/:id
```

**Request (POST):**
```json
{
  "codigo": "ACT-001",
  "nombre": "Soporte de Servidores",
  "descripcion": "Mantenimiento de infraestructura",
  "clasificacion": "Gestion interna",
  "accionEstrategicaId": 2,
  "coordinadorId": 3,
  "periodicidadInforme": "MENSUAL",
  "fechaInicio": "2024-01-01",
  "fechaFin": null
}
```

### 4.3. Subproyectos

```
GET    /api/v1/proyectos/:proyectoId/subproyectos
POST   /api/v1/proyectos/:proyectoId/subproyectos
GET    /api/v1/subproyectos/:id
PATCH  /api/v1/subproyectos/:id
DELETE /api/v1/subproyectos/:id
```

### 4.4. Documentos

#### Listar Documentos
```
GET /api/v1/proyectos/:proyectoId/documentos
GET /api/v1/subproyectos/:subproyectoId/documentos
```

**Query params:** `?fase=Disenio&estado=Pendiente`

#### Crear Documento
```
POST /api/v1/documentos
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`, `COORDINADOR`

**Request (multipart/form-data):**
```
tipoContenedor: "PROYECTO"
proyectoId: 1
fase: "Analisis y Planificacion"
nombre: "Arquitectura del Sistema"
descripcion: "Documento de arquitectura tecnica"
esObligatorio: true
archivo: [File]
```

#### Aprobar/Rechazar Documento
```
PATCH /api/v1/documentos/:id/aprobar
```
**Roles:** `ADMIN`, `PMO`

**Request:**
```json
{
  "estado": "Aprobado",
  "observacion": "Documento aprobado sin observaciones"
}
```

#### Descargar Documento
```
GET /api/v1/documentos/:id/descargar
```

### 4.5. Actas

#### Listar Actas
```
GET /api/v1/proyectos/:proyectoId/actas
```

#### Crear Acta de Reunion
```
POST /api/v1/actas/reunion
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`, `COORDINADOR`

**Request:**
```json
{
  "proyectoId": 1,
  "nombre": "Reunion de Kickoff",
  "tipoReunion": "Reunion inicial",
  "fasePerteneciente": "Inicio",
  "fecha": "2024-02-01",
  "horaInicio": "09:00",
  "horaFin": "11:00",
  "asistentes": [
    { "nombre": "Juan Perez", "cargo": "SM", "firma": true },
    { "nombre": "Maria Garcia", "cargo": "Dev", "firma": true }
  ],
  "ausentes": [],
  "agenda": [
    { "item": 1, "tema": "Presentacion del proyecto" },
    { "item": 2, "tema": "Definicion de alcance" }
  ],
  "temasDesarrollados": [
    { "tema": "Se presento el proyecto...", "responsable": "Juan Perez" }
  ],
  "acuerdos": [
    { "acuerdo": "Iniciar en 2 semanas", "responsable": "Equipo", "fecha": "2024-02-15" }
  ],
  "proximosPasos": [
    { "paso": "Crear backlog inicial", "responsable": "SM", "fecha": "2024-02-08" }
  ],
  "observaciones": "Reunion productiva"
}
```

#### Crear Acta de Constitucion
```
POST /api/v1/actas/constitucion
```

**Request:**
```json
{
  "proyectoId": 1,
  "nombre": "Acta de Constitucion - SGD",
  "fecha": "2024-02-01",
  "objetivoSmart": "Desarrollar un sistema de gestion documental...",
  "alcance": "El sistema incluira...",
  "fueraDeAlcance": "No incluye...",
  "entregables": [
    { "nombre": "Aplicacion Web", "descripcion": "..." },
    { "nombre": "API REST", "descripcion": "..." }
  ],
  "riesgos": [
    { "riesgo": "Cambio de requerimientos", "impacto": "Alto", "mitigacion": "..." }
  ],
  "presupuestoEstimado": 150000.00
}
```

#### Aprobar Acta
```
PATCH /api/v1/actas/:id/aprobar
```
**Roles:** `ADMIN`, `PMO`, `PATROCINADOR` (solo constitucion)

### 4.6. Requerimientos

```
GET    /api/v1/proyectos/:proyectoId/requerimientos
POST   /api/v1/requerimientos
GET    /api/v1/requerimientos/:id
PATCH  /api/v1/requerimientos/:id
DELETE /api/v1/requerimientos/:id
```

**Request (POST):**
```json
{
  "proyectoId": 1,
  "codigo": "RF-001",
  "tipo": "Requerimiento funcional",
  "descripcion": "El sistema debe permitir el registro de usuarios",
  "prioridad": "Alta",
  "actaOrigenId": 1
}
```

> **Nota:** Los requerimientos se crean manualmente. No existe endpoint de importacion automatica.

### 4.7. Cronogramas

```
GET    /api/v1/proyectos/:proyectoId/cronogramas
POST   /api/v1/cronogramas
GET    /api/v1/cronogramas/:id
PATCH  /api/v1/cronogramas/:id
DELETE /api/v1/cronogramas/:id
```

#### Exportar Cronograma
```
GET /api/v1/cronogramas/:id/exportar?formato=xlsx
GET /api/v1/cronogramas/:id/exportar?formato=pdf
```

### 4.8. Informes de Sprint

#### Listar Informes
```
GET /api/v1/proyectos/:proyectoId/informes-sprint
GET /api/v1/sprints/:sprintId/informe
```

#### Generar Informe (Auto)
```
POST /api/v1/sprints/:sprintId/generar-informe
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`

Genera automaticamente el informe con evidencias de HUs completadas.

#### Enviar a Revision
```
PATCH /api/v1/informes-sprint/:id/enviar
```
**Roles:** `SCRUM_MASTER`

#### Aprobar (Coordinador)
```
PATCH /api/v1/informes-sprint/:id/aprobar-coordinador
```
**Roles:** `COORDINADOR`

**Request:**
```json
{
  "aprobado": true,
  "observacion": "Aprobado sin observaciones"
}
```

#### Aprobar (PMO)
```
PATCH /api/v1/informes-sprint/:id/aprobar-pmo
```
**Roles:** `PMO`

### 4.9. Informes de Actividad

```
GET    /api/v1/actividades/:actividadId/informes
POST   /api/v1/informes-actividad
GET    /api/v1/informes-actividad/:id
PATCH  /api/v1/informes-actividad/:id
DELETE /api/v1/informes-actividad/:id
```

#### Aprobar Informe
```
PATCH /api/v1/informes-actividad/:id/aprobar
```
**Roles:** `PMO`

---

## 5. API DE AGILE

### 5.1. Epicas

```
GET    /api/v1/proyectos/:proyectoId/epicas
POST   /api/v1/epicas
GET    /api/v1/epicas/:id
PATCH  /api/v1/epicas/:id
DELETE /api/v1/epicas/:id
```

**Request (POST):**
```json
{
  "proyectoId": 1,
  "codigo": "EP-001",
  "nombre": "Gestion de Usuarios",
  "descripcion": "Funcionalidades relacionadas a usuarios",
  "color": "#6366F1",
  "prioridad": "Alta",
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-04-30"
}
```

#### Estadisticas de Epica
```
GET /api/v1/epicas/:id/estadisticas
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalHUs": 8,
    "husCompletadas": 3,
    "husEnProgreso": 2,
    "husPendientes": 3,
    "totalStoryPoints": 34,
    "storyPointsCompletados": 13,
    "porcentajeAvance": 37.5
  }
}
```

### 5.2. Sprints

```
GET    /api/v1/proyectos/:proyectoId/sprints
POST   /api/v1/sprints
GET    /api/v1/sprints/:id
PATCH  /api/v1/sprints/:id
DELETE /api/v1/sprints/:id
```

**Request (POST):**
```json
{
  "proyectoId": 1,
  "nombre": "Sprint 1",
  "sprintGoal": "Completar modulo de autenticacion",
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-02-14",
  "capacidadEquipo": 40
}
```

#### Iniciar Sprint
```
PATCH /api/v1/sprints/:id/iniciar
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`

#### Cerrar Sprint
```
PATCH /api/v1/sprints/:id/cerrar
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`

**Request:**
```json
{
  "linkEvidencia": "https://drive.google.com/..."
}
```

#### Burndown Chart
```
GET /api/v1/sprints/:id/burndown
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStoryPoints": 21,
    "dias": [
      { "fecha": "2024-02-01", "spRestantes": 21, "spIdeal": 21 },
      { "fecha": "2024-02-02", "spRestantes": 21, "spIdeal": 19.5 },
      { "fecha": "2024-02-03", "spRestantes": 18, "spIdeal": 18 },
      ...
    ]
  }
}
```

#### Metricas de Sprint
```
GET /api/v1/sprints/:id/metricas
```

### 5.3. Historias de Usuario

#### Listar HUs
```
GET /api/v1/proyectos/:proyectoId/historias-usuario
GET /api/v1/sprints/:sprintId/historias-usuario
GET /api/v1/epicas/:epicaId/historias-usuario
```

**Query params:**
```
?estado=En desarrollo
&prioridad=Must
&asignadoA=5
&enBacklog=true
```

#### CRUD HU
```
POST   /api/v1/historias-usuario
GET    /api/v1/historias-usuario/:id
PATCH  /api/v1/historias-usuario/:id
DELETE /api/v1/historias-usuario/:id
```

**Request (POST):**
```json
{
  "proyectoId": 1,
  "epicaId": 1,
  "codigo": "US-001",
  "titulo": "Login de usuarios",
  "rol": "usuario del sistema",
  "quiero": "poder iniciar sesion con email y password",
  "para": "acceder a las funcionalidades del sistema",
  "prioridad": "Must",
  "estimacion": "M",
  "storyPoints": 5,
  "criteriosAceptacion": [
    "Dado que soy un usuario registrado, cuando ingreso credenciales validas, entonces accedo al sistema",
    "Dado que soy un usuario, cuando ingreso credenciales invalidas, entonces veo un mensaje de error"
  ]
}
```

#### Cambiar Estado HU
```
PATCH /api/v1/historias-usuario/:id/estado
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`, `DESARROLLADOR`

**Request:**
```json
{
  "estado": "En desarrollo"
}
```

#### Mover HU a Sprint
```
PATCH /api/v1/historias-usuario/:id/mover-sprint
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`

**Request:**
```json
{
  "sprintId": 2
}
```

#### Asignar HU
```
PATCH /api/v1/historias-usuario/:id/asignar
```

**Request:**
```json
{
  "asignadoA": 5
}
```

#### Reordenar Backlog
```
PATCH /api/v1/proyectos/:proyectoId/backlog/reordenar
```

**Request:**
```json
{
  "orden": [
    { "huId": 3, "ordenBacklog": 1 },
    { "huId": 1, "ordenBacklog": 2 },
    { "huId": 5, "ordenBacklog": 3 }
  ]
}
```

#### Vincular Requerimiento
```
POST /api/v1/historias-usuario/:id/vincular-requerimiento
```

**Request:**
```json
{
  "requerimientoId": 5,
  "notas": "Esta HU implementa el requerimiento RF-005"
}
```

#### Agregar Dependencia
```
POST /api/v1/historias-usuario/:id/dependencias
```

**Request:**
```json
{
  "dependeDeId": 3,
  "tipoDependencia": "Bloqueada por"
}
```

### 5.4. Tareas

#### Listar Tareas
```
GET /api/v1/historias-usuario/:huId/tareas
GET /api/v1/actividades/:actividadId/tareas
```

#### CRUD Tareas
```
POST   /api/v1/tareas
GET    /api/v1/tareas/:id
PATCH  /api/v1/tareas/:id
DELETE /api/v1/tareas/:id
```

**Request (POST - SCRUM):**
```json
{
  "tipo": "SCRUM",
  "historiaUsuarioId": 1,
  "codigo": "TAR-001",
  "nombre": "Implementar endpoint de login",
  "descripcion": "Crear endpoint POST /auth/login",
  "prioridad": "Alta",
  "asignadoA": 10,
  "horasEstimadas": 8,
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-02-02"
}
```

**Request (POST - KANBAN):**
```json
{
  "tipo": "KANBAN",
  "actividadId": 1,
  "codigo": "TAR-001",
  "nombre": "Revisar logs del servidor",
  "descripcion": "Revision diaria de logs",
  "prioridad": "Media",
  "asignadoA": 15,
  "horasEstimadas": 2,
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-02-01"
}
```

#### Cambiar Estado Tarea
```
PATCH /api/v1/tareas/:id/estado
```

**Request:**
```json
{
  "estado": "Finalizado",
  "horasReales": 6,
  "evidenciaUrl": "https://storage.sigp.../evidencia.pdf"
}
```

#### Validar Tarea (SM/Coordinador)
```
PATCH /api/v1/tareas/:id/validar
```
**Roles:** `ADMIN`, `PMO`, `SCRUM_MASTER`, `COORDINADOR`

**Request:**
```json
{
  "validada": true,
  "observacion": "Tarea completada correctamente"
}
```

#### Mover Tarea (Tablero)
```
PATCH /api/v1/tareas/:id/mover
```

**Request:**
```json
{
  "estado": "En progreso"
}
```

### 5.5. Subtareas (Solo Kanban)

```
GET    /api/v1/tareas/:tareaId/subtareas
POST   /api/v1/subtareas
GET    /api/v1/subtareas/:id
PATCH  /api/v1/subtareas/:id
DELETE /api/v1/subtareas/:id
```

**Request (POST):**
```json
{
  "tareaId": 5,
  "codigo": "SUB-001",
  "nombre": "Revisar logs de Apache",
  "descripcion": "Revisar errores 500",
  "prioridad": "Alta",
  "responsable": 15,
  "horasEstimadas": 1,
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-02-01"
}
```

### 5.6. Tablero

#### Obtener Tablero Scrum (por Sprint)
```
GET /api/v1/sprints/:sprintId/tablero
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sprint": {
      "id": 1,
      "nombre": "Sprint 1",
      "estado": "Activo"
    },
    "columnas": [
      {
        "id": "por_hacer",
        "nombre": "Por Hacer",
        "items": [
          {
            "tipo": "HU",
            "id": 1,
            "codigo": "US-001",
            "titulo": "Login de usuarios",
            "storyPoints": 5,
            "asignadoA": { "id": 5, "nombre": "Juan" },
            "tareas": [
              { "id": 1, "codigo": "TAR-001", "nombre": "...", "estado": "Por hacer" }
            ]
          }
        ]
      },
      { "id": "en_progreso", "nombre": "En Progreso", "items": [...] },
      { "id": "en_revision", "nombre": "En Revision", "items": [...] },
      { "id": "finalizado", "nombre": "Finalizado", "items": [...] }
    ]
  }
}
```

#### Obtener Tablero Kanban (por Actividad)
```
GET /api/v1/actividades/:actividadId/tablero
```

**Response:**
```json
{
  "success": true,
  "data": {
    "actividad": {
      "id": 1,
      "nombre": "Soporte de Servidores"
    },
    "columnas": [
      {
        "id": "por_hacer",
        "nombre": "Por Hacer",
        "items": [
          {
            "tipo": "TAREA",
            "id": 5,
            "codigo": "TAR-005",
            "nombre": "Revisar logs",
            "asignadoA": { "id": 15, "nombre": "Pedro" },
            "subtareas": [
              { "id": 1, "codigo": "SUB-001", "nombre": "...", "estado": "Por hacer" }
            ]
          }
        ]
      },
      ...
    ]
  }
}
```

### 5.7. Daily Meetings

```
GET    /api/v1/proyectos/:proyectoId/daily-meetings
GET    /api/v1/actividades/:actividadId/daily-meetings
GET    /api/v1/sprints/:sprintId/daily-meetings
POST   /api/v1/daily-meetings
GET    /api/v1/daily-meetings/:id
PATCH  /api/v1/daily-meetings/:id
DELETE /api/v1/daily-meetings/:id
```

**Request (POST):**
```json
{
  "tipoPoi": "PROYECTO",
  "proyectoId": 1,
  "sprintId": 1,
  "nombre": "Daily Meeting 2024-02-05",
  "fecha": "2024-02-05",
  "facilitadorId": 5,
  "participantes": [
    {
      "usuarioId": 10,
      "queHiceAyer": "Complete el endpoint de login",
      "queHareHoy": "Iniciare el registro de usuarios",
      "impedimentos": null
    },
    {
      "usuarioId": 11,
      "queHiceAyer": "Revise diseño de BD",
      "queHareHoy": "Implementare migraciones",
      "impedimentos": "Necesito acceso al servidor de pruebas"
    }
  ]
}
```

### 5.8. Backlog

#### Obtener Backlog del Proyecto
```
GET /api/v1/proyectos/:proyectoId/backlog
```

**Query params:**
```
?incluirSprints=true
&filtroEpica=1
&filtroPrioridad=Must
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proyecto": {
      "id": 1,
      "nombre": "Sistema de Gestion"
    },
    "epicas": [
      {
        "id": 1,
        "codigo": "EP-001",
        "nombre": "Gestion de Usuarios",
        "color": "#6366F1"
      }
    ],
    "sprints": [
      {
        "id": 1,
        "nombre": "Sprint 1",
        "estado": "Activo",
        "fechaInicio": "2024-02-01",
        "fechaFin": "2024-02-14",
        "storyPoints": 21,
        "historias": [...]
      }
    ],
    "backlog": [
      {
        "id": 5,
        "codigo": "US-005",
        "titulo": "Recuperar password",
        "storyPoints": 3,
        "prioridad": "Should",
        "epica": { "id": 1, "color": "#6366F1" },
        "ordenBacklog": 1
      }
    ],
    "metricas": {
      "totalHUs": 20,
      "husEnBacklog": 8,
      "husEnSprints": 12,
      "totalStoryPoints": 89
    }
  }
}
```

---

## 6. API DE RRHH

### 6.1. Personal

```
GET    /api/v1/personal
POST   /api/v1/personal
GET    /api/v1/personal/:id
PATCH  /api/v1/personal/:id
DELETE /api/v1/personal/:id
```

**Query params:**
```
?divisionId=1
&disponible=true
&habilidad=TypeScript
&busqueda=Juan
```

#### Obtener Disponibilidad
```
GET /api/v1/personal/:id/disponibilidad
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personal": { "id": 5, "nombre": "Juan Perez" },
    "horasSemanales": 40,
    "asignacionesActuales": [
      {
        "tipo": "PROYECTO",
        "nombre": "Sistema de Gestion",
        "rol": "Desarrollador",
        "porcentaje": 50
      }
    ],
    "porcentajeAsignado": 50,
    "horasDisponibles": 20
  }
}
```

### 6.2. Divisiones

```
GET    /api/v1/divisiones
POST   /api/v1/divisiones
GET    /api/v1/divisiones/:id
PATCH  /api/v1/divisiones/:id
DELETE /api/v1/divisiones/:id
```

### 6.3. Habilidades

```
GET    /api/v1/habilidades
POST   /api/v1/habilidades
GET    /api/v1/habilidades/:id
PATCH  /api/v1/habilidades/:id
DELETE /api/v1/habilidades/:id
```

#### Asignar Habilidad a Personal
```
POST /api/v1/personal/:id/habilidades
```

**Request:**
```json
{
  "habilidadId": 5,
  "nivel": "Avanzado",
  "aniosExperiencia": 3,
  "certificado": true
}
```

### 6.4. Asignaciones

```
GET    /api/v1/asignaciones
POST   /api/v1/asignaciones
PATCH  /api/v1/asignaciones/:id
DELETE /api/v1/asignaciones/:id
```

**Request (POST):**
```json
{
  "personalId": 5,
  "tipoAsignacion": "PROYECTO",
  "proyectoId": 1,
  "rolEquipo": "Desarrollador",
  "porcentajeDedicacion": 50,
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-12-31"
}
```

---

## 7. API DE NOTIFICACIONES

### 7.1. Listar Notificaciones

```
GET /api/v1/notificaciones
```

**Query params:**
```
?leida=false
&tipo=Aprobaciones
```

### 7.2. Marcar como Leida

```
PATCH /api/v1/notificaciones/:id/leer
```

### 7.3. Marcar Todas como Leidas

```
PATCH /api/v1/notificaciones/leer-todas
```

### 7.4. Obtener Conteo No Leidas

```
GET /api/v1/notificaciones/conteo
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "porTipo": {
      "Proyectos": 3,
      "Sprints": 5,
      "Retrasos": 2,
      "Aprobaciones": 5
    }
  }
}
```

### 7.5. Preferencias

```
GET  /api/v1/notificaciones/preferencias
PUT  /api/v1/notificaciones/preferencias
```

---

## 8. API DE DASHBOARD

### 8.1. Dashboard General

```
GET /api/v1/dashboard
```
**Roles:** `ADMIN`, `PMO`, `COORDINADOR`

**Response:**
```json
{
  "success": true,
  "data": {
    "proyectos": {
      "total": 15,
      "enCurso": 8,
      "atrasados": 2,
      "completados": 5,
      "porSalud": { "verde": 10, "amarillo": 3, "rojo": 2 }
    },
    "actividades": {
      "total": 10,
      "enEjecucion": 8,
      "suspendidas": 2
    },
    "sprints": {
      "activos": 5,
      "velocidadPromedio": 18.5
    },
    "tareas": {
      "completadasHoy": 12,
      "enProgreso": 45,
      "bloqueadas": 3
    },
    "equipos": {
      "personasAsignadas": 25,
      "sinAsignacion": 5
    }
  }
}
```

### 8.2. Dashboard de Proyecto

```
GET /api/v1/dashboard/proyecto/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proyecto": {
      "id": 1,
      "nombre": "Sistema de Gestion",
      "estado": "En desarrollo",
      "salud": "VERDE",
      "scoresSalud": 85
    },
    "avance": {
      "porcentaje": 45.5,
      "husCompletadas": 9,
      "husTotal": 20,
      "storyPointsCompletados": 42,
      "storyPointsTotal": 89
    },
    "sprintActual": {
      "id": 3,
      "nombre": "Sprint 3",
      "diasRestantes": 5,
      "avance": 60
    },
    "velocidad": {
      "actual": 21,
      "promedio": 18.5,
      "tendencia": "UP"
    },
    "burndown": [...],
    "actividadReciente": [...]
  }
}
```

### 8.3. Avance por OEI

```
GET /api/v1/dashboard/avance-oei
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "oeiId": 1,
      "codigo": "OEI-01",
      "nombre": "Transformacion Digital",
      "porcentajeAvance": 45.5,
      "proyectosVinculados": 5,
      "proyectosCompletados": 2
    }
  ]
}
```

---

## 9. WEBSOCKET EVENTS

### 9.1. Conexion

```javascript
// Cliente
const socket = io('ws://localhost:3010/kanban', {
  auth: { token: 'Bearer eyJhbGciOiJIUzI1NiIs...' }
});
```

### 9.2. Eventos de Tablero

| Evento | Direccion | Payload |
|--------|-----------|---------|
| `room:join` | Client→Server | `{ proyectoId: number }` |
| `room:leave` | Client→Server | `{ proyectoId: number }` |
| `tarea:mover` | Client→Server | `{ tareaId: number, estado: string }` |
| `tarea:actualizada` | Server→Client | `{ tarea: Tarea, accion: string }` |
| `hu:actualizada` | Server→Client | `{ hu: HU, accion: string }` |
| `sprint:actualizado` | Server→Client | `{ sprint: Sprint }` |

### 9.3. Eventos de Notificaciones

| Evento | Direccion | Payload |
|--------|-----------|---------|
| `notificacion:nueva` | Server→Client | `{ notificacion: Notificacion }` |
| `notificacion:leida` | Client→Server | `{ notificacionId: number }` |

### 9.4. Eventos de Presencia

| Evento | Direccion | Payload |
|--------|-----------|---------|
| `usuario:conectado` | Server→Client | `{ usuarioId: number, proyectoId: number }` |
| `usuario:desconectado` | Server→Client | `{ usuarioId: number, proyectoId: number }` |
| `usuarios:online` | Server→Client | `{ usuarios: number[] }` |

---

## 10. CODIGOS DE ERROR

### 10.1. Codigos HTTP

| Codigo | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 204 | Sin contenido (DELETE exitoso) |
| 400 | Bad Request (validacion) |
| 401 | No autenticado |
| 403 | Forbidden (sin permisos) |
| 404 | No encontrado |
| 409 | Conflicto (duplicado) |
| 422 | Entidad no procesable |
| 429 | Too many requests |
| 500 | Error interno |

### 10.2. Codigos de Error del Sistema

| Codigo | Descripcion |
|--------|-------------|
| `AUTH_INVALID_CREDENTIALS` | Credenciales invalidas |
| `AUTH_TOKEN_EXPIRED` | Token expirado |
| `AUTH_TOKEN_INVALID` | Token invalido |
| `AUTH_ACCOUNT_BLOCKED` | Cuenta bloqueada |
| `VALIDATION_ERROR` | Error de validacion |
| `NOT_FOUND` | Recurso no encontrado |
| `FORBIDDEN` | Sin permisos para esta accion |
| `DUPLICATE_ENTRY` | Registro duplicado |
| `BUSINESS_RULE_VIOLATION` | Regla de negocio violada |
| `FILE_TOO_LARGE` | Archivo muy grande |
| `FILE_TYPE_NOT_ALLOWED` | Tipo de archivo no permitido |
| `SPRINT_ALREADY_ACTIVE` | Ya hay un sprint activo |
| `HU_HAS_DEPENDENCIES` | HU tiene dependencias pendientes |
| `TAREA_REQUIRES_EVIDENCE` | Tarea requiere evidencia para finalizar |

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Especificacion de APIs v1.0*
