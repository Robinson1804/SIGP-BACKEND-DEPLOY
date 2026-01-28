# MODULOS FUNCIONALES - SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Descripcion de Modulos Funcionales
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## TABLA DE CONTENIDOS

1. [Mapa de Modulos](#1-mapa-de-modulos)
2. [Modulo PGD (Planificacion Estrategica)](#2-modulo-pgd-planificacion-estrategica)
3. [Modulo POI (Plan Operativo)](#3-modulo-poi-plan-operativo)
4. [Modulo Agile](#4-modulo-agile)
5. [Modulo RRHH](#5-modulo-rrhh)
6. [Modulo Notificaciones](#6-modulo-notificaciones)
7. [Modulo Dashboard](#7-modulo-dashboard)
8. [Modulo Administracion](#8-modulo-administracion)

---

## 1. MAPA DE MODULOS

```
SISTEMA SIGP
|
+-- ADMINISTRACION (Solo Admin)
|   +-- Gestion de Usuarios
|   +-- Roles y Permisos
|   +-- Configuracion del Sistema
|   +-- Logs de Auditoria
|
+-- PGD (Admin, PMO)
|   +-- Plan de Gobierno Digital
|   +-- OEI (Objetivos Estrategicos Institucionales)
|   +-- OGD (Objetivos de Gobierno Digital)
|   +-- OEGD (Objetivos Especificos)
|   +-- Acciones Estrategicas
|
+-- POI (Todos con variaciones)
|   +-- PROYECTOS (Scrum)
|   |   +-- Detalles y Progreso
|   |   +-- Documentos por Fases
|   |   +-- Actas (Reunion/Constitucion)
|   |   +-- Requerimientos (RF/RNF)
|   |   +-- Cronograma
|   |   +-- Backlog Agil
|   |   +-- Informes de Sprint
|   |
|   +-- ACTIVIDADES (Kanban)
|       +-- Detalles
|       +-- Tareas y Subtareas
|       +-- Tablero Kanban
|       +-- Informes de Actividad
|
+-- RECURSOS HUMANOS (Admin, PMO, Coord, SM)
|   +-- Personal
|   +-- Divisiones
|   +-- Habilidades
|   +-- Asignaciones
|
+-- NOTIFICACIONES (Segun rol)
|   +-- Proyectos
|   +-- Sprints
|   +-- Retrasos
|   +-- Aprobaciones
|
+-- DASHBOARD (Admin, PMO, Coord)
    +-- Vista General
    +-- Por Proyecto
    +-- Por OEI
```

---

## 2. MODULO PGD (PLANIFICACION ESTRATEGICA)

### 2.1. Proposito

Permite gestionar el Plan de Gobierno Digital y su jerarquia de objetivos, estableciendo la base estrategica para todos los proyectos y actividades del POI.

### 2.2. Usuarios

| Rol | Acceso |
|-----|--------|
| Admin | CRUD completo |
| PMO | CRUD completo |
| Otros | Sin acceso |

### 2.3. Funcionalidades

#### 2.3.1. Gestion de PGD

- **Crear PGD:** Definir un nuevo Plan de Gobierno Digital
  - Nombre del plan
  - Descripcion
  - Rango de 4 años (obligatorio)
  - Estado: Activo/Inactivo/Finalizado

- **Listar PGDs:** Vista de todos los planes
  - Filtros: Estado, Año
  - Ordenamiento: Fecha, Nombre

- **Editar PGD:** Modificar datos del plan
- **Eliminar PGD:** Soft delete (si no tiene dependencias)

#### 2.3.2. Gestion de OEI

- **Crear OEI:** Objetivo Estrategico Institucional
  - Codigo unico (OEI-XX)
  - Nombre y descripcion
  - Indicador de medicion
  - Metas anuales (para cada año del PGD)

- **Vincular:** Cada OEI pertenece a un PGD

#### 2.3.3. Gestion de OGD

- **Crear OGD:** Objetivo de Gobierno Digital
  - Similar estructura a OEI
  - Pertenece al mismo PGD

#### 2.3.4. Gestion de OEGD

- **Crear OEGD:** Objetivo Especifico
  - Vinculado a un OGD padre
  - Codigo, nombre, descripcion

#### 2.3.5. Gestion de Acciones Estrategicas

- **Crear AE:** Accion Estrategica
  - Vinculada a un OEGD padre
  - Es el nivel que conecta con los proyectos/actividades

### 2.4. Flujo de Navegacion

```
PGD (Lista)
    |
    +-- Crear PGD
    |
    +-- Ver PGD (Detalle)
            |
            +-- Tab OEIs
            |       +-- Crear OEI
            |       +-- Lista OEIs
            |
            +-- Tab OGDs
            |       +-- Crear OGD
            |       +-- Lista OGDs
            |               |
            |               +-- Ver OGD -> OEGDs
            |                       |
            |                       +-- Ver OEGD -> AEs
            |
            +-- Tab Dashboard
                    +-- Avance por objetivo
                    +-- Proyectos vinculados
```

### 2.5. Pantallas Principales

| Pantalla | Descripcion |
|----------|-------------|
| `/pgd` | Lista de PGDs con cards |
| `/pgd/:id` | Detalle de PGD con tabs |
| `/pgd/:id/oei` | Lista de OEIs del PGD |
| `/pgd/:id/ogd` | Lista de OGDs del PGD |
| `/pgd/:id/ogd/:ogdId/oegd` | OEGDs de un OGD |
| `/pgd/:id/oegd/:oegdId/ae` | AEs de un OEGD |

---

## 3. MODULO POI (PLAN OPERATIVO)

### 3.1. Proposito

Gestiona la ejecucion operativa a traves de Proyectos (metodologia Scrum) y Actividades (metodologia Kanban).

### 3.2. Usuarios y Acceso

| Rol | Proyectos | Actividades |
|-----|-----------|-------------|
| Admin | CRUD + Aprobar | CRUD + Aprobar |
| PMO | CRUD + Aprobar | CRUD + Aprobar |
| Coordinador | Gestion completa | Gestion completa |
| Scrum Master | Gestion completa | Solo vista |
| Patrocinador | Vista + Aprobar Actas | - |
| Desarrollador | Backlog (limitado) | - |
| Implementador | - | Tablero (limitado) |

### 3.3. Submodulo: Proyectos

#### 3.3.1. Detalles del Proyecto

- **Informacion General**
  - Codigo, nombre, descripcion
  - Clasificacion (Al ciudadano / Gestion interna)
  - Accion Estrategica vinculada
  - Equipo asignado (SM, Coordinador, Patrocinador)
  - Fechas y monto

- **Progreso General**
  - % de avance calculado
  - HUs completadas / total
  - Story points completados / total

- **Progreso por Sprints**
  - Lista de sprints con metricas
  - Velocidad por sprint

#### 3.3.2. Documentos por Fases

| Fase | Documentos Tipicos |
|------|-------------------|
| Analisis y Planificacion | Acta de Constitucion, Plan de trabajo |
| Diseño | Arquitectura, Mockups, Diseño BD |
| Desarrollo | Documentacion tecnica |
| Pruebas | Plan de pruebas, Resultados |
| Implementacion | Manual usuario, Manual tecnico |
| Mantenimiento | Guia de despliegue |

**Funcionalidades:**
- Subir documento (archivo o link)
- Marcar como obligatorio
- Estados: Pendiente → Aprobado / No Aprobado
- Solo PMO puede aprobar

#### 3.3.3. Actas del Proyecto

**Acta de Reunion:**
- Crear paso a paso (wizard):
  1. Datos generales (fecha, tipo, fase)
  2. Asistentes y ausentes
  3. Agenda
  4. Temas desarrollados
  5. Acuerdos y compromisos
  6. Proximos pasos
  7. Observaciones

- Generar PDF automatico con formato institucional

**Acta de Constitucion:**
- Objetivo SMART
- Alcance / Fuera de alcance
- Entregables
- Riesgos identificados
- Presupuesto estimado
- Requiere aprobacion de PMO y Patrocinador

#### 3.3.4. Requerimientos

- **Tipos:**
  - RF (Requerimientos Funcionales)
  - RNF (Requerimientos No Funcionales)

- **Funcionalidades:**
  - Crear manualmente (todos los requerimientos se ingresan de forma manual)
  - Vincular a Historias de Usuario

#### 3.3.5. Cronograma

- Crear/editar cronograma
- Estructura de fases y tareas
- Dependencias entre tareas
- Ruta critica
- Exportar a Excel/PDF
- Visualizacion Gantt

#### 3.3.6. Backlog Agil

Ver seccion 4 (Modulo Agile)

#### 3.3.7. Informes de Sprint

- **Generacion automatica** al cerrar sprint:
  - Metricas del sprint
  - HUs completadas con evidencias
  - HUs no completadas
  - Impedimentos
  - Lecciones aprendidas

- **Flujo de aprobacion:**
  ```
  SM crea/edita → Envia → Coordinador revisa → PMO aprueba
  ```

### 3.4. Submodulo: Actividades

#### 3.4.1. Detalles de Actividad

- Informacion basica
- Coordinador asignado
- Periodicidad de informes
- Metricas de tareas

#### 3.4.2. Tareas y Subtareas

- **Tareas:** Unidad principal de trabajo
  - Codigo (TAR-XXX)
  - Nombre, descripcion
  - Prioridad
  - Asignado a (max 5)
  - Fechas
  - Subtareas (opcional)

- **Subtareas:** Subdivision de tareas
  - Codigo (SUB-XXX)
  - Hereda responsable de tarea padre
  - Requiere evidencia para finalizar

#### 3.4.3. Tablero Kanban

- Columnas: Por hacer → En progreso → En revision → Completado
- Drag & drop
- Filtros por responsable, prioridad
- Actualizacion en tiempo real (WebSocket)

#### 3.4.4. Informes de Actividad

- Creacion manual segun periodicidad
- Contenido: resumen, tareas completadas/pendientes, observaciones
- Aprobacion directa por PMO

### 3.5. Navegacion POI

```
POI (Lista)
    |
    +-- Tab Proyectos
    |       |
    |       +-- Card Proyecto
    |               |
    |               +-- Tab Detalles
    |               +-- Tab Documentos
    |               +-- Tab Actas
    |               +-- Tab Requerimientos
    |               +-- Tab Cronograma
    |               +-- Tab Backlog
    |                       |
    |                       +-- Sub-tab Backlog
    |                       +-- Sub-tab Tablero
    |                       +-- Sub-tab Daily
    |                       +-- Sub-tab Dashboard
    |
    +-- Tab Actividades
            |
            +-- Card Actividad
                    |
                    +-- Tab Detalles
                    +-- Tab Lista (Tareas)
                    +-- Tab Tablero
                    +-- Tab Informes
                    +-- Tab Dashboard
```

---

## 4. MODULO AGILE

### 4.1. Proposito

Implementa metodologias agiles: Scrum para proyectos y Kanban para actividades.

### 4.2. Componentes Scrum

#### 4.2.1. Epicas

- Agrupacion de HUs por funcionalidad
- Codigo (EP-XXX)
- Color para identificacion visual
- Prioridad y fechas
- Estadisticas de avance

#### 4.2.2. Sprints

- Iteraciones de 2-4 semanas
- Estados: Planificado → Activo → Completado
- Sprint Goal
- Capacidad del equipo
- Solo un sprint activo a la vez

**Flujo del Sprint:**
```
1. Crear Sprint (definir fechas, goal)
2. Asignar HUs al Sprint (Sprint Planning)
3. Iniciar Sprint
4. Ejecutar (Daily, actualizar tablero)
5. Cerrar Sprint (genera informe automatico)
```

#### 4.2.3. Historias de Usuario (HU)

- **Formato:** "Como [rol] quiero [accion] para [beneficio]"
- **Codigo:** US-XXX
- **Prioridad MoSCoW:** Must, Should, Could, Won't
- **Estimacion T-Shirt:** XS, S, M, L, XL, XXL
- **Story Points:** Fibonacci (1,2,3,5,8,13,21)

**Estados:**
```
Pendiente → En analisis → Lista → En desarrollo → En pruebas → En revision → Terminada
```

**Criterios de Aceptacion:**
- Formato Given-When-Then
- Estados: Pendiente, Cumplido, Fallido
- Verificacion por SM

**Dependencias:**
- "Bloqueada por" (critica)
- "Relacionada con" (informativa)

#### 4.2.4. Tareas de HU

- Tareas tecnicas derivadas de la HU
- Sin subtareas (a diferencia de Kanban)
- Requieren evidencia para finalizar
- SM valida las tareas completadas

### 4.3. Componentes Kanban

#### 4.3.1. Tareas de Actividad

- Flujo continuo (sin sprints)
- Pueden tener subtareas
- Tablero visual

#### 4.3.2. Subtareas

- Solo para tareas Kanban
- Mismo flujo de estados
- Validacion por Coordinador

### 4.4. Tablero Visual

#### Scrum (por Sprint)

```
+----------------+----------------+----------------+----------------+
|   POR HACER    |  EN PROGRESO   |  EN REVISION   |  FINALIZADO    |
+----------------+----------------+----------------+----------------+
| [US-001]       | [US-002]       | [US-003]       | [US-004]       |
|  5 SP          |  3 SP          |  8 SP          |  5 SP          |
|  └─ TAR-001    |  └─ TAR-002    |  └─ TAR-003    |  └─ TAR-004    |
|  └─ TAR-002    |     [Juan]     |     [Maria]    |     [Pedro]    |
|                |                |                |                |
+----------------+----------------+----------------+----------------+
```

#### Kanban (por Actividad)

```
+----------------+----------------+----------------+----------------+
|   POR HACER    |  EN PROGRESO   |  EN REVISION   |  COMPLETADO    |
+----------------+----------------+----------------+----------------+
| [TAR-001]      | [TAR-002]      | [TAR-003]      | [TAR-004]      |
|  └─ SUB-001    |  └─ SUB-003    |                |  └─ SUB-006    |
|  └─ SUB-002    |  [Pedro]       |  [Ana]         |  [Carlos]      |
|                |                |                |                |
+----------------+----------------+----------------+----------------+
```

### 4.5. Daily Meeting

- Registro de reuniones diarias
- Tres preguntas clasicas:
  1. ¿Que hice ayer?
  2. ¿Que hare hoy?
  3. ¿Tengo impedimentos?

- Participantes con sus respuestas
- Historial de dailies por sprint/actividad

### 4.6. Metricas Agiles

#### Scrum
- **Velocidad:** SP completados por sprint
- **Burndown:** SP restantes vs tiempo
- **Compromiso:** % de SP completados vs planificados

#### Kanban
- **Lead Time:** Tiempo desde creacion hasta completado
- **Cycle Time:** Tiempo desde "En progreso" hasta completado
- **Throughput:** Tareas completadas por periodo

---

## 5. MODULO RRHH

### 5.1. Proposito

Gestiona el personal disponible para asignar a proyectos y actividades.

### 5.2. Usuarios

| Rol | Acceso |
|-----|--------|
| Admin | CRUD completo |
| PMO | Vista completa |
| Coordinador | Vista de su equipo |
| Scrum Master | Vista de su equipo |

### 5.3. Funcionalidades

#### 5.3.1. Gestion de Personal

- Lista de personal con busqueda
- Datos: nombre, email, cargo, division
- Modalidad: Planilla, CAS, Locador, Practicante
- Horas semanales disponibles
- Usuario vinculado del sistema

#### 5.3.2. Gestion de Divisiones

- Estructura organizacional
- Jerarquia de divisiones
- Jefe asignado

#### 5.3.3. Habilidades

- Catalogo de habilidades
- Categorias: Lenguaje, Framework, BD, Cloud, etc.
- Asignacion a personal con nivel

#### 5.3.4. Asignaciones

- Asignar personal a proyecto/actividad
- Rol en el equipo
- Porcentaje de dedicacion
- Fechas de asignacion

#### 5.3.5. Disponibilidad

- Calculo automatico de disponibilidad
- Alertas de sobrecarga
- Vista de ocupacion

### 5.4. Pantallas

| Pantalla | Descripcion |
|----------|-------------|
| `/recursos-humanos` | Lista de personal |
| `/recursos-humanos/:id` | Detalle de persona |
| `/recursos-humanos/divisiones` | Estructura org |
| `/recursos-humanos/habilidades` | Catalogo |

---

## 6. MODULO NOTIFICACIONES

### 6.1. Proposito

Mantiene informados a los usuarios sobre eventos relevantes del sistema.

### 6.2. Tipos de Notificacion

| Tipo | Descripcion | Roles |
|------|-------------|-------|
| Proyectos | Nuevo proyecto asignado, cambios de estado | PMO, SM, Coord |
| Sprints | Sprint iniciado/finalizado, asignaciones | PMO, SM, Coord |
| Retrasos | Tareas/HUs atrasadas | PMO, SM, Coord |
| Aprobaciones | Documentos pendientes de aprobar | PMO, Sponsor |
| Tareas | Tareas asignadas, cambios de estado | Dev, Impl |

### 6.3. Canales

- **En aplicacion:** Badge en header, panel de notificaciones
- **Email:** Resumen diario/semanal (configurable)
- **Push:** Tiempo real via WebSocket

### 6.4. Funcionalidades

- Lista de notificaciones con filtros
- Marcar como leida/no leida
- Marcar todas como leidas
- Preferencias por tipo y canal
- Historial de notificaciones

### 6.5. Pantallas

| Pantalla | Descripcion |
|----------|-------------|
| `/notificaciones` | Lista completa |
| `/notificaciones/preferencias` | Configuracion |

---

## 7. MODULO DASHBOARD

### 7.1. Proposito

Proporciona vision ejecutiva del estado de proyectos, actividades y avance estrategico.

### 7.2. Usuarios

| Rol | Vista |
|-----|-------|
| Admin | Dashboard completo |
| PMO | Dashboard completo |
| Coordinador | Sus proyectos/actividades |
| Scrum Master | Sus proyectos |

### 7.3. Dashboard General

#### KPIs Principales

```
+------------------+  +------------------+  +------------------+  +------------------+
|    PROYECTOS     |  |    ACTIVIDADES   |  |     SPRINTS      |  |      TAREAS      |
|------------------|  |------------------|  |------------------|  |------------------|
|  Total: 15       |  |  Total: 10       |  |  Activos: 5      |  |  Hoy: 12         |
|  En curso: 8     |  |  En ejecucion: 8 |  |  Velocidad: 18.5 |  |  En progreso: 45 |
|  Atrasados: 2    |  |  Suspendidas: 2  |  |                  |  |  Bloqueadas: 3   |
+------------------+  +------------------+  +------------------+  +------------------+
```

#### Salud de Proyectos

```
+------------------------------------------+
|          SALUD DE PROYECTOS              |
|------------------------------------------|
|  [====] Verde: 10 (67%)                  |
|  [===]  Amarillo: 3 (20%)                |
|  [==]   Rojo: 2 (13%)                    |
+------------------------------------------+
```

#### Avance por OEI

```
+------------------------------------------+
|          AVANCE POR OEI                  |
|------------------------------------------|
| OEI-01: Transformacion Digital    [45%]  |
| OEI-02: Mejora de Servicios       [62%]  |
| OEI-03: Infraestructura           [30%]  |
+------------------------------------------+
```

### 7.4. Dashboard de Proyecto

- Informacion del proyecto
- Indicador de salud
- Sprint actual con progreso
- Grafico burndown
- Velocidad historica
- Actividad reciente

### 7.5. Dashboard de Actividad

- Informacion de la actividad
- Metricas Kanban (Lead time, Cycle time)
- Throughput semanal
- Tareas por estado

### 7.6. Pantallas

| Pantalla | Descripcion |
|----------|-------------|
| `/dashboard` | Vista general |
| `/dashboard/proyecto/:id` | Por proyecto |
| `/dashboard/actividad/:id` | Por actividad |
| `/dashboard/oei` | Avance estrategico |

---

## 8. MODULO ADMINISTRACION

### 8.1. Proposito

Configuracion y mantenimiento del sistema. Solo accesible por Admin.

### 8.2. Funcionalidades

#### 8.2.1. Gestion de Usuarios

- Crear/editar/desactivar usuarios
- Asignar roles
- Resetear passwords
- Ver historial de sesiones

#### 8.2.2. Configuracion del Sistema

- Parametros generales
- Duracion de tokens JWT
- Limites de archivos
- Configuracion de email

#### 8.2.3. Logs de Auditoria

- Historial de acciones
- Filtros por usuario, fecha, accion
- Exportar a Excel

#### 8.2.4. Backups

- Programar backups automaticos
- Backup manual
- Restaurar backup

### 8.3. Pantallas

| Pantalla | Descripcion |
|----------|-------------|
| `/admin/usuarios` | Gestion de usuarios |
| `/admin/configuracion` | Parametros |
| `/admin/auditoria` | Logs |
| `/admin/backups` | Respaldos |

---

## RESUMEN DE MODULOS

| Modulo | Proposito | Roles Principales |
|--------|-----------|-------------------|
| **PGD** | Planificacion estrategica | Admin, PMO |
| **POI** | Ejecucion operativa | Todos |
| **Agile** | Metodologias agiles | SM, Dev, Coord, Impl |
| **RRHH** | Recursos humanos | Admin, PMO, Coord, SM |
| **Notificaciones** | Comunicacion | Todos (segun rol) |
| **Dashboard** | Vision ejecutiva | Admin, PMO, Coord |
| **Administracion** | Configuracion | Admin |

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Modulos Funcionales v1.0*
