# MATRIZ DE PERMISOS - SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Matriz Completa de Permisos por Rol
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## TABLA DE CONTENIDOS

1. [Definicion de Roles](#1-definicion-de-roles)
2. [Jerarquia de Roles](#2-jerarquia-de-roles)
3. [Matriz General por Modulo](#3-matriz-general-por-modulo)
4. [Permisos Detallados - Modulo PGD](#4-permisos-detallados---modulo-pgd)
5. [Permisos Detallados - Modulo POI](#5-permisos-detallados---modulo-poi)
6. [Permisos Detallados - Modulo Agile](#6-permisos-detallados---modulo-agile)
7. [Permisos Detallados - Modulo RRHH](#7-permisos-detallados---modulo-rrhh)
8. [Permisos Detallados - Notificaciones](#8-permisos-detallados---notificaciones)
9. [Permisos Detallados - Dashboard](#9-permisos-detallados---dashboard)
10. [Reglas de Negocio de Permisos](#10-reglas-de-negocio-de-permisos)

---

## 1. DEFINICION DE ROLES

### 1.1. Roles del Sistema

| Codigo | Rol | Nivel | Descripcion |
|--------|-----|-------|-------------|
| `ADMIN` | Administrador | 100 | Super usuario con acceso total al sistema |
| `PMO` | Project Management Office | 90 | Responsable de planificacion estrategica y supervision |
| `COORDINADOR` | Coordinador | 80 | Supervisa SM y gestiona proyectos/actividades |
| `SCRUM_MASTER` | Scrum Master | 70 | Gestiona proyectos con metodologia Scrum |
| `PATROCINADOR` | Patrocinador | 60 | Sponsor del proyecto, aprueba actas de constitucion |
| `DESARROLLADOR` | Desarrollador | 50 | Ejecuta tareas en proyectos (Scrum) |
| `IMPLEMENTADOR` | Implementador | 50 | Ejecuta tareas en actividades (Kanban) |

### 1.2. Abreviaturas de Permisos

| Simbolo | Significado |
|---------|-------------|
| C | Create (Crear) |
| R | Read (Leer/Ver) |
| U | Update (Actualizar) |
| D | Delete (Eliminar) |
| A | Approve (Aprobar) |
| - | Sin acceso |
| * | Acceso total |
| ~ | Acceso limitado (ver notas) |

---

## 2. JERARQUIA DE ROLES

```
                         +-----------+
                         |   ADMIN   | Nivel 100
                         |  (Total)  |
                         +-----+-----+
                               |
                         +-----+-----+
                         |    PMO    | Nivel 90
                         |(Estrategico)
                         +-----+-----+
                               |
             +-----------------+-----------------+
             |                                   |
       +-----+-----+                       +-----+-----+
       |COORDINADOR| Nivel 80              |PATROCINADOR| Nivel 60
       | (Tactico) |                       | (Sponsor)  |
       +-----+-----+                       +-----------+
             |
       +-----+-----+
       |SCRUM_MASTER| Nivel 70
       | (Operativo)|
       +-----+-----+
             |
     +-------+-------+
     |               |
+----+----+    +-----+-----+
|DESARROLLADOR|  |IMPLEMENTADOR| Nivel 50
|(Proyectos) |  |(Actividades)|
+-----------+  +-------------+
```

### 2.1. Reglas de Jerarquia

1. Un rol superior puede realizar acciones de roles inferiores
2. El ADMIN tiene todos los permisos de todos los roles
3. El PMO tiene permisos de COORDINADOR + funciones estrategicas
4. El COORDINADOR puede supervisar SCRUM_MASTERS
5. El DESARROLLADOR e IMPLEMENTADOR son equivalentes en nivel pero en contextos diferentes

---

## 3. MATRIZ GENERAL POR MODULO

### 3.1. Acceso a Modulos

| Modulo | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| **Administracion** | * | - | - | - | - | - | - |
| **PGD** | * | CRUD | - | - | - | - | - |
| **POI - Proyectos** | * | CRUD+A | CRUD | CRUD | R+A | R~ | - |
| **POI - Actividades** | * | CRUD+A | CRUD | R | - | - | R~ |
| **Agile - Scrum** | * | R | CRUD | CRUD | - | R~ | - |
| **Agile - Kanban** | * | R | CRUD | - | - | - | R~ |
| **RRHH** | * | R | R | R | - | - | - |
| **Notificaciones** | * | R | R | R | R | R | R |
| **Dashboard** | * | R | R | R | - | R~ | R~ |

### 3.2. Sidebar/Menu de Navegacion

| Elemento | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|----------|-------|-----|-------|-----|---------|-----|------|
| Administracion | Si | - | - | - | - | - | - |
| PGD | Si | Si | - | - | - | - | - |
| POI | Si | Si | Si | Si | Si | Si | Si |
| Recursos Humanos | Si | Si | Si | Si | - | - | - |
| Notificaciones | Si | Si | Si | Si | Si | - | - |
| Dashboard | Si | Si | Si | Si | - | - | - |

---

## 4. PERMISOS DETALLADOS - MODULO PGD

### 4.1. Plan de Gobierno Digital

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar PGDs | * | R | - | - | - | - | - |
| Ver PGD | * | R | - | - | - | - | - |
| Crear PGD | * | C | - | - | - | - | - |
| Editar PGD | * | U | - | - | - | - | - |
| Eliminar PGD | * | D | - | - | - | - | - |
| Ver Dashboard PGD | * | R | - | - | - | - | - |

### 4.2. OEI / OGD / OEGD / AE

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | - | - | - | - | - |
| Ver detalle | * | R | - | - | - | - | - |
| Crear | * | C | - | - | - | - | - |
| Editar | * | U | - | - | - | - | - |
| Eliminar | * | D | - | - | - | - | - |

---

## 5. PERMISOS DETALLADOS - MODULO POI

### 5.1. Proyectos

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar proyectos | * | R(todos) | R(asignados) | R(asignados) | R(asignados) | R(asignados) | - |
| Ver detalles | * | R | R | R | R | - | - |
| Crear proyecto | * | C | - | - | - | - | - |
| Editar proyecto | * | U | - | - | - | - | - |
| Eliminar proyecto | * | D | - | - | - | - | - |
| Cambiar estado | * | U | - | - | - | - | - |
| Asignar equipo | * | U | - | - | - | - | - |

### 5.2. Subproyectos

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | R | - | - |
| Crear | * | C | - | - | - | - | - |
| Editar | * | U | U | - | - | - | - |
| Eliminar | * | D | - | - | - | - | - |

### 5.3. Documentos de Proyecto

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar documentos | * | R | R | R | R | - | - |
| Ver documento | * | R | R | R | R | - | - |
| Subir documento | * | C | C | C | - | - | - |
| Editar documento | * | U | U | U | - | - | - |
| Eliminar documento | * | D | D | D | - | - | - |
| **Aprobar documento** | * | A | - | - | - | - | - |
| Descargar documento | * | R | R | R | R | - | - |

### 5.4. Actas

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar actas | * | R | R | R | R | - | - |
| Crear acta de reunion | * | C | C | C | - | - | - |
| Crear acta constitucion | * | C | C | C | - | - | - |
| Editar acta | * | U | U | U | - | - | - |
| Eliminar acta | * | D | D | D | - | - | - |
| **Aprobar acta reunion** | * | A | - | - | - | - | - |
| **Aprobar acta constitucion** | * | A | - | - | A | - | - |
| Generar PDF | * | R | R | R | R | - | - |

> **Nota:** El Acta de Constitucion requiere aprobacion de PMO Y Patrocinador

### 5.5. Requerimientos

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | R | - | - |
| Crear | * | C | C | C | - | - | - |
| Editar | * | U | U | U | - | - | - |
| Eliminar | * | D | D | D | - | - | - |
| Vincular a HU | * | U | U | U | - | - | - |

> **Nota:** Los requerimientos se crean manualmente. No existe importacion automatica desde actas.

### 5.6. Cronograma

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Ver cronograma | * | R | R | R | R | - | - |
| Crear cronograma | * | C | C | C | - | - | - |
| Editar cronograma | * | U | U | U | - | - | - |
| Eliminar cronograma | * | D | D | D | - | - | - |
| Exportar | * | R | R | R | R | - | - |
| **Aprobar cronograma** | * | A | - | - | - | - | - |

### 5.7. Informes de Sprint

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | - | - |
| Generar informe | * | C | - | C | - | - | - |
| Editar informe | * | U | - | U | - | - | - |
| Enviar a revision | * | U | - | U | - | - | - |
| **Aprobar (Coordinador)** | * | - | A | - | - | - | - |
| **Aprobar (PMO)** | * | A | - | - | - | - | - |
| Rechazar | * | A | A | - | - | - | - |
| Descargar | * | R | R | R | - | - | - |

### 5.8. Actividades

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R(todos) | R(asignadas) | R | - | - | R(asignadas) |
| Ver detalles | * | R | R | R | - | - | R |
| Crear | * | C | - | - | - | - | - |
| Editar | * | U | U | - | - | - | - |
| Eliminar | * | D | - | - | - | - | - |

### 5.9. Informes de Actividad

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | - | - | - | R |
| Crear | * | C | C | - | - | - | - |
| Editar | * | U | U | - | - | - | - |
| Eliminar | * | D | D | - | - | - | - |
| **Aprobar** | * | A | - | - | - | - | - |

---

## 6. PERMISOS DETALLADOS - MODULO AGILE

### 6.1. Epicas

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | R | - |
| Ver detalle | * | R | R | R | - | R | - |
| Crear | * | - | C | C | - | - | - |
| Editar | * | - | U | U | - | - | - |
| Eliminar | * | - | D | D | - | - | - |
| Ver estadisticas | * | R | R | R | - | R | - |

### 6.2. Sprints

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | R | - |
| Ver detalle | * | R | R | R | - | R | - |
| Crear sprint | * | - | C | C | - | - | - |
| Editar sprint | * | - | U | U | - | - | - |
| Eliminar sprint | * | - | D | D | - | - | - |
| **Iniciar sprint** | * | - | U | U | - | - | - |
| **Cerrar sprint** | * | - | U | U | - | - | - |
| Ver burndown | * | R | R | R | - | R | - |
| Ver metricas | * | R | R | R | - | R | - |

### 6.3. Historias de Usuario

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | R | - |
| Ver detalle | * | R | R | R | - | R | - |
| Crear HU | * | - | C | C | - | - | - |
| Editar HU | * | - | U | U | - | - | - |
| Eliminar HU | * | - | D | D | - | - | - |
| **Cambiar estado** | * | - | U | U | - | U~ | - |
| Asignar a sprint | * | - | U | U | - | - | - |
| Asignar persona | * | - | U | U | - | - | - |
| Reordenar backlog | * | - | U | U | - | - | - |
| Agregar criterios | * | - | C | C | - | - | - |
| Vincular requerimiento | * | - | U | U | - | - | - |
| Agregar dependencia | * | - | U | U | - | - | - |

> **DEV~:** El desarrollador solo puede cambiar el estado de HUs asignadas a el (Por hacer → En progreso → En revision)

### 6.4. Tareas (Scrum)

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | R | - |
| Ver detalle | * | R | R | R | - | R | - |
| **Crear tarea** | * | - | C | C | - | C | - |
| **Editar tarea** | * | - | U | U | - | U~ | - |
| Eliminar tarea | * | - | D | D | - | - | - |
| Cambiar estado | * | - | U | U | - | U~ | - |
| Subir evidencia | * | - | U | U | - | U | - |
| **Validar tarea** | * | - | A | A | - | - | - |

> **DEV~:** Solo puede editar tareas asignadas a el

### 6.5. Tareas (Kanban)

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | - | - | - | R |
| Ver detalle | * | R | R | - | - | - | R |
| **Crear tarea** | * | - | C | - | - | - | - |
| **Editar tarea** | * | - | U | - | - | - | U~ |
| Eliminar tarea | * | - | D | - | - | - | - |
| Cambiar estado | * | - | U | - | - | - | U~ |
| Mover en tablero | * | - | U | - | - | - | U~ |

> **IMPL~:** Solo puede editar/mover tareas asignadas a el

### 6.6. Subtareas (Solo Kanban)

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | - | - | - | R |
| Ver detalle | * | R | R | - | - | - | R |
| **Crear subtarea** | * | - | C | - | - | - | C |
| **Editar subtarea** | * | - | U | - | - | - | U~ |
| Eliminar subtarea | * | - | D | - | - | - | - |
| Cambiar estado | * | - | U | - | - | - | U |
| Subir evidencia | * | - | U | - | - | - | U |
| **Validar subtarea** | * | - | A | - | - | - | - |

### 6.7. Tablero

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Ver tablero Scrum | * | R | R | R | - | R | - |
| Ver tablero Kanban | * | R | R | - | - | - | R |
| **Drag & Drop Scrum** | * | - | U | U | - | - | - |
| **Drag & Drop Kanban** | * | - | U | - | - | - | - |
| Filtrar | * | R | R | R | - | R | R |

> **Nota:** Los desarrolladores e implementadores ven el tablero pero no pueden hacer drag & drop

### 6.8. Daily Meeting

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | R | R |
| Ver detalle | * | R | R | R | - | R | R |
| **Crear daily** | * | - | C | C | - | - | - |
| Editar daily | * | - | U | U | - | - | - |
| Eliminar daily | * | - | D | D | - | - | - |
| Agregar participacion | * | - | U | U | - | U | U |

---

## 7. PERMISOS DETALLADOS - MODULO RRHH

### 7.1. Personal

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar personal | * | R | R | R | - | - | - |
| Ver detalle | * | R | R | R | - | - | - |
| Crear | * | - | - | - | - | - | - |
| Editar | * | - | - | - | - | - | - |
| Eliminar | * | - | - | - | - | - | - |
| Ver disponibilidad | * | R | R | R | - | - | - |

### 7.2. Divisiones

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | - | - |
| CRUD | * | - | - | - | - | - | - |

### 7.3. Habilidades

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | - | - |
| CRUD | * | - | - | - | - | - | - |

### 7.4. Asignaciones

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar | * | R | R | R | - | - | - |
| Crear | * | - | C | - | - | - | - |
| Editar | * | - | U | U~ | - | - | - |
| Eliminar | * | - | D | - | - | - | - |

> **SM~:** El Scrum Master solo puede editar el porcentaje de dedicacion de los desarrolladores de sus proyectos
> **Nota:** PMO asigna el Coordinador al proyecto, el Coordinador asigna el equipo (SM, desarrolladores, implementadores) con % de dedicacion

---

## 8. PERMISOS DETALLADOS - NOTIFICACIONES

### 8.1. Tipos de Notificacion por Rol

| Tipo | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|------|-------|-----|-------|-----|---------|-----|------|
| Proyectos | Si | Si | Si | Si | Si | - | - |
| Sprints | Si | Si | Si | Si | - | - | - |
| Retrasos | Si | Si | Si | Si | - | - | - |
| Aprobaciones | Si | Si | Si | Si | Si | - | - |
| Tareas | Si | Si | Si | Si | - | Si | Si |

### 8.2. Acciones

| Accion | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|--------|-------|-----|-------|-----|---------|-----|------|
| Listar propias | * | R | R | R | R | R | R |
| Marcar leida | * | U | U | U | U | U | U |
| Configurar preferencias | * | U | U | U | U | U | U |

---

## 9. PERMISOS DETALLADOS - DASHBOARD

| Vista | ADMIN | PMO | COORD | SM | SPONSOR | DEV | IMPL |
|-------|-------|-----|-------|-----|---------|-----|------|
| Dashboard general | * | R | R | R | - | - | - |
| Dashboard proyecto | * | R | R(asignados) | R(asignados) | - | R(asignados) | - |
| Dashboard actividad | * | R | R(asignadas) | - | - | - | R(asignadas) |
| Avance OEI | * | R | - | - | - | - | - |
| Metricas globales | * | R | R | - | - | - | - |

---

## 10. REGLAS DE NEGOCIO DE PERMISOS

### 10.1. Reglas de Alcance

1. **Proyectos asignados:** SM, COORD, DEV solo ven proyectos donde estan asignados
2. **Actividades asignadas:** COORD, IMPL solo ven actividades donde estan asignados
3. **Tareas propias:** DEV/IMPL solo pueden editar tareas asignadas a ellos

### 10.2. Reglas de Aprobacion

1. **Documentos de proyecto:** Solo PMO puede aprobar
2. **Acta de Constitucion:** Requiere aprobacion de PMO Y Patrocinador
3. **Informe de Sprint:** SM envia → Coordinador aprueba → PMO aprueba
4. **Informe de Actividad:** Solo PMO puede aprobar

### 10.3. Reglas de Creacion

1. **Proyectos/Actividades:** Solo ADMIN y PMO pueden crear
2. **Subproyectos:** ADMIN, PMO (COORD puede editar pero no crear)
3. **Epicas/Sprints/HU:** SM y COORDINADOR
4. **Tareas Scrum:** SM, COORDINADOR, DESARROLLADOR
5. **Tareas Kanban:** Solo COORDINADOR
6. **Subtareas:** COORDINADOR, IMPLEMENTADOR

### 10.4. Reglas de Tablero

1. **Drag & Drop Scrum:** Solo SM y COORDINADOR
2. **Drag & Drop Kanban:** Solo COORDINADOR
3. **Vista sin edicion:** DEV ve tablero Scrum, IMPL ve tablero Kanban

### 10.5. Reglas de Validacion

1. **Tareas Scrum:** SM valida las tareas finalizadas
2. **Subtareas Kanban:** COORDINADOR valida las subtareas finalizadas
3. **Evidencia obligatoria:** Toda tarea/subtarea requiere evidencia antes de finalizar

### 10.6. Reglas Especiales

1. **Un solo sprint activo:** No puede haber mas de un sprint activo por proyecto
2. **Dependencias de HU:** No se puede iniciar una HU si tiene dependencias pendientes
3. **Documentacion obligatoria:** No se puede pasar proyecto a "En desarrollo" sin docs obligatorios
4. **Coordinador vs SM:** El Coordinador puede supervisar varios SM y tiene alcance en proyectos Y actividades

---

## RESUMEN DE PERMISOS CLAVE

| Accion Critica | Rol Minimo |
|----------------|------------|
| Crear proyecto | PMO |
| Aprobar documento | PMO |
| Aprobar acta constitucion | PMO + PATROCINADOR |
| Crear HU | SCRUM_MASTER |
| Validar tarea | SCRUM_MASTER |
| Crear tarea en proyecto | DESARROLLADOR |
| Crear subtarea en actividad | IMPLEMENTADOR |
| Iniciar/cerrar sprint | SCRUM_MASTER |
| Ver dashboard general | COORDINADOR |
| Gestionar usuarios | ADMIN |

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Matriz de Permisos v1.0*
