# GLOSARIO DE TERMINOS - SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Glosario de Terminos y Acronimos
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## TABLA DE CONTENIDOS

1. [Acronimos del Sistema](#1-acronimos-del-sistema)
2. [Terminos de Planificacion Estrategica](#2-terminos-de-planificacion-estrategica)
3. [Terminos de Metodologias Agiles](#3-terminos-de-metodologias-agiles)
4. [Terminos de Documentacion](#4-terminos-de-documentacion)
5. [Terminos Tecnicos](#5-terminos-tecnicos)
6. [Roles del Sistema](#6-roles-del-sistema)
7. [Estados y Flujos](#7-estados-y-flujos)

---

## 1. ACRONIMOS DEL SISTEMA

### 1.1. Acronimos Institucionales

| Acronimo | Significado | Descripcion |
|----------|-------------|-------------|
| **SIGP** | Sistema Integral de Gestion de Proyectos | Nombre del sistema desarrollado |
| **OTIN** | Oficina Tecnica de Informatica | Unidad responsable del desarrollo |
| **PGD** | Plan de Gobierno Digital | Plan estrategico de transformacion digital |
| **POI** | Plan Operativo Informatico | Plan anual de proyectos y actividades |
| **OEI** | Objetivo Estrategico Institucional | Objetivo de alto nivel institucional |
| **OGD** | Objetivo de Gobierno Digital | Objetivo especifico de gobierno digital |
| **OEGD** | Objetivo Especifico de Gobierno Digital | Sub-objetivo vinculado a OGD |
| **AE** | Accion Estrategica | Accion concreta vinculada a OEGD |

### 1.2. Acronimos de Metodologias

| Acronimo | Significado | Descripcion |
|----------|-------------|-------------|
| **HU** | Historia de Usuario | Descripcion de funcionalidad desde perspectiva usuario |
| **SP** | Story Points | Puntos de historia para estimacion |
| **SM** | Scrum Master | Facilitador del equipo Scrum |
| **PMO** | Project Management Office | Oficina de gestion de proyectos |
| **MVP** | Minimum Viable Product | Producto minimo viable |
| **DoD** | Definition of Done | Definicion de terminado |
| **DoR** | Definition of Ready | Definicion de listo |

### 1.3. Acronimos Tecnicos

| Acronimo | Significado | Descripcion |
|----------|-------------|-------------|
| **API** | Application Programming Interface | Interfaz de programacion |
| **REST** | Representational State Transfer | Estilo arquitectonico de APIs |
| **JWT** | JSON Web Token | Token de autenticacion |
| **CRUD** | Create, Read, Update, Delete | Operaciones basicas de datos |
| **DTO** | Data Transfer Object | Objeto de transferencia de datos |
| **FK** | Foreign Key | Llave foranea en base de datos |
| **PK** | Primary Key | Llave primaria en base de datos |
| **ORM** | Object-Relational Mapping | Mapeo objeto-relacional |
| **SSR** | Server-Side Rendering | Renderizado del lado del servidor |
| **WS** | WebSocket | Protocolo de comunicacion bidireccional |

---

## 2. TERMINOS DE PLANIFICACION ESTRATEGICA

### Plan de Gobierno Digital (PGD)
Documento estrategico de 4 años que define la vision, objetivos y acciones para la transformacion digital de la institucion. Es el nivel mas alto de planificacion en el sistema.

### Objetivo Estrategico Institucional (OEI)
Meta de alto nivel que contribuye a la mision institucional. Tiene indicadores y metas anuales medibles. Un PGD puede tener multiples OEIs.

### Objetivo de Gobierno Digital (OGD)
Objetivo especifico orientado a la transformacion digital. Se vincula al PGD y tiene sus propios indicadores y metas anuales.

### Objetivo Especifico de Gobierno Digital (OEGD)
Desglose de un OGD en objetivos mas concretos y accionables. Cada OGD puede tener multiples OEGDs.

### Accion Estrategica (AE)
Accion concreta que implementa un OEGD. Es el nivel donde se vinculan los proyectos y actividades del POI. Representa el "como" se lograra el objetivo.

### Trazabilidad
Capacidad de rastrear cualquier elemento del sistema hasta su objetivo estrategico. En SIGP: Tarea → HU → Proyecto → AE → OEGD → OGD → OEI → PGD.

---

## 3. TERMINOS DE METODOLOGIAS AGILES

### Scrum
Marco de trabajo agil utilizado para gestionar proyectos. Se basa en iteraciones (sprints), roles definidos (SM, Product Owner, Equipo) y eventos regulares.

### Kanban
Metodologia de flujo continuo utilizada para gestionar actividades. Visualiza el trabajo en columnas y no tiene iteraciones fijas.

### Sprint
Iteracion de tiempo fijo (tipicamente 2-4 semanas) en Scrum donde el equipo desarrolla un incremento de producto. En SIGP, la duracion sugerida es de 2 semanas.

### Product Backlog
Lista priorizada de todas las funcionalidades, mejoras y correcciones pendientes del producto. Contiene las Historias de Usuario ordenadas por prioridad.

### Sprint Backlog
Subconjunto del Product Backlog seleccionado para implementar en un sprint especifico. Incluye las HUs comprometidas para la iteracion.

### Historia de Usuario (HU)
Descripcion de una funcionalidad desde la perspectiva del usuario final. Formato: "Como [rol] quiero [accion] para [beneficio]".

### Epica
Agrupacion de Historias de Usuario relacionadas por una funcionalidad mayor o tema comun. Permite organizar el backlog en bloques tematicos.

### Story Points (Puntos de Historia)
Unidad de medida relativa para estimar el esfuerzo de una Historia de Usuario. En SIGP se usa la secuencia Fibonacci: 1, 2, 3, 5, 8, 13, 21.

### Velocidad
Metrica que mide los Story Points completados por sprint. Permite estimar la capacidad del equipo para futuras iteraciones.

### Burndown Chart
Grafico que muestra el trabajo restante (en SP) versus el tiempo. Ayuda a visualizar el progreso del sprint y predecir si se completara a tiempo.

### Daily Meeting (Daily Scrum)
Reunion diaria de 15 minutos donde el equipo responde tres preguntas: ¿Que hice ayer? ¿Que hare hoy? ¿Tengo impedimentos?

### Sprint Planning
Evento al inicio del sprint donde el equipo selecciona las HUs del backlog y planifica como las implementara.

### Sprint Review
Evento al final del sprint donde el equipo demuestra el trabajo completado a los stakeholders.

### Retrospectiva
Evento al final del sprint donde el equipo reflexiona sobre su proceso y busca mejoras continuas.

### Sprint Goal (Objetivo del Sprint)
Objetivo claro y conciso que el equipo se compromete a lograr durante el sprint. Da direccion y enfoque al trabajo.

### Definition of Done (DoD)
Criterios que una Historia de Usuario debe cumplir para considerarse completada. Incluye desarrollo, pruebas, documentacion, etc.

### Criterios de Aceptacion
Condiciones especificas que deben cumplirse para que una HU sea aceptada como completada. Formato: "Dado que... Cuando... Entonces...".

### MoSCoW
Tecnica de priorizacion: Must (debe tener), Should (deberia tener), Could (podria tener), Won't (no tendra).

### T-Shirt Sizing
Tecnica de estimacion usando tallas: XS, S, M, L, XL, XXL. Mapea a Story Points para estimaciones mas precisas.

### Lead Time
Tiempo total desde que se crea una tarea hasta que se completa. Incluye tiempo de espera.

### Cycle Time
Tiempo desde que se inicia el trabajo activo en una tarea hasta que se completa. No incluye tiempo de espera.

### Throughput
Cantidad de tareas completadas en un periodo de tiempo. Indica la capacidad de entrega del equipo.

### WIP (Work In Progress)
Trabajo en progreso. En Kanban se limita para evitar sobrecarga y mejorar el flujo.

### Impedimento
Obstaculo que bloquea o retrasa el progreso del equipo. Debe ser reportado en el Daily Meeting y resuelto por el SM.

---

## 4. TERMINOS DE DOCUMENTACION

### Acta de Constitucion (Project Charter)
Documento formal que autoriza el inicio de un proyecto. Contiene objetivo SMART, alcance, entregables, riesgos y presupuesto.

### Acta de Reunion
Documento que registra los acuerdos, asistentes y temas tratados en una reunion. Genera compromisos con responsables y fechas.

### Informe de Sprint
Documento generado automaticamente al cerrar un sprint. Contiene metricas, HUs completadas con evidencias, impedimentos y lecciones aprendidas.

### Informe de Actividad
Documento periodico que resume el avance de una actividad (Kanban). La periodicidad puede ser mensual, bimestral, trimestral, semestral o anual.

### Requerimiento Funcional (RF)
Descripcion de una funcionalidad que el sistema debe realizar. Define el "que" debe hacer el sistema.

### Requerimiento No Funcional (RNF)
Restriccion o criterio de calidad del sistema (rendimiento, seguridad, usabilidad, etc.). Define el "como" debe comportarse el sistema.

### Cronograma
Planificacion temporal del proyecto con fases, tareas, dependencias, hitos y ruta critica. Visualizado tipicamente como diagrama de Gantt.

### Diagrama de Gantt
Representacion grafica del cronograma que muestra tareas en una linea de tiempo con sus duraciones y dependencias.

### Ruta Critica
Secuencia de tareas que determinan la duracion minima del proyecto. Un retraso en estas tareas impacta directamente la fecha de fin.

### Hito (Milestone)
Punto de control significativo en el proyecto que marca el fin de una fase o entrega importante.

### Evidencia
Archivo o documento que demuestra la completitud de una tarea. Puede ser captura de pantalla, documento, video, etc. Es obligatorio para finalizar tareas.

---

## 5. TERMINOS TECNICOS

### Backend
Parte del sistema que maneja la logica de negocio, base de datos y APIs. En SIGP se usa NestJS.

### Frontend
Parte del sistema que maneja la interfaz de usuario. En SIGP se usa Next.js.

### API REST
Interfaz de programacion que usa HTTP para comunicar sistemas. Sigue principios REST (recursos, verbos HTTP, sin estado).

### JWT (JSON Web Token)
Token de autenticacion que contiene informacion del usuario codificada. Se usa para autorizar peticiones al backend.

### WebSocket
Protocolo que permite comunicacion bidireccional en tiempo real entre cliente y servidor. Se usa para el tablero Kanban y notificaciones.

### Redis
Base de datos en memoria usada para cache, sesiones y comunicacion pub/sub entre instancias del servidor.

### PostgreSQL
Sistema de gestion de base de datos relacional usado para almacenar los datos del sistema.

### MinIO
Sistema de almacenamiento de objetos compatible con S3 usado para guardar archivos (documentos, evidencias, avatares).

### TypeORM
Framework ORM que mapea entidades TypeScript a tablas de PostgreSQL.

### Schema (Base de Datos)
Agrupacion logica de tablas en PostgreSQL. SIGP usa schemas: public, planning, poi, agile, rrhh, notificaciones.

### Migracion
Script que modifica la estructura de la base de datos de forma controlada y versionada.

### Seed
Datos de prueba iniciales que se cargan en la base de datos para desarrollo y testing.

### Soft Delete
Tecnica de eliminacion logica donde el registro no se borra fisicamente sino que se marca como inactivo.

### Paginacion
Tecnica para dividir resultados en paginas para no sobrecargar la interfaz ni el servidor.

### Cache
Almacenamiento temporal de datos para mejorar el rendimiento evitando consultas repetidas.

### Trigger
Procedimiento almacenado que se ejecuta automaticamente ante ciertos eventos en la base de datos.

### Vista Materializada
Tabla precalculada que almacena el resultado de una consulta compleja para mejorar rendimiento.

---

## 6. ROLES DEL SISTEMA

### Administrador (ADMIN)
Super usuario con acceso total al sistema. Gestiona usuarios, configuracion y mantenimiento. Es el unico que puede acceder al modulo de Administracion.

### PMO (Project Management Office)
Responsable de la planificacion estrategica (PGD, OEI, OGD, OEGD, AE). Crea proyectos/actividades, aprueba documentos e informes. Supervisa todo el sistema.

### Coordinador (COORDINADOR)
Rol tactico que supervisa Scrum Masters. Gestiona tanto proyectos como actividades. Tiene alcance mas amplio que el SM. Puede tener varios SM a cargo.

### Scrum Master (SCRUM_MASTER)
Facilitador del equipo de proyecto. Gestiona el backlog, sprints, HUs y tareas. Valida el trabajo completado. Solo trabaja con proyectos (Scrum).

### Patrocinador (PATROCINADOR)
Sponsor del proyecto. Su rol principal es aprobar el Acta de Constitucion junto con el PMO. Tiene visibilidad del proyecto pero no gestion.

### Desarrollador (DESARROLLADOR)
Miembro del equipo que ejecuta tareas en proyectos (Scrum). Puede crear tareas dentro de HUs asignadas. Ve el backlog y tablero pero con acciones limitadas.

### Implementador (IMPLEMENTADOR)
Miembro del equipo que ejecuta subtareas en actividades (Kanban). Puede crear subtareas. Ve el tablero de la actividad pero con acciones limitadas.

---

## 7. ESTADOS Y FLUJOS

### Estados de Proyecto

| Estado | Descripcion |
|--------|-------------|
| Pendiente | Proyecto creado, sin iniciar |
| En planificacion | Preparando documentacion y backlog |
| En desarrollo | Ejecutando sprints |
| Finalizado | Proyecto completado |
| Cancelado | Proyecto cancelado |

### Estados de Actividad

| Estado | Descripcion |
|--------|-------------|
| Pendiente | Actividad creada, sin iniciar |
| En ejecucion | Actividad en curso |
| Finalizado | Actividad completada |
| Suspendido | Actividad pausada |

### Estados de Sprint

| Estado | Descripcion |
|--------|-------------|
| Planificado | Sprint creado, no iniciado |
| Activo | Sprint en ejecucion (solo uno a la vez) |
| Completado | Sprint cerrado |
| Cancelado | Sprint cancelado |

### Estados de Historia de Usuario

| Estado | Descripcion |
|--------|-------------|
| Pendiente | HU en backlog sin analizar |
| En analisis | Refinando criterios y estimacion |
| Lista | Preparada para entrar a sprint |
| En desarrollo | Tareas en progreso |
| En pruebas | Verificando funcionalidad |
| En revision | SM revisando completitud |
| Terminada | HU completada y validada |

### Estados de Tarea/Subtarea

| Estado | Descripcion |
|--------|-------------|
| Por hacer | Tarea pendiente de iniciar |
| En progreso | Tarea en ejecucion |
| En revision | Esperando validacion |
| Finalizado | Tarea completada |
| Validado | Tarea validada por SM/Coord |

### Estados de Documento

| Estado | Descripcion |
|--------|-------------|
| Pendiente | Documento sin revisar |
| Aprobado | Documento aprobado por PMO |
| No Aprobado | Documento rechazado |

### Estados de Informe de Sprint

| Estado | Descripcion |
|--------|-------------|
| Borrador | Informe generado, no enviado |
| Enviado | SM envio a revision |
| Aprobado_Coordinador | Coordinador aprobo |
| Aprobado_PMO | PMO aprobo (final) |
| Rechazado | Rechazado en alguna etapa |

### Flujo de Aprobacion de Documentos

```
SM crea documento → PMO revisa → Aprueba/Rechaza
```

### Flujo de Informe de Sprint

```
Sistema genera → SM edita → SM envia → Coord aprueba → PMO aprueba
```

### Flujo de Acta de Constitucion

```
SM crea → PMO aprueba → Patrocinador aprueba
```

---

## REFERENCIAS ADICIONALES

### Marcos de Trabajo
- **Scrum Guide:** https://scrumguides.org/
- **Kanban Guide:** https://kanban.university/

### Estandares
- **PMBOK:** Project Management Body of Knowledge
- **ISO 21500:** Gestion de proyectos

### Tecnologias
- **NestJS:** https://nestjs.com/
- **Next.js:** https://nextjs.org/
- **PostgreSQL:** https://www.postgresql.org/
- **Redis:** https://redis.io/
- **Socket.io:** https://socket.io/

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Glosario de Terminos v1.0*
