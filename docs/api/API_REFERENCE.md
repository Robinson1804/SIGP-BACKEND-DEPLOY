# SIGP Backend - Referencia Completa de API

## Informacion General

| Propiedad | Valor |
|-----------|-------|
| Base URL | `http://localhost:3010/api/v1` |
| Documentacion Swagger | `http://localhost:3010/api/docs` |
| Autenticacion | JWT Bearer Token |
| Content-Type | `application/json` |

---

## Autenticacion

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

### Roles del Sistema

| Rol | Descripcion | Permisos |
|-----|-------------|----------|
| `ADMIN` | Administrador del sistema | Acceso total |
| `PMO` | Oficina de Gestion de Proyectos | Gestion de proyectos y reportes |
| `COORDINADOR` | Coordinador de area | Gestion de actividades y tareas |
| `SCRUM_MASTER` | Scrum Master | Gestion agil completa |
| `PATROCINADOR` | Patrocinador de proyecto | Solo lectura de proyectos |
| `DESARROLLADOR` | Desarrollador | Gestion de tareas asignadas |
| `IMPLEMENTADOR` | Implementador | Ejecucion de tareas |

---

# MODULO DE AUTENTICACION (Auth)

## POST /auth/login

Iniciar sesion y obtener token JWT.

**Request Body:**
```json
{
  "email": "admin@inei.gob.pe",
  "password": "Password123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "email": "admin@inei.gob.pe",
      "nombre": "Administrador",
      "apellido": "Sistema",
      "rol": "ADMIN",
      "divisionId": 1
    }
  },
  "message": "Login exitoso"
}
```

**Response 401:**
```json
{
  "success": false,
  "error": "Credenciales invalidas",
  "statusCode": 401
}
```

---

## POST /auth/register

Registrar nuevo usuario (requiere rol ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "nuevo@inei.gob.pe",
  "password": "Password123!",
  "nombre": "Juan",
  "apellido": "Perez",
  "rol": "DESARROLLADOR",
  "divisionId": 1
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "email": "nuevo@inei.gob.pe",
    "nombre": "Juan",
    "apellido": "Perez",
    "rol": "DESARROLLADOR",
    "activo": true,
    "createdAt": "2025-12-15T10:00:00.000Z"
  },
  "message": "Usuario creado exitosamente"
}
```

---

## POST /auth/refresh

Refrescar token de acceso.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

## POST /auth/logout

Cerrar sesion (invalida el token).

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Sesion cerrada exitosamente"
}
```

---

## GET /auth/me

Obtener informacion del usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@inei.gob.pe",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "rol": "ADMIN",
    "divisionId": 1,
    "division": {
      "id": 1,
      "nombre": "Direccion General"
    },
    "activo": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## GET /usuarios

Listar todos los usuarios (paginado).

**Headers:** `Authorization: Bearer <token>`
**Roles:** `ADMIN`, `PMO`

**Query Parameters:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| page | number | 1 | Pagina actual |
| limit | number | 10 | Items por pagina |
| search | string | - | Buscar por nombre/email |
| rol | string | - | Filtrar por rol |
| activo | boolean | - | Filtrar por estado |

**Request:**
```
GET /usuarios?page=1&limit=10&rol=DESARROLLADOR
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 6,
        "email": "desarrollador@inei.gob.pe",
        "nombre": "Desarrollador",
        "apellido": "Test",
        "rol": "DESARROLLADOR",
        "activo": true
      }
    ],
    "meta": {
      "totalItems": 1,
      "itemCount": 1,
      "itemsPerPage": 10,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}
```

---

## GET /usuarios/:id

Obtener usuario por ID.

**Headers:** `Authorization: Bearer <token>`
**Roles:** `ADMIN`, `PMO`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@inei.gob.pe",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "rol": "ADMIN",
    "divisionId": 1,
    "division": {
      "id": 1,
      "nombre": "Direccion General"
    },
    "activo": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## PATCH /usuarios/:id

Actualizar usuario.

**Headers:** `Authorization: Bearer <token>`
**Roles:** `ADMIN`

**Request Body:**
```json
{
  "nombre": "Admin",
  "apellido": "Principal",
  "rol": "ADMIN",
  "divisionId": 2
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@inei.gob.pe",
    "nombre": "Admin",
    "apellido": "Principal",
    "rol": "ADMIN",
    "divisionId": 2
  },
  "message": "Usuario actualizado exitosamente"
}
```

---

## DELETE /usuarios/:id

Desactivar usuario (soft delete).

**Headers:** `Authorization: Bearer <token>`
**Roles:** `ADMIN`

**Response 200:**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente"
}
```

---

# MODULO DE PLANIFICACION (Planning)

## Jerarquia de Planificacion

```
PGD (Plan General de Desarrollo)
  |__ OEI (Objetivo Estrategico Institucional)
        |__ OGD (Objetivo General Divisional)
              |__ OEGD (Objetivo Especifico de Gestion Divisional)
                    |__ Accion Estrategica
```

---

## PGD (Plan General de Desarrollo)

### GET /pgd

Listar todos los PGD.

**Headers:** `Authorization: Bearer <token>`
**Roles:** `ADMIN`, `PMO`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "PGD-2025",
      "nombre": "Plan de Gestion de Desarrollo 2025",
      "descripcion": "Plan estrategico institucional",
      "fechaInicio": "2025-01-01",
      "fechaFin": "2025-12-31",
      "estado": "ACTIVO",
      "activo": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /pgd

Crear nuevo PGD.

**Headers:** `Authorization: Bearer <token>`
**Roles:** `ADMIN`, `PMO`

**Request Body:**
```json
{
  "codigo": "PGD-2025",
  "nombre": "Plan de Gestion de Desarrollo 2025",
  "descripcion": "Plan estrategico institucional para el anio 2025",
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-12-31"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "PGD-2025",
    "nombre": "Plan de Gestion de Desarrollo 2025",
    "descripcion": "Plan estrategico institucional para el anio 2025",
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-12-31",
    "estado": "BORRADOR",
    "activo": true,
    "createdAt": "2025-12-15T10:00:00.000Z"
  },
  "message": "PGD creado exitosamente"
}
```

---

### GET /pgd/:id

Obtener PGD por ID con sus OEIs.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "PGD-2025",
    "nombre": "Plan de Gestion de Desarrollo 2025",
    "descripcion": "Plan estrategico institucional",
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-12-31",
    "estado": "ACTIVO",
    "oeis": [
      {
        "id": 1,
        "codigo": "OEI-001",
        "nombre": "Modernizacion institucional"
      }
    ]
  }
}
```

---

### PATCH /pgd/:id

Actualizar PGD.

**Request Body:**
```json
{
  "nombre": "Plan Actualizado 2025",
  "estado": "ACTIVO"
}
```

---

### DELETE /pgd/:id

Eliminar PGD (soft delete).

---

## OEI (Objetivo Estrategico Institucional)

### GET /oei

Listar todos los OEI.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| pgdId | number | Filtrar por PGD |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "OEI-001",
      "nombre": "Modernizacion de procesos",
      "descripcion": "Objetivo de modernizacion institucional",
      "pgdId": 1,
      "pgd": {
        "id": 1,
        "codigo": "PGD-2025"
      },
      "peso": 25,
      "meta": 100,
      "avance": 45.5
    }
  ]
}
```

---

### POST /oei

Crear nuevo OEI.

**Request Body:**
```json
{
  "codigo": "OEI-001",
  "nombre": "Modernizacion de procesos",
  "descripcion": "Objetivo de modernizacion institucional",
  "pgdId": 1,
  "peso": 25,
  "meta": 100
}
```

---

### GET /oei/:id

Obtener OEI con sus OGDs.

---

### GET /pgd/:pgdId/oei

Listar OEI de un PGD especifico.

---

## OGD (Objetivo General Divisional)

### GET /ogd

Listar todos los OGD.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| oeiId | number | Filtrar por OEI |

---

### POST /ogd

Crear nuevo OGD.

**Request Body:**
```json
{
  "codigo": "OGD-001",
  "nombre": "Digitalizacion de servicios",
  "descripcion": "Digitalizar servicios al ciudadano",
  "oeiId": 1,
  "divisionId": 1,
  "peso": 30,
  "meta": 100
}
```

---

### GET /oei/:oeiId/ogd

Listar OGD de un OEI especifico.

---

## OEGD (Objetivo Especifico de Gestion Divisional)

### GET /oegd

Listar todos los OEGD.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| ogdId | number | Filtrar por OGD |

---

### POST /oegd

Crear nuevo OEGD.

**Request Body:**
```json
{
  "codigo": "OEGD-001",
  "nombre": "Implementar sistema de citas",
  "descripcion": "Sistema de citas en linea",
  "ogdId": 1,
  "responsableId": 1,
  "peso": 50,
  "meta": 100
}
```

---

### GET /ogd/:ogdId/oegd

Listar OEGD de un OGD especifico.

---

## Acciones Estrategicas

### GET /acciones-estrategicas

Listar todas las acciones estrategicas.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| oegdId | number | Filtrar por OEGD |

---

### POST /acciones-estrategicas

Crear nueva accion estrategica.

**Request Body:**
```json
{
  "codigo": "AE-001",
  "nombre": "Desarrollo del modulo de citas",
  "descripcion": "Desarrollar modulo completo",
  "oegdId": 1,
  "responsableId": 2,
  "fechaInicio": "2025-01-15",
  "fechaFin": "2025-06-30",
  "presupuesto": 50000
}
```

---

### GET /oegd/:oegdId/acciones-estrategicas

Listar acciones de un OEGD especifico.

---

# MODULO POI (Plan Operativo Institucional)

## Proyectos

### GET /proyectos

Listar todos los proyectos (paginado).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| page | number | 1 | Pagina actual |
| limit | number | 10 | Items por pagina |
| search | string | - | Buscar por nombre/codigo |
| estado | string | - | Filtrar por estado |
| responsableId | number | - | Filtrar por responsable |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "codigo": "PROY-2025-001",
        "nombre": "Sistema de Gestion SIGP",
        "descripcion": "Sistema integral de gestion de proyectos",
        "estado": "EN_PROGRESO",
        "prioridad": "ALTA",
        "fechaInicio": "2025-01-01",
        "fechaFin": "2025-12-31",
        "presupuesto": 100000,
        "avance": 35.5,
        "responsable": {
          "id": 2,
          "nombre": "PMO",
          "apellido": "Usuario"
        },
        "activo": true
      }
    ],
    "meta": {
      "totalItems": 1,
      "itemCount": 1,
      "itemsPerPage": 10,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}
```

---

### POST /proyectos

Crear nuevo proyecto.

**Headers:** `Authorization: Bearer <token>`
**Roles:** `ADMIN`, `PMO`

**Request Body:**
```json
{
  "codigo": "PROY-2025-001",
  "nombre": "Sistema de Gestion SIGP",
  "descripcion": "Sistema integral de gestion de proyectos",
  "prioridad": "ALTA",
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-12-31",
  "presupuesto": 100000,
  "responsableId": 2,
  "accionEstrategicaId": 1,
  "divisionId": 1
}
```

**Valores permitidos para prioridad:** `BAJA`, `MEDIA`, `ALTA`, `CRITICA`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "PROY-2025-001",
    "nombre": "Sistema de Gestion SIGP",
    "estado": "PLANIFICACION",
    "prioridad": "ALTA",
    "avance": 0,
    "activo": true,
    "createdAt": "2025-12-15T10:00:00.000Z"
  },
  "message": "Proyecto creado exitosamente"
}
```

---

### GET /proyectos/:id

Obtener proyecto por ID con relaciones.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "PROY-2025-001",
    "nombre": "Sistema de Gestion SIGP",
    "descripcion": "Sistema integral de gestion de proyectos",
    "estado": "EN_PROGRESO",
    "prioridad": "ALTA",
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-12-31",
    "presupuesto": 100000,
    "avance": 35.5,
    "responsable": {
      "id": 2,
      "nombre": "PMO",
      "apellido": "Usuario",
      "email": "pmo@inei.gob.pe"
    },
    "division": {
      "id": 1,
      "nombre": "Direccion General"
    },
    "subproyectos": [
      {
        "id": 1,
        "codigo": "SUB-001",
        "nombre": "Backend API"
      }
    ],
    "epicas": [
      {
        "id": 1,
        "codigo": "EPIC-001",
        "titulo": "Modulo de autenticacion"
      }
    ]
  }
}
```

---

### PATCH /proyectos/:id

Actualizar proyecto.

**Request Body:**
```json
{
  "nombre": "SIGP - Sistema Actualizado",
  "estado": "EN_PROGRESO",
  "avance": 50
}
```

**Valores permitidos para estado:**
- `PLANIFICACION`
- `EN_PROGRESO`
- `PAUSADO`
- `COMPLETADO`
- `CANCELADO`

---

### DELETE /proyectos/:id

Eliminar proyecto (soft delete).

---

### PATCH /proyectos/:id/estado

Cambiar estado del proyecto.

**Request Body:**
```json
{
  "estado": "EN_PROGRESO",
  "motivo": "Inicio de fase de desarrollo"
}
```

---

## Subproyectos

### GET /subproyectos

Listar todos los subproyectos.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| proyectoId | number | Filtrar por proyecto |

---

### POST /subproyectos

Crear nuevo subproyecto.

**Request Body:**
```json
{
  "codigo": "SUB-001",
  "nombre": "Backend API",
  "descripcion": "Desarrollo del backend",
  "proyectoId": 1,
  "responsableId": 3,
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-06-30",
  "presupuesto": 40000
}
```

---

### GET /proyectos/:proyectoId/subproyectos

Listar subproyectos de un proyecto.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "SUB-001",
      "nombre": "Backend API",
      "estado": "EN_PROGRESO",
      "avance": 45,
      "proyectoId": 1
    }
  ]
}
```

---

## Actividades

### GET /actividades

Listar todas las actividades.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| subproyectoId | number | Filtrar por subproyecto |
| responsableId | number | Filtrar por responsable |
| estado | string | Filtrar por estado |

---

### POST /actividades

Crear nueva actividad.

**Request Body:**
```json
{
  "codigo": "ACT-001",
  "nombre": "Desarrollo modulo Auth",
  "descripcion": "Implementar autenticacion JWT",
  "subproyectoId": 1,
  "responsableId": 4,
  "fechaInicio": "2025-01-15",
  "fechaFin": "2025-02-15",
  "horasEstimadas": 80,
  "prioridad": "ALTA"
}
```

---

### GET /actividades/:id

Obtener actividad con tareas.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "ACT-001",
    "nombre": "Desarrollo modulo Auth",
    "descripcion": "Implementar autenticacion JWT",
    "estado": "EN_PROGRESO",
    "prioridad": "ALTA",
    "fechaInicio": "2025-01-15",
    "fechaFin": "2025-02-15",
    "horasEstimadas": 80,
    "horasReales": 35,
    "avance": 43.75,
    "responsable": {
      "id": 4,
      "nombre": "Scrum",
      "apellido": "Master"
    },
    "tareas": [
      {
        "id": 1,
        "titulo": "Implementar login",
        "estado": "COMPLETADA"
      },
      {
        "id": 2,
        "titulo": "Implementar refresh token",
        "estado": "EN_PROGRESO"
      }
    ]
  }
}
```

---

### GET /actividades/:id/tablero-kanban

Obtener tablero Kanban de una actividad.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "actividad": {
      "id": 1,
      "codigo": "ACT-001",
      "nombre": "Desarrollo modulo Auth"
    },
    "columnas": [
      {
        "estado": "PENDIENTE",
        "nombre": "Por Hacer",
        "tareas": [
          {
            "id": 3,
            "titulo": "Implementar logout",
            "prioridad": "MEDIA"
          }
        ],
        "count": 1
      },
      {
        "estado": "EN_PROGRESO",
        "nombre": "En Progreso",
        "tareas": [
          {
            "id": 2,
            "titulo": "Implementar refresh token",
            "prioridad": "ALTA",
            "asignado": {
              "id": 6,
              "nombre": "Desarrollador"
            }
          }
        ],
        "count": 1
      },
      {
        "estado": "COMPLETADA",
        "nombre": "Completado",
        "tareas": [
          {
            "id": 1,
            "titulo": "Implementar login",
            "prioridad": "ALTA"
          }
        ],
        "count": 1
      }
    ],
    "estadisticas": {
      "total": 3,
      "pendientes": 1,
      "enProgreso": 1,
      "completadas": 1,
      "porcentajeAvance": 33.33
    }
  }
}
```

---

### GET /actividades/:id/tareas

Listar tareas de una actividad.

---

### GET /subproyectos/:subproyectoId/actividades

Listar actividades de un subproyecto.

---

## Cronogramas

### GET /cronogramas

Listar todos los cronogramas.

---

### POST /cronogramas

Crear cronograma.

**Request Body:**
```json
{
  "nombre": "Cronograma Q1 2025",
  "descripcion": "Cronograma del primer trimestre",
  "proyectoId": 1,
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-03-31"
}
```

---

### GET /cronogramas/:id/hitos

Listar hitos de un cronograma.

---

### POST /cronogramas/:id/hitos

Crear hito en cronograma.

**Request Body:**
```json
{
  "nombre": "Entrega modulo Auth",
  "descripcion": "Entrega del modulo de autenticacion",
  "fechaProgramada": "2025-02-15",
  "responsableId": 4
}
```

---

## Documentos

### GET /documentos

Listar todos los documentos.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| proyectoId | number | Filtrar por proyecto |
| tipo | string | Filtrar por tipo |

---

### POST /documentos

Crear documento.

**Request Body:**
```json
{
  "nombre": "Manual de Usuario",
  "descripcion": "Manual de usuario del sistema",
  "tipo": "MANUAL",
  "url": "https://storage.example.com/docs/manual.pdf",
  "proyectoId": 1,
  "version": "1.0"
}
```

**Tipos de documento:** `ACTA`, `INFORME`, `MANUAL`, `ESPECIFICACION`, `CONTRATO`, `OTRO`

---

### GET /proyectos/:proyectoId/documentos

Listar documentos de un proyecto.

---

## Actas

### GET /actas

Listar todas las actas.

---

### POST /actas

Crear acta de reunion.

**Request Body:**
```json
{
  "titulo": "Acta de Kickoff",
  "fecha": "2025-01-15",
  "asistentes": [1, 2, 3, 4],
  "agenda": "1. Presentacion del proyecto\n2. Roles y responsabilidades",
  "acuerdos": "Se aprueba el cronograma inicial",
  "proyectoId": 1
}
```

---

## Requerimientos

### GET /requerimientos

Listar todos los requerimientos.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| proyectoId | number | Filtrar por proyecto |
| tipo | string | Filtrar por tipo |
| prioridad | string | Filtrar por prioridad |
| estado | string | Filtrar por estado |

---

### POST /requerimientos

Crear requerimiento.

**Request Body:**
```json
{
  "codigo": "REQ-001",
  "titulo": "Autenticacion de usuarios",
  "descripcion": "El sistema debe permitir autenticacion con email y password",
  "tipo": "FUNCIONAL",
  "prioridad": "ALTA",
  "proyectoId": 1,
  "solicitanteId": 2
}
```

**Tipos:** `FUNCIONAL`, `NO_FUNCIONAL`, `TECNICO`, `NEGOCIO`

---

### PATCH /requerimientos/:id/estado

Cambiar estado del requerimiento.

**Request Body:**
```json
{
  "estado": "APROBADO",
  "comentario": "Requerimiento aprobado por el comite"
}
```

**Estados:** `PENDIENTE`, `EN_REVISION`, `APROBADO`, `RECHAZADO`, `IMPLEMENTADO`

---

## Informes de Actividad

### GET /informes-actividad

Listar informes de actividad.

---

### POST /informes-actividad

Crear informe de actividad.

**Request Body:**
```json
{
  "actividadId": 1,
  "periodo": "2025-01",
  "resumen": "Avance del 45% en el modulo de autenticacion",
  "logros": "Implementacion de login y registro",
  "problemas": "Retraso en integracion con Active Directory",
  "proximasSemanas": "Completar integracion AD y tests"
}
```

---

## Informes de Sprint

### GET /informes-sprint

Listar informes de sprint.

---

### POST /informes-sprint

Crear informe de sprint.

**Request Body:**
```json
{
  "sprintId": 1,
  "resumen": "Sprint completado con 85% de historias",
  "velocidad": 34,
  "historiasCompletadas": 8,
  "historiasPendientes": 2,
  "impedimentos": "Dependencia con equipo de infraestructura",
  "retrospectiva": {
    "queSalioMal": ["Estimaciones optimistas"],
    "queSalioBien": ["Comunicacion del equipo"],
    "mejoras": ["Mejorar estimacion de tareas"]
  }
}
```

---

# MODULO AGILE

## Sprints

### GET /sprints

Listar todos los sprints (paginado).

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| page | number | Pagina |
| limit | number | Items por pagina |
| proyectoId | number | Filtrar por proyecto |
| estado | string | Filtrar por estado |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "nombre": "Sprint 1",
        "objetivo": "Implementar autenticacion basica",
        "fechaInicio": "2025-01-06",
        "fechaFin": "2025-01-20",
        "estado": "EN_PROGRESO",
        "velocidadPlanificada": 40,
        "velocidadReal": 32,
        "proyecto": {
          "id": 1,
          "nombre": "SIGP"
        }
      }
    ],
    "meta": {
      "totalItems": 1,
      "currentPage": 1
    }
  }
}
```

---

### POST /sprints

Crear nuevo sprint.

**Request Body:**
```json
{
  "nombre": "Sprint 1",
  "objetivo": "Implementar autenticacion basica",
  "fechaInicio": "2025-01-06",
  "fechaFin": "2025-01-20",
  "proyectoId": 1,
  "velocidadPlanificada": 40
}
```

---

### GET /sprints/:id

Obtener sprint con historias de usuario.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Sprint 1",
    "objetivo": "Implementar autenticacion basica",
    "fechaInicio": "2025-01-06",
    "fechaFin": "2025-01-20",
    "estado": "EN_PROGRESO",
    "velocidadPlanificada": 40,
    "velocidadReal": 32,
    "historiasUsuario": [
      {
        "id": 1,
        "titulo": "Login de usuario",
        "estado": "COMPLETADA",
        "puntos": 8
      },
      {
        "id": 2,
        "titulo": "Registro de usuario",
        "estado": "EN_PROGRESO",
        "puntos": 5
      }
    ],
    "burndownData": [
      { "dia": 1, "pendiente": 40, "ideal": 40 },
      { "dia": 2, "pendiente": 35, "ideal": 37 }
    ]
  }
}
```

---

### PATCH /sprints/:id/estado

Cambiar estado del sprint.

**Request Body:**
```json
{
  "estado": "EN_PROGRESO"
}
```

**Estados del Sprint:** `PLANIFICACION`, `EN_PROGRESO`, `COMPLETADO`, `CANCELADO`

---

### GET /sprints/:id/burndown

Obtener datos del burndown chart.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "sprintId": 1,
    "diasTotales": 10,
    "puntosTotales": 40,
    "datos": [
      { "dia": 1, "fecha": "2025-01-06", "puntosRestantes": 40, "ideal": 40 },
      { "dia": 2, "fecha": "2025-01-07", "puntosRestantes": 35, "ideal": 36 },
      { "dia": 3, "fecha": "2025-01-08", "puntosRestantes": 28, "ideal": 32 }
    ]
  }
}
```

---

### GET /sprints/:id/velocity

Obtener velocidad del sprint.

---

### GET /proyectos/:proyectoId/sprints

Listar sprints de un proyecto.

---

## Epicas

### GET /epicas

Listar todas las epicas.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| proyectoId | number | Filtrar por proyecto |
| estado | string | Filtrar por estado |

---

### POST /epicas

Crear nueva epica.

**Request Body:**
```json
{
  "codigo": "EPIC-001",
  "titulo": "Modulo de Autenticacion",
  "descripcion": "Implementar sistema completo de autenticacion",
  "proyectoId": 1,
  "prioridad": "ALTA",
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-03-31"
}
```

---

### GET /epicas/:id

Obtener epica con historias de usuario.

---

### GET /proyectos/:proyectoId/epicas

Listar epicas de un proyecto.

---

## Historias de Usuario

### GET /historias-usuario

Listar todas las historias de usuario.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| sprintId | number | Filtrar por sprint |
| epicaId | number | Filtrar por epica |
| estado | string | Filtrar por estado |
| asignadoId | number | Filtrar por asignado |

---

### POST /historias-usuario

Crear historia de usuario.

**Request Body:**
```json
{
  "titulo": "Login de usuario",
  "descripcion": "Como usuario quiero poder iniciar sesion para acceder al sistema",
  "criteriosAceptacion": [
    "El usuario puede ingresar email y password",
    "El sistema valida las credenciales",
    "Se genera un token JWT al autenticar"
  ],
  "puntos": 8,
  "prioridad": "ALTA",
  "epicaId": 1,
  "sprintId": 1,
  "asignadoId": 6
}
```

---

### GET /historias-usuario/:id

Obtener historia con tareas.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Login de usuario",
    "descripcion": "Como usuario quiero poder iniciar sesion",
    "criteriosAceptacion": [
      "El usuario puede ingresar email y password",
      "El sistema valida las credenciales"
    ],
    "puntos": 8,
    "prioridad": "ALTA",
    "estado": "EN_PROGRESO",
    "epica": {
      "id": 1,
      "titulo": "Modulo de Autenticacion"
    },
    "sprint": {
      "id": 1,
      "nombre": "Sprint 1"
    },
    "asignado": {
      "id": 6,
      "nombre": "Desarrollador"
    },
    "tareas": [
      {
        "id": 1,
        "titulo": "Crear endpoint de login",
        "estado": "COMPLETADA"
      },
      {
        "id": 2,
        "titulo": "Validar credenciales",
        "estado": "EN_PROGRESO"
      }
    ]
  }
}
```

---

### PATCH /historias-usuario/:id/estado

Cambiar estado de historia.

**Request Body:**
```json
{
  "estado": "EN_PROGRESO"
}
```

**Estados:** `PENDIENTE`, `EN_PROGRESO`, `EN_REVISION`, `COMPLETADA`, `BLOQUEADA`

---

### GET /sprints/:sprintId/historias-usuario

Listar historias de un sprint.

---

### GET /epicas/:epicaId/historias-usuario

Listar historias de una epica.

---

## Tareas

### GET /tareas

Listar todas las tareas.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| historiaId | number | Filtrar por historia |
| actividadId | number | Filtrar por actividad |
| estado | string | Filtrar por estado |
| asignadoId | number | Filtrar por asignado |
| prioridad | string | Filtrar por prioridad |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Implementar endpoint login",
      "descripcion": "Crear POST /auth/login",
      "estado": "EN_PROGRESO",
      "prioridad": "ALTA",
      "horasEstimadas": 4,
      "horasReales": 2,
      "asignado": {
        "id": 6,
        "nombre": "Desarrollador"
      },
      "historiaUsuario": {
        "id": 1,
        "titulo": "Login de usuario"
      }
    }
  ]
}
```

---

### POST /tareas

Crear nueva tarea.

**Request Body:**
```json
{
  "titulo": "Implementar endpoint login",
  "descripcion": "Crear POST /auth/login con validacion",
  "prioridad": "ALTA",
  "horasEstimadas": 4,
  "historiaUsuarioId": 1,
  "actividadId": 1,
  "asignadoId": 6
}
```

---

### GET /tareas/:id

Obtener tarea con subtareas y evidencias.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Implementar endpoint login",
    "descripcion": "Crear POST /auth/login",
    "estado": "EN_PROGRESO",
    "prioridad": "ALTA",
    "horasEstimadas": 4,
    "horasReales": 2,
    "asignado": {
      "id": 6,
      "nombre": "Desarrollador"
    },
    "historiaUsuario": {
      "id": 1,
      "titulo": "Login de usuario"
    },
    "actividad": {
      "id": 1,
      "nombre": "Desarrollo Auth"
    },
    "subtareas": [
      {
        "id": 1,
        "titulo": "Crear DTO de login",
        "estado": "COMPLETADA"
      },
      {
        "id": 2,
        "titulo": "Implementar validacion",
        "estado": "EN_PROGRESO"
      }
    ],
    "evidencias": [
      {
        "id": 1,
        "nombre": "Screenshot test postman",
        "url": "https://storage.example.com/evidencias/test-login.png",
        "tipo": "imagen"
      }
    ],
    "historialCambios": [
      {
        "id": 1,
        "campo": "estado",
        "valorAnterior": "PENDIENTE",
        "valorNuevo": "EN_PROGRESO",
        "fecha": "2025-01-08T10:00:00.000Z",
        "usuario": "Desarrollador"
      }
    ]
  }
}
```

---

### PATCH /tareas/:id

Actualizar tarea.

**Request Body:**
```json
{
  "titulo": "Implementar endpoint login v2",
  "horasReales": 3,
  "descripcion": "Actualizado con nuevos requisitos"
}
```

---

### PATCH /tareas/:id/estado

Cambiar estado de tarea.

**Request Body:**
```json
{
  "estado": "COMPLETADA",
  "horasReales": 4,
  "evidenciaUrl": "https://storage.example.com/evidencias/completado.png"
}
```

**Estados de Tarea:**
- `PENDIENTE` - Por hacer
- `EN_PROGRESO` - En desarrollo
- `EN_REVISION` - En revision de codigo
- `COMPLETADA` - Terminada
- `BLOQUEADA` - Bloqueada por impedimento

---

### GET /tareas/:id/historial

Obtener historial de cambios de una tarea.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "campo": "estado",
      "valorAnterior": "PENDIENTE",
      "valorNuevo": "EN_PROGRESO",
      "fecha": "2025-01-08T10:00:00.000Z",
      "usuario": {
        "id": 6,
        "nombre": "Desarrollador"
      }
    },
    {
      "id": 2,
      "campo": "horasReales",
      "valorAnterior": "0",
      "valorNuevo": "2",
      "fecha": "2025-01-08T14:00:00.000Z",
      "usuario": {
        "id": 6,
        "nombre": "Desarrollador"
      }
    }
  ]
}
```

---

### GET /historias-usuario/:historiaId/tareas

Listar tareas de una historia de usuario.

---

## Evidencias de Tarea

### GET /tareas/:tareaId/evidencias

Listar evidencias de una tarea.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Screenshot prueba unitaria",
      "descripcion": "Resultado de test unitario",
      "url": "https://storage.example.com/evidencias/test-unit.png",
      "tipo": "imagen",
      "tamanoBytes": 245678,
      "subidoPor": {
        "id": 6,
        "nombre": "Desarrollador"
      },
      "createdAt": "2025-01-08T15:00:00.000Z"
    }
  ]
}
```

---

### POST /tareas/:tareaId/evidencias

Agregar evidencia a una tarea.

**Request Body:**
```json
{
  "nombre": "Screenshot prueba unitaria",
  "descripcion": "Resultado de test unitario",
  "url": "https://storage.example.com/evidencias/test-unit.png",
  "tipo": "imagen",
  "tamanoBytes": 245678
}
```

**Tipos de evidencia:** `imagen`, `documento`, `video`, `enlace`, `otro`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Screenshot prueba unitaria",
    "url": "https://storage.example.com/evidencias/test-unit.png",
    "tipo": "imagen",
    "createdAt": "2025-01-08T15:00:00.000Z"
  },
  "message": "Evidencia agregada exitosamente"
}
```

---

### DELETE /tareas/:tareaId/evidencias/:evidenciaId

Eliminar evidencia.

---

## Subtareas

### GET /subtareas

Listar todas las subtareas.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| tareaId | number | Filtrar por tarea |
| estado | string | Filtrar por estado |

---

### POST /subtareas

Crear subtarea.

**Request Body:**
```json
{
  "titulo": "Crear DTO de login",
  "descripcion": "Crear LoginDto con validaciones",
  "tareaId": 1,
  "orden": 1,
  "horasEstimadas": 1
}
```

---

### GET /subtareas/:id

Obtener subtarea.

---

### PATCH /subtareas/:id/estado

Cambiar estado de subtarea.

**Request Body:**
```json
{
  "estado": "COMPLETADA"
}
```

---

### GET /tareas/:tareaId/subtareas

Listar subtareas de una tarea.

---

## Daily Meetings

### GET /daily-meetings

Listar daily meetings.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| sprintId | number | Filtrar por sprint |
| fecha | date | Filtrar por fecha |

---

### POST /daily-meetings

Crear daily meeting.

**Request Body:**
```json
{
  "sprintId": 1,
  "fecha": "2025-01-08",
  "horaInicio": "09:00",
  "horaFin": "09:15",
  "notas": "Daily del dia 3 del sprint"
}
```

---

### GET /daily-meetings/:id

Obtener daily meeting con participantes.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fecha": "2025-01-08",
    "horaInicio": "09:00",
    "horaFin": "09:15",
    "notas": "Daily del dia 3 del sprint",
    "sprint": {
      "id": 1,
      "nombre": "Sprint 1"
    },
    "participantes": [
      {
        "id": 1,
        "usuario": {
          "id": 6,
          "nombre": "Desarrollador"
        },
        "queHiceAyer": "Complete el endpoint de login",
        "queHareHoy": "Trabajare en el refresh token",
        "impedimentos": "Ninguno",
        "asistio": true
      }
    ]
  }
}
```

---

### POST /daily-meetings/:id/participantes

Agregar participante a daily meeting.

**Request Body:**
```json
{
  "usuarioId": 6,
  "queHiceAyer": "Complete el endpoint de login",
  "queHareHoy": "Trabajare en el refresh token",
  "impedimentos": "Ninguno"
}
```

---

### PATCH /daily-meetings/:id/participantes/:participanteId

Actualizar participacion.

**Request Body:**
```json
{
  "queHiceAyer": "Complete login y validaciones",
  "queHareHoy": "Implementar refresh token",
  "impedimentos": "Espero respuesta de arquitectura"
}
```

---

### GET /sprints/:sprintId/daily-meetings

Listar daily meetings de un sprint.

---

## Tableros

### GET /tableros

Listar todos los tableros.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| proyectoId | number | Filtrar por proyecto |
| tipo | string | Filtrar por tipo |

---

### POST /tableros

Crear tablero.

**Request Body:**
```json
{
  "nombre": "Tablero Sprint 1",
  "descripcion": "Tablero Kanban para Sprint 1",
  "tipo": "KANBAN",
  "proyectoId": 1,
  "sprintId": 1,
  "columnas": [
    { "nombre": "Por Hacer", "orden": 1 },
    { "nombre": "En Progreso", "orden": 2 },
    { "nombre": "En Revision", "orden": 3 },
    { "nombre": "Completado", "orden": 4 }
  ]
}
```

**Tipos de tablero:** `KANBAN`, `SCRUM`

---

### GET /tableros/:id

Obtener tablero con columnas y tareas.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Tablero Sprint 1",
    "tipo": "KANBAN",
    "columnas": [
      {
        "id": 1,
        "nombre": "Por Hacer",
        "orden": 1,
        "tareas": [
          {
            "id": 3,
            "titulo": "Implementar logout",
            "prioridad": "MEDIA"
          }
        ]
      },
      {
        "id": 2,
        "nombre": "En Progreso",
        "orden": 2,
        "tareas": [
          {
            "id": 2,
            "titulo": "Refresh token",
            "prioridad": "ALTA"
          }
        ]
      },
      {
        "id": 3,
        "nombre": "Completado",
        "orden": 3,
        "tareas": [
          {
            "id": 1,
            "titulo": "Login endpoint",
            "prioridad": "ALTA"
          }
        ]
      }
    ]
  }
}
```

---

### PATCH /tableros/:id/mover-tarea

Mover tarea entre columnas.

**Request Body:**
```json
{
  "tareaId": 2,
  "columnaOrigenId": 2,
  "columnaDestinoId": 3,
  "posicion": 0
}
```

---

### GET /proyectos/:proyectoId/tableros

Listar tableros de un proyecto.

---

# MODULO RRHH

## Personal

### GET /personal

Listar todo el personal.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| divisionId | number | Filtrar por division |
| cargo | string | Filtrar por cargo |
| activo | boolean | Filtrar por estado |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuarioId": 6,
      "usuario": {
        "id": 6,
        "nombre": "Desarrollador",
        "email": "desarrollador@inei.gob.pe"
      },
      "cargo": "Desarrollador Senior",
      "division": {
        "id": 2,
        "nombre": "Division de Sistemas"
      },
      "fechaIngreso": "2024-01-15",
      "activo": true
    }
  ]
}
```

---

### POST /personal

Registrar personal.

**Request Body:**
```json
{
  "usuarioId": 6,
  "cargo": "Desarrollador Senior",
  "divisionId": 2,
  "fechaIngreso": "2024-01-15",
  "salario": 5000,
  "tipoContrato": "INDEFINIDO"
}
```

---

### GET /personal/:id

Obtener personal con habilidades y asignaciones.

---

### PATCH /personal/:id

Actualizar personal.

---

## Divisiones

### GET /divisiones

Listar todas las divisiones.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "DG",
      "nombre": "Direccion General",
      "descripcion": "Alta direccion",
      "jefeId": 1,
      "activo": true
    },
    {
      "id": 2,
      "codigo": "DSI",
      "nombre": "Division de Sistemas",
      "descripcion": "Area de desarrollo de software",
      "jefeId": 3,
      "divisionPadreId": 1,
      "activo": true
    }
  ]
}
```

---

### POST /divisiones

Crear division.

**Request Body:**
```json
{
  "codigo": "DSI",
  "nombre": "Division de Sistemas",
  "descripcion": "Area de desarrollo de software",
  "jefeId": 3,
  "divisionPadreId": 1
}
```

---

### GET /divisiones/:id

Obtener division con personal.

---

## Habilidades

### GET /habilidades

Listar todas las habilidades.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "TypeScript",
      "categoria": "PROGRAMACION",
      "descripcion": "Lenguaje de programacion"
    },
    {
      "id": 2,
      "nombre": "NestJS",
      "categoria": "FRAMEWORK",
      "descripcion": "Framework backend"
    }
  ]
}
```

---

### POST /habilidades

Crear habilidad.

**Request Body:**
```json
{
  "nombre": "TypeScript",
  "categoria": "PROGRAMACION",
  "descripcion": "Lenguaje de programacion tipado"
}
```

**Categorias:** `PROGRAMACION`, `FRAMEWORK`, `BASE_DATOS`, `DEVOPS`, `SOFT_SKILL`, `OTRO`

---

### POST /personal/:id/habilidades

Asignar habilidad a personal.

**Request Body:**
```json
{
  "habilidadId": 1,
  "nivel": "AVANZADO",
  "aniosExperiencia": 3
}
```

**Niveles:** `BASICO`, `INTERMEDIO`, `AVANZADO`, `EXPERTO`

---

### GET /personal/:id/habilidades

Listar habilidades de un personal.

---

## Asignaciones

### GET /asignaciones

Listar todas las asignaciones.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| personalId | number | Filtrar por personal |
| proyectoId | number | Filtrar por proyecto |
| activo | boolean | Solo asignaciones activas |

---

### POST /asignaciones

Crear asignacion de personal a proyecto.

**Request Body:**
```json
{
  "personalId": 1,
  "proyectoId": 1,
  "rol": "DESARROLLADOR",
  "porcentajeDedicacion": 100,
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-06-30"
}
```

---

### GET /proyectos/:proyectoId/equipo

Listar equipo asignado a un proyecto.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "personal": {
        "id": 1,
        "usuario": {
          "nombre": "Desarrollador",
          "email": "desarrollador@inei.gob.pe"
        },
        "cargo": "Desarrollador Senior"
      },
      "rol": "DESARROLLADOR",
      "porcentajeDedicacion": 100,
      "fechaInicio": "2025-01-01",
      "fechaFin": "2025-06-30"
    }
  ]
}
```

---

# MODULO NOTIFICACIONES

### GET /notificaciones

Listar notificaciones del usuario actual.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| leida | boolean | Filtrar por estado |
| tipo | string | Filtrar por tipo |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "TAREA_ASIGNADA",
      "titulo": "Nueva tarea asignada",
      "mensaje": "Se te ha asignado la tarea 'Implementar login'",
      "leida": false,
      "metadata": {
        "tareaId": 1,
        "proyectoId": 1
      },
      "createdAt": "2025-01-08T10:00:00.000Z"
    }
  ]
}
```

---

### PATCH /notificaciones/:id/leer

Marcar notificacion como leida.

**Response 200:**
```json
{
  "success": true,
  "message": "Notificacion marcada como leida"
}
```

---

### PATCH /notificaciones/leer-todas

Marcar todas las notificaciones como leidas.

---

### DELETE /notificaciones/:id

Eliminar notificacion.

---

### GET /notificaciones/no-leidas/count

Obtener contador de notificaciones no leidas.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

# MODULO DASHBOARD

### GET /dashboard/general

Obtener metricas generales del sistema.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "proyectos": {
      "total": 15,
      "enProgreso": 8,
      "completados": 5,
      "pausados": 2
    },
    "tareas": {
      "total": 150,
      "pendientes": 45,
      "enProgreso": 35,
      "completadas": 70
    },
    "sprints": {
      "activos": 3,
      "velocidadPromedio": 35
    },
    "equipo": {
      "totalPersonas": 20,
      "asignadas": 18
    }
  }
}
```

---

### GET /dashboard/proyecto/:id

Obtener metricas de un proyecto especifico.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "proyecto": {
      "id": 1,
      "nombre": "SIGP",
      "estado": "EN_PROGRESO",
      "avance": 45.5
    },
    "tareas": {
      "total": 50,
      "porEstado": {
        "PENDIENTE": 15,
        "EN_PROGRESO": 12,
        "COMPLETADA": 23
      }
    },
    "sprints": {
      "total": 5,
      "actual": {
        "id": 3,
        "nombre": "Sprint 3",
        "avance": 60
      }
    },
    "burndown": {
      "diasRestantes": 5,
      "puntosRestantes": 20
    },
    "equipo": {
      "miembros": 8,
      "cargaTrabajo": [
        { "nombre": "Desarrollador 1", "tareasAsignadas": 5 },
        { "nombre": "Desarrollador 2", "tareasAsignadas": 4 }
      ]
    }
  }
}
```

---

### GET /dashboard/actividad/:id

Obtener metricas de una actividad.

---

### GET /dashboard/oei/:id

Obtener metricas de un OEI.

---

# MODULO STORAGE

### POST /storage/upload/request-url

Solicitar URL presignada para subir archivo.

**Request Body:**
```json
{
  "fileName": "documento.pdf",
  "contentType": "application/pdf",
  "folder": "documentos"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "uploadId": "abc123",
    "uploadUrl": "https://minio.example.com/sigp/documentos/abc123-documento.pdf?X-Amz-...",
    "expiresIn": 3600,
    "fileKey": "documentos/abc123-documento.pdf"
  }
}
```

---

### POST /storage/upload/confirm

Confirmar subida de archivo.

**Request Body:**
```json
{
  "uploadId": "abc123",
  "fileKey": "documentos/abc123-documento.pdf"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "documento.pdf",
    "url": "https://minio.example.com/sigp/documentos/abc123-documento.pdf",
    "contentType": "application/pdf",
    "tamano": 245678
  },
  "message": "Archivo confirmado exitosamente"
}
```

---

### GET /storage/download/:fileKey

Obtener URL presignada para descargar archivo.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://minio.example.com/sigp/documentos/abc123-documento.pdf?X-Amz-...",
    "expiresIn": 3600
  }
}
```

---

### DELETE /storage/files/:fileKey

Eliminar archivo.

---

### GET /storage/files

Listar archivos.

**Query Parameters:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| folder | string | Filtrar por carpeta |
| contentType | string | Filtrar por tipo |

---

# CODIGOS DE ERROR HTTP

| Codigo | Significado | Descripcion |
|--------|-------------|-------------|
| 200 | OK | Operacion exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada invalidos |
| 401 | Unauthorized | Token invalido o expirado |
| 403 | Forbidden | Sin permisos para esta operacion |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email duplicado) |
| 422 | Unprocessable Entity | Validacion fallida |
| 500 | Internal Server Error | Error del servidor |

## Formato de Error

```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "statusCode": 400,
  "details": {
    "field": ["mensaje de validacion"]
  }
}
```

---

# PAGINACION

Todos los endpoints que retornan listas soportan paginacion:

**Query Parameters:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| page | number | 1 | Numero de pagina |
| limit | number | 10 | Items por pagina (max 100) |

**Formato de respuesta paginada:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "meta": {
      "totalItems": 100,
      "itemCount": 10,
      "itemsPerPage": 10,
      "totalPages": 10,
      "currentPage": 1
    }
  }
}
```

---

# FILTROS COMUNES

## Busqueda de texto
```
GET /proyectos?search=SIGP
```

## Filtro por fecha
```
GET /tareas?fechaInicio=2025-01-01&fechaFin=2025-01-31
```

## Filtro por estado
```
GET /tareas?estado=EN_PROGRESO
```

## Ordenamiento
```
GET /proyectos?sortBy=createdAt&sortOrder=DESC
```

---

# FLUJO DE AUTENTICACION FRONTEND

## 1. Login
```javascript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await response.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

## 2. Peticiones autenticadas
```javascript
const response = await fetch('/api/v1/proyectos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
});
```

## 3. Refresh token (cuando expira)
```javascript
const response = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});
const { data } = await response.json();
localStorage.setItem('accessToken', data.accessToken);
```

## 4. Logout
```javascript
await fetch('/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

---

# EJEMPLO: FLUJO KANBAN COMPLETO

## 1. Obtener tablero Kanban de actividad
```javascript
const tablero = await fetch('/api/v1/actividades/1/tablero-kanban', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 2. Crear nueva tarea
```javascript
const tarea = await fetch('/api/v1/tareas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Nueva tarea',
    actividadId: 1,
    prioridad: 'ALTA',
    asignadoId: 6
  })
});
```

## 3. Mover tarea a "En Progreso"
```javascript
await fetch('/api/v1/tareas/1/estado', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estado: 'EN_PROGRESO'
  })
});
```

## 4. Agregar evidencia
```javascript
await fetch('/api/v1/tareas/1/evidencias', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Captura de prueba',
    url: 'https://storage.example.com/evidencia.png',
    tipo: 'imagen'
  })
});
```

## 5. Completar tarea
```javascript
await fetch('/api/v1/tareas/1/estado', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estado: 'COMPLETADA',
    horasReales: 4
  })
});
```

---

*Documento generado el 2025-12-15*
*Version: 2.0*
*Total de endpoints documentados: 250+*
