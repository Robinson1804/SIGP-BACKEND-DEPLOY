# ESPECIFICACION DE REQUERIMIENTOS - Sistema SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Especificacion de Requerimientos (SRS)
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## TABLA DE CONTENIDOS

1. [Requerimientos Funcionales](#1-requerimientos-funcionales)
2. [Requerimientos No Funcionales](#2-requerimientos-no-funcionales)
3. [Reglas de Negocio](#3-reglas-de-negocio)

---

## 1. REQUERIMIENTOS FUNCIONALES

### 1.1. Modulo de Autenticacion y Usuarios (AUTH)

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-AUTH-001 | El sistema debe permitir el inicio de sesion con usuario y contrasena | Alta |
| RF-AUTH-002 | El sistema debe generar tokens JWT para mantener la sesion activa | Alta |
| RF-AUTH-003 | El sistema debe permitir cerrar sesion invalidando el token | Alta |
| RF-AUTH-004 | El sistema debe soportar 7 roles: Admin, PMO, Coordinador, Scrum Master, Patrocinador, Desarrollador, Implementador | Alta |
| RF-AUTH-005 | El sistema debe restringir el acceso a modulos segun el rol del usuario | Alta |
| RF-AUTH-006 | El sistema debe permitir al Admin crear, editar y desactivar usuarios | Alta |
| RF-AUTH-007 | El sistema debe permitir al usuario cambiar su contrasena | Media |
| RF-AUTH-008 | El sistema debe registrar la fecha y hora del ultimo acceso | Baja |

---

### 1.2. Modulo PGD - Planificacion Estrategica

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-PGD-001 | El sistema debe permitir crear un PGD con rango exacto de 4 anios | Alta |
| RF-PGD-002 | El sistema debe permitir definir OEI vinculados a un PGD | Alta |
| RF-PGD-003 | El sistema debe permitir definir OGD vinculados a un OEI | Alta |
| RF-PGD-004 | El sistema debe permitir definir OEGD vinculados a un OGD | Alta |
| RF-PGD-005 | El sistema debe permitir definir Acciones Estrategicas vinculadas a un OEGD | Alta |
| RF-PGD-006 | El sistema debe permitir establecer metas anuales con indicadores para OEI | Media |
| RF-PGD-007 | El sistema debe permitir establecer metas anuales con indicadores para OGD | Media |
| RF-PGD-008 | El sistema debe mostrar la trazabilidad completa desde PGD hasta POI | Alta |
| RF-PGD-009 | Solo los roles Admin y PMO pueden acceder al modulo PGD | Alta |

---

### 1.3. Modulo POI - Proyectos (Scrum)

#### 1.3.1. Gestion General de Proyectos

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-POI-001 | El sistema debe permitir crear proyectos vinculados a una Accion Estrategica | Alta |
| RF-POI-002 | El sistema debe permitir asignar un Scrum Master a cada proyecto | Alta |
| RF-POI-003 | El sistema debe permitir asignar un Coordinador supervisor al proyecto | Alta |
| RF-POI-004 | El sistema debe permitir asignar un Patrocinador (Sponsor) al proyecto | Alta |
| RF-POI-005 | El sistema debe mostrar informacion general del proyecto (nombre, descripcion, fechas, estado) | Alta |
| RF-POI-006 | El sistema debe calcular y mostrar el progreso general del proyecto | Alta |
| RF-POI-007 | El sistema debe calcular y mostrar el progreso por sprints | Alta |
| RF-POI-008 | El sistema debe permitir crear subproyectos para proyectos grandes | Media |
| RF-POI-009 | El sistema debe permitir cambiar el estado del proyecto (Pendiente, En Planificacion, En Desarrollo, Finalizado) | Alta |

#### 1.3.2. Documentos de Proyecto

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-DOC-001 | El sistema debe permitir subir documentos organizados por fases del proyecto | Alta |
| RF-DOC-002 | El sistema debe manejar estados de documento: Pendiente, Aprobado, No Aprobado | Alta |
| RF-DOC-003 | El sistema debe permitir al PMO y Patrocinador aprobar/rechazar documentos | Alta |
| RF-DOC-004 | El sistema debe validar los formatos permitidos (.pdf, .docx, .xlsx) | Alta |
| RF-DOC-005 | El sistema debe validar el tamano maximo de archivos (50 MB) | Alta |
| RF-DOC-006 | El sistema debe validar que exista la documentacion minima obligatoria segun PMBOK | Media |

#### 1.3.3. Actas del Proyecto

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-ACTA-001 | El sistema debe permitir crear Actas de Constitucion con formulario multipaso | Alta |
| RF-ACTA-002 | El sistema debe generar automaticamente el PDF del Acta de Constitucion con formato institucional | Alta |
| RF-ACTA-003 | El Acta de Constitucion requiere doble aprobacion: PMO primero, Patrocinador despues | Alta |
| RF-ACTA-004 | El sistema debe permitir crear Actas de Reunion | Alta |
| RF-ACTA-005 | El sistema debe generar automaticamente el PDF del Acta de Reunion | Alta |
| RF-ACTA-006 | El sistema debe permitir registrar asistentes, temas tratados y compromisos en las actas | Alta |
| RF-ACTA-007 | El sistema debe permitir guardar actas en estado Borrador antes de enviar | Media |

#### 1.3.4. Requerimientos del Proyecto

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-REQ-001 | El sistema debe permitir registrar Requerimientos Funcionales (RF) | Alta |
| RF-REQ-002 | El sistema debe permitir registrar Requerimientos No Funcionales (RNF) | Alta |
| RF-REQ-003 | El sistema debe permitir asignar codigo unico a cada requerimiento (RF-001, RNF-001) | Alta |
| RF-REQ-004 | El sistema debe permitir vincular requerimientos con Historias de Usuario | Alta |
| RF-REQ-005 | El sistema debe permitir establecer prioridad a los requerimientos | Media |

#### 1.3.5. Cronograma

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-CRON-001 | El sistema debe permitir crear cronograma con tareas y fechas | Alta |
| RF-CRON-002 | El sistema debe mostrar diagrama de Gantt visual | Alta |
| RF-CRON-003 | El sistema debe soportar dependencias entre tareas (FS, FF, SS, SF) | Media |
| RF-CRON-004 | El sistema debe permitir establecer lag time en dependencias | Baja |
| RF-CRON-005 | El sistema debe exportar cronograma a PDF | Media |

---

### 1.4. Modulo POI - Actividades (Kanban)

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-ACT-001 | El sistema debe permitir crear actividades vinculadas a una Accion Estrategica | Alta |
| RF-ACT-002 | El sistema debe permitir asignar un Coordinador a cada actividad | Alta |
| RF-ACT-003 | El sistema debe mostrar informacion general de la actividad | Alta |
| RF-ACT-004 | El sistema debe calcular y mostrar el progreso general de la actividad | Alta |
| RF-ACT-005 | El sistema debe definir la periodicidad de informes al crear la actividad | Alta |
| RF-ACT-006 | Las actividades NO tienen Patrocinador/Sponsor asignado | Alta |

---

### 1.5. Modulo Agil - Backlog y Sprints (Scrum)

#### 1.5.1. Epicas

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-EPIC-001 | El sistema debe permitir crear Epicas para agrupar Historias de Usuario | Alta |
| RF-EPIC-002 | El sistema debe asignar codigo unico a cada Epica (EP-001) | Alta |
| RF-EPIC-003 | El sistema debe permitir asignar color a cada Epica para visualizacion | Media |

#### 1.5.2. Sprints

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-SPR-001 | El sistema debe permitir crear Sprints con duracion de 2-4 semanas (3-28 dias) | Alta |
| RF-SPR-002 | El sistema debe validar que no existan sprints solapados | Alta |
| RF-SPR-003 | El sistema debe manejar estados de Sprint: Planificado, En Curso, Finalizado | Alta |
| RF-SPR-004 | El sistema debe calcular la velocidad del equipo basada en Story Points completados | Media |
| RF-SPR-005 | El sistema debe mostrar grafico Burndown del Sprint | Media |
| RF-SPR-006 | El sistema debe generar automaticamente Informe de Sprint al cerrar | Alta |

#### 1.5.3. Historias de Usuario (HU)

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-HU-001 | El sistema debe permitir crear HU con formato "Como [rol], quiero [accion], para [beneficio]" | Alta |
| RF-HU-002 | El sistema debe asignar codigo unico a cada HU (US-001) | Alta |
| RF-HU-003 | El sistema debe permitir asignar Story Points (Fibonacci: 1,2,3,5,8,13,21) | Alta |
| RF-HU-004 | El sistema debe permitir asignar prioridad MoSCoW (Must, Should, Could, Won't) | Alta |
| RF-HU-005 | El sistema debe permitir asignar responsables (minimo 1, maximo 5) | Alta |
| RF-HU-006 | El sistema debe permitir agregar criterios de aceptacion a cada HU | Alta |
| RF-HU-007 | El sistema debe permitir mover HU entre Backlog y Sprints | Alta |
| RF-HU-008 | El sistema debe permitir vincular HU con Requerimientos | Media |
| RF-HU-009 | El sistema debe permitir establecer dependencias entre HU | Media |

#### 1.5.4. Tareas Secundarias (de HU)

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-TAR-001 | El sistema debe permitir crear Tareas Secundarias dentro de cada HU | Alta |
| RF-TAR-002 | El sistema debe asignar codigo unico a cada Tarea (TAR-001) | Alta |
| RF-TAR-003 | El sistema debe requerir estimacion de horas para cada tarea | Alta |
| RF-TAR-004 | El sistema debe requerir registro de horas reales al finalizar | Alta |
| RF-TAR-005 | El sistema debe requerir adjuntar evidencia al finalizar la tarea | Alta |
| RF-TAR-006 | El sistema debe permitir al SM validar las tareas finalizadas | Alta |
| RF-TAR-007 | Las Tareas de HU (Scrum) NO tienen subtareas | Alta |

---

### 1.6. Modulo Agil - Tablero Kanban (Actividades)

#### 1.6.1. Tareas de Actividad

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-TKAN-001 | El sistema debe permitir crear Tareas en las Actividades | Alta |
| RF-TKAN-002 | El sistema debe asignar codigo unico a cada Tarea (TAR-001) | Alta |
| RF-TKAN-003 | El sistema debe permitir crear Subtareas dentro de cada Tarea | Alta |
| RF-TKAN-004 | El sistema debe asignar codigo unico a cada Subtarea (SUB-001) | Alta |
| RF-TKAN-005 | El sistema debe mostrar tablero Kanban con columnas configurables | Alta |
| RF-TKAN-006 | El sistema debe permitir arrastrar y soltar tareas entre columnas | Alta |
| RF-TKAN-007 | Las Tareas de Actividades (Kanban) SI tienen subtareas | Alta |

---

### 1.7. Modulo Tablero Visual

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-TAB-001 | El sistema debe mostrar tablero Kanban para visualizacion del trabajo | Alta |
| RF-TAB-002 | El sistema debe permitir filtrar por responsable, prioridad, estado | Alta |
| RF-TAB-003 | El sistema debe actualizar en tiempo real cuando se mueve una tarea | Alta |
| RF-TAB-004 | El sistema debe diferenciar visualmente entre Tablero Scrum y Tablero Kanban | Alta |
| RF-TAB-005 | El Tablero Scrum muestra HUs y Tareas del Sprint actual | Alta |
| RF-TAB-006 | El Tablero Kanban muestra Tareas y Subtareas en flujo continuo | Alta |

---

### 1.8. Modulo Daily Meeting

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-DAILY-001 | El sistema debe permitir registrar Daily Meetings para Proyectos y Actividades | Alta |
| RF-DAILY-002 | El sistema debe registrar: que hice ayer, que hare hoy, impedimentos | Alta |
| RF-DAILY-003 | El sistema debe registrar los participantes de cada Daily | Alta |
| RF-DAILY-004 | El sistema debe limitar la duracion sugerida a 15 minutos | Baja |
| RF-DAILY-005 | El sistema debe mostrar historial de Daily Meetings | Media |

---

### 1.9. Modulo Informes

#### 1.9.1. Informes de Sprint (Scrum)

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-ISPR-001 | El sistema debe generar automaticamente el Informe de Sprint al cerrar | Alta |
| RF-ISPR-002 | El informe debe incluir: HUs completadas, Story Points, velocidad | Alta |
| RF-ISPR-003 | El informe debe incluir evidencias de las tareas finalizadas | Alta |
| RF-ISPR-004 | El sistema debe permitir al SM descargar y modificar el informe | Alta |
| RF-ISPR-005 | El sistema debe implementar flujo de aprobacion: SM -> Coordinador -> PMO | Alta |
| RF-ISPR-006 | El sistema debe manejar estados: Borrador, Enviado, Aprobado_Coord, Aprobado_PMO, Rechazado | Alta |

#### 1.9.2. Informes de Actividad (Kanban)

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-IACT-001 | El sistema debe permitir crear Informes de Actividad periodicos | Alta |
| RF-IACT-002 | El sistema debe soportar periodicidades: Mensual, Bimestral, Trimestral, Semestral, Anual | Alta |
| RF-IACT-003 | El informe debe incluir: resumen de actividades, tareas completadas, tareas pendientes | Alta |
| RF-IACT-004 | El sistema debe permitir adjuntar archivo al informe | Alta |
| RF-IACT-005 | El sistema debe implementar aprobacion exclusiva por PMO | Alta |
| RF-IACT-006 | El sistema debe manejar estados: Pendiente, Aprobado, No Aprobado | Alta |
| RF-IACT-007 | El sistema debe listar periodos con informe pendiente | Media |

---

### 1.10. Modulo Recursos Humanos

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-RRHH-001 | El sistema debe mostrar listado de personal con paginacion | Alta |
| RF-RRHH-002 | El sistema debe permitir busqueda de personal en tiempo real | Alta |
| RF-RRHH-003 | El sistema debe mostrar la division/area de cada persona | Alta |
| RF-RRHH-004 | El sistema debe mostrar el rol asignado de cada persona | Alta |
| RF-RRHH-005 | El sistema debe mostrar proyectos/actividades asignados a cada persona | Media |
| RF-RRHH-006 | El sistema debe mostrar disponibilidad del personal | Media |
| RF-RRHH-007 | Solo Admin y PMO pueden editar informacion de personal | Alta |

---

### 1.11. Modulo Notificaciones

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-NOT-001 | El sistema debe enviar notificaciones en tiempo real via WebSocket | Alta |
| RF-NOT-002 | El sistema debe categorizar notificaciones: Proyectos, Sprints, Retrasos, Aprobaciones | Alta |
| RF-NOT-003 | El sistema debe filtrar notificaciones segun el rol del usuario | Alta |
| RF-NOT-004 | El sistema debe permitir marcar notificaciones como leidas | Alta |
| RF-NOT-005 | El sistema debe mostrar contador de notificaciones no leidas | Alta |
| RF-NOT-006 | El sistema debe redirigir a la seccion correspondiente al hacer clic | Media |

---

### 1.12. Modulo Dashboard

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-DASH-001 | El sistema debe mostrar KPIs de proyectos (en curso, atrasados, completados) | Alta |
| RF-DASH-002 | El sistema debe mostrar avance porcentual por objetivo estrategico | Alta |
| RF-DASH-003 | El sistema debe mostrar grafico de tareas completadas vs pendientes | Alta |
| RF-DASH-004 | El sistema debe mostrar velocidad de los equipos | Media |
| RF-DASH-005 | El sistema debe mostrar alertas de proyectos en riesgo | Alta |
| RF-DASH-006 | El sistema debe permitir exportar dashboard a PDF/Excel | Media |
| RF-DASH-007 | El sistema debe permitir filtrar por periodo, proyecto, equipo | Media |

---

### 1.13. Modulo Archivos

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-FILE-001 | El sistema debe permitir subir archivos al servidor MinIO | Alta |
| RF-FILE-002 | El sistema debe generar URLs presignadas para descarga segura | Alta |
| RF-FILE-003 | El sistema debe validar tipos de archivo permitidos | Alta |
| RF-FILE-004 | El sistema debe validar tamano maximo de archivos | Alta |
| RF-FILE-005 | El sistema debe organizar archivos por proyecto/actividad/entidad | Alta |
| RF-FILE-006 | El sistema debe permitir eliminar archivos (soft delete) | Media |

---

## 2. REQUERIMIENTOS NO FUNCIONALES

### 2.1. Seguridad

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RNF-SEG-001 | El sistema debe usar autenticacion JWT con expiracion configurable | Alta |
| RNF-SEG-002 | Las contrasenas deben almacenarse hasheadas (bcrypt) | Alta |
| RNF-SEG-003 | El sistema debe implementar RBAC (Role-Based Access Control) | Alta |
| RNF-SEG-004 | El sistema debe proteger contra ataques XSS y CSRF | Alta |
| RNF-SEG-005 | El sistema debe usar HTTPS en produccion | Alta |
| RNF-SEG-006 | El sistema debe implementar rate limiting para prevenir ataques de fuerza bruta | Media |
| RNF-SEG-007 | Las URLs de archivos deben expirar despues de un tiempo configurable | Media |

### 2.2. Rendimiento

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RNF-REND-001 | Las APIs deben responder en menos de 200ms para operaciones CRUD simples | Alta |
| RNF-REND-002 | Las busquedas deben responder en menos de 500ms | Alta |
| RNF-REND-003 | El sistema debe soportar al menos 100 usuarios concurrentes | Alta |
| RNF-REND-004 | Las actualizaciones del tablero via WebSocket deben ser < 100ms | Media |
| RNF-REND-005 | La generacion de PDFs debe completarse en menos de 5 segundos | Media |

### 2.3. Disponibilidad

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RNF-DISP-001 | El sistema debe tener disponibilidad minima de 99.5% | Alta |
| RNF-DISP-002 | El sistema debe soportar reinicio sin perdida de datos | Alta |
| RNF-DISP-003 | Las sesiones deben persistir en Redis para soportar multiples instancias | Media |

### 2.4. Escalabilidad

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RNF-ESC-001 | El sistema debe soportar crecimiento horizontal (multiples instancias) | Media |
| RNF-ESC-002 | La base de datos debe soportar indices para consultas frecuentes | Alta |
| RNF-ESC-003 | Los WebSockets deben sincronizarse via Redis para multiples instancias | Media |

### 2.5. Usabilidad

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RNF-USA-001 | La interfaz debe ser responsive (desktop, tablet, movil) | Alta |
| RNF-USA-002 | El sistema debe mostrar mensajes de error claros y accionables | Alta |
| RNF-USA-003 | Las acciones principales deben ser accesibles en 3 clics o menos | Media |
| RNF-USA-004 | El sistema debe soportar navegacion por teclado | Baja |

### 2.6. Mantenibilidad

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RNF-MANT-001 | El codigo debe seguir los estandares de NestJS | Alta |
| RNF-MANT-002 | El sistema debe tener logs estructurados para debugging | Alta |
| RNF-MANT-003 | La cobertura de tests debe ser minimo 70% | Media |
| RNF-MANT-004 | Las migraciones de BD deben ser reversibles | Alta |

### 2.7. Integracion

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RNF-INT-001 | El backend debe exponer APIs RESTful documentadas con Swagger | Alta |
| RNF-INT-002 | El sistema debe usar PostgreSQL como base de datos | Alta |
| RNF-INT-003 | El sistema debe usar Redis para cache y sesiones | Alta |
| RNF-INT-004 | El sistema debe usar MinIO para almacenamiento de archivos | Alta |

---

## 3. REGLAS DE NEGOCIO

### 3.1. Validaciones de Fechas

| ID | Regla | Mensaje de Error |
|----|-------|------------------|
| RN-FEC-001 | Fecha Fin debe ser >= Fecha Inicio | "La fecha fin no puede ser anterior a la fecha inicio" |
| RN-FEC-002 | Sprint debe durar entre 3-28 dias | "La duracion del sprint debe ser entre 3 y 28 dias" |
| RN-FEC-003 | No pueden existir sprints solapados | "El sprint se solapa con [Nombre sprint existente]" |
| RN-FEC-004 | Fechas de HU deben estar dentro del Sprint | "Las fechas de la HU no coinciden con el rango del Sprint" |
| RN-FEC-005 | Fechas de Tarea deben estar dentro de la HU | "Las fechas de la tarea deben estar dentro del rango de la HU" |
| RN-FEC-006 | Fechas de Subtarea deben estar dentro de la Tarea | "Las fechas de la subtarea deben estar dentro de la Tarea" |
| RN-FEC-007 | PGD debe tener rango exacto de 4 anios | "El PGD debe tener un rango exacto de 4 anios" |

### 3.2. Validaciones de Finalizacion

| ID | Regla | Mensaje de Error |
|----|-------|------------------|
| RN-FIN-001 | Tarea requiere evidencia adjunta para finalizar | "Para finalizar la tarea debe adjuntar evidencia" |
| RN-FIN-002 | Tarea requiere registro de horas reales para finalizar | "Debe registrar las horas reales que tomo completar la tarea" |
| RN-FIN-003 | Subtarea requiere evidencia adjunta para finalizar | "Para finalizar la subtarea debe adjuntar evidencia" |
| RN-FIN-004 | HU requiere todas las tareas VALIDADAS por SM | "No puede finalizar la HU hasta que todas las tareas esten validadas" |
| RN-FIN-005 | Tarea Kanban requiere todas las subtareas finalizadas | "No puede finalizar la tarea hasta que todas las subtareas esten finalizadas" |
| RN-FIN-006 | Sprint cambia automaticamente a Finalizado cuando todas las HU estan finalizadas | (Automatico) |

### 3.3. Validaciones de Archivos

| ID | Regla | Restriccion |
|----|-------|-------------|
| RN-ARC-001 | Evidencia de Tarea | Formatos: .jpg, .png, .pdf / Max: 10-50 MB / Cantidad: hasta 5 archivos |
| RN-ARC-002 | Documentos de Proyecto | Formatos: .pdf, .docx, .xlsx / Max: 50 MB / Cantidad: 1 archivo |
| RN-ARC-003 | Actas adjuntas | Formatos: .pdf, .docx / Max: 50 MB / Cantidad: 1 archivo |

### 3.4. Validaciones de Campos Obligatorios

#### Historia de Usuario
- Titulo (requerido)
- Descripcion (requerido)
- Responsables (minimo 1, maximo 5)
- Prioridad (requerido)
- Fecha Inicio (requerido)
- Fecha Fin (requerido)

#### Sprint
- Nombre (requerido)
- Fecha Inicio (requerido)
- Fecha Fin (requerido)

#### Tarea/Subtarea
- Nombre (requerido)
- Responsable (requerido)
- Estado (requerido)
- Prioridad (requerido)
- Fecha Inicio (requerido)
- Fecha Fin (requerido)

### 3.5. Flujos de Aprobacion

#### Acta de Constitucion
```
SM crea Acta -> PMO aprueba -> Patrocinador aprueba (final)
                    |                   |
                    v                   v
               Si rechaza          Si rechaza
               vuelve a SM         vuelve a SM
```

#### Informe de Sprint
```
Sistema genera -> SM modifica -> SM envia -> Coordinador aprueba -> PMO aprueba
                                                    |                    |
                                                    v                    v
                                              Si rechaza            Si rechaza
                                              vuelve a SM          vuelve a SM
```

#### Informe de Actividad
```
Coordinador crea -> PMO aprueba
                        |
                        v
                   Si rechaza
                   vuelve a Coordinador
```

### 3.6. Jerarquia de Tareas

| Contexto | Estructura | Subtareas? |
|----------|------------|------------|
| **Proyecto (Scrum)** | Epica -> HU -> Tarea | NO |
| **Actividad (Kanban)** | Tarea -> Subtarea | SI |

### 3.7. Transiciones de Estado

#### Estados de HU (Scrum)
```
Por Hacer -> En Progreso -> Revision -> Finalizado
                  ^              |
                  |              v
                  +--- Rechazado (vuelve a En Progreso)
```

#### Estados de Proyecto
```
Pendiente -> En Planificacion -> En Desarrollo -> Finalizado
                    ^                   |
                    +-------------------+
                    (puede retroceder)
```

#### Estados de Sprint
```
Planificado -> En Curso -> Finalizado
```

### 3.8. Permisos por Accion

| Accion | Admin | PMO | Coord | SM | Sponsor | Dev | Impl |
|--------|-------|-----|-------|-----|---------|-----|------|
| Crear PGD/OEI/OGD | Si | Si | No | No | No | No | No |
| Crear Proyecto | Si | Si | No | No | No | No | No |
| Crear Actividad | Si | Si | Si | No | No | No | No |
| Crear Sprint | Si | Si | No | Si | No | No | No |
| Crear HU | Si | Si | Si | Si | No | No | No |
| Crear Tarea | Si | Si | Si | Si | No | Si | Si |
| Aprobar Acta Const. | No | Si | No | No | Si | No | No |
| Validar Tareas | No | No | No | Si | No | No | No |
| Aprobar Informe Sprint | No | Si | Si | No | No | No | No |
| Aprobar Informe Activ. | No | Si | No | No | No | No | No |

---

## TRAZABILIDAD

### Matriz de Trazabilidad: Modulos -> Requerimientos

| Modulo | Requerimientos Funcionales | Cantidad |
|--------|---------------------------|----------|
| AUTH | RF-AUTH-001 a RF-AUTH-008 | 8 |
| PGD | RF-PGD-001 a RF-PGD-009 | 9 |
| POI-Proyectos | RF-POI-001 a RF-POI-009 | 9 |
| Documentos | RF-DOC-001 a RF-DOC-006 | 6 |
| Actas | RF-ACTA-001 a RF-ACTA-007 | 7 |
| Requerimientos | RF-REQ-001 a RF-REQ-005 | 5 |
| Cronograma | RF-CRON-001 a RF-CRON-005 | 5 |
| POI-Actividades | RF-ACT-001 a RF-ACT-006 | 6 |
| Epicas | RF-EPIC-001 a RF-EPIC-003 | 3 |
| Sprints | RF-SPR-001 a RF-SPR-006 | 6 |
| HU | RF-HU-001 a RF-HU-009 | 9 |
| Tareas HU | RF-TAR-001 a RF-TAR-007 | 7 |
| Tareas Kanban | RF-TKAN-001 a RF-TKAN-007 | 7 |
| Tablero | RF-TAB-001 a RF-TAB-006 | 6 |
| Daily Meeting | RF-DAILY-001 a RF-DAILY-005 | 5 |
| Informes Sprint | RF-ISPR-001 a RF-ISPR-006 | 6 |
| Informes Actividad | RF-IACT-001 a RF-IACT-007 | 7 |
| RRHH | RF-RRHH-001 a RF-RRHH-007 | 7 |
| Notificaciones | RF-NOT-001 a RF-NOT-006 | 6 |
| Dashboard | RF-DASH-001 a RF-DASH-007 | 7 |
| Archivos | RF-FILE-001 a RF-FILE-006 | 6 |
| **TOTAL RF** | | **127** |

| Categoria RNF | Cantidad |
|---------------|----------|
| Seguridad | 7 |
| Rendimiento | 5 |
| Disponibilidad | 3 |
| Escalabilidad | 3 |
| Usabilidad | 4 |
| Mantenibilidad | 4 |
| Integracion | 4 |
| **TOTAL RNF** | **30** |

| Reglas de Negocio | Cantidad |
|-------------------|----------|
| Validaciones Fechas | 7 |
| Validaciones Finalizacion | 6 |
| Validaciones Archivos | 3 |
| **TOTAL RN** | **16** |

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Especificacion de Requerimientos v1.0*
