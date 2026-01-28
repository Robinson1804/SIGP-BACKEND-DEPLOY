# RESUMEN EJECUTIVO - Sistema SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Resumen Ejecutivo (No Tecnico)
**Audiencia:** Gerencia, Stakeholders, Patrocinadores
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## 1. Vision General

### 1.1. Que es SIGP?

SIGP (Sistema Integral de Gestion de Proyectos) es una plataforma disenada especificamente para instituciones publicas que necesitan:

- Planificar estrategicamente a mediano plazo (4 anos)
- Ejecutar proyectos y actividades con metodologias modernas
- Controlar el avance y cumplimiento de objetivos
- Generar reportes e informes de manera automatizada

### 1.2. Problema que Resuelve

| Problema Actual | Solucion SIGP |
|-----------------|---------------|
| Planificacion estrategica desconectada de la ejecucion | Trazabilidad completa desde objetivos hasta tareas |
| Seguimiento manual en hojas de calculo | Sistema centralizado con actualizaciones en tiempo real |
| Falta de visibilidad del avance real | Dashboard con indicadores y graficos automaticos |
| Documentos dispersos sin control de versiones | Gestion documental integrada con flujos de aprobacion |
| Dificultad para asignar y controlar recursos | Modulo de recursos humanos con disponibilidad |
| Reportes manuales que consumen tiempo | Generacion automatica de PDFs e informes |

---

## 2. Alcance del Sistema

### 2.1. Que Incluye

```
PLANIFICACION ESTRATEGICA
    Plan de Gobierno Digital (PGD) - Vision a 4 anos
         |
         v
    Objetivos Estrategicos (OEI, OGD, OEGD)
         |
         v
    Acciones Estrategicas (AE)
         |
         v
EJECUCION OPERATIVA
    Plan Operativo Informatico (POI)
         |
    +----+----+
    |         |
    v         v
PROYECTOS  ACTIVIDADES
(Scrum)    (Kanban)
```

### 2.2. Tipos de Iniciativas

El sistema maneja **dos tipos de iniciativas** con enfoques diferentes:

| Aspecto | PROYECTOS | ACTIVIDADES |
|---------|-----------|-------------|
| **Caracteristica** | Tienen inicio y fin definidos | Son continuas o recurrentes |
| **Metodologia** | Scrum (ciclos de 2-4 semanas) | Kanban (flujo continuo) |
| **Ejemplo** | Desarrollo de nuevo sistema | Mantenimiento de servidores |
| **Entregables** | Producto o servicio nuevo | Servicio operativo |
| **Documentacion** | Informe por cada ciclo (Sprint) | Informe periodico (mensual, trimestral, etc.) |

### 2.3. Que NO Incluye

- Gestion financiera/contable (presupuesto solo referencial)
- Gestion de compras y adquisiciones
- Mesa de ayuda o soporte tecnico
- Gestion de inventarios

---

## 3. Usuarios del Sistema

### 3.1. Roles y Responsabilidades

El sistema contempla **7 roles** con diferentes niveles de acceso:

| Rol | Responsabilidad Principal | Alcance |
|-----|---------------------------|---------|
| **Administrador** | Configuracion del sistema, gestion de usuarios | Todo el sistema |
| **PMO** | Planificacion estrategica, supervision general | PGD + todos los POI |
| **Coordinador** | Supervision de equipos y proyectos/actividades | Multiples POI asignados |
| **Scrum Master** | Gestion de proyectos con metodologia agil | Proyectos asignados |
| **Patrocinador** | Validacion y aprobacion de documentos clave | Aprobaciones de Actas |
| **Desarrollador** | Ejecucion de tareas en proyectos | Tareas asignadas |
| **Implementador** | Ejecucion de tareas en actividades | Tareas asignadas |

### 3.2. Jerarquia de Roles

```
                    ADMINISTRADOR
                         |
                        PMO
                         |
                    COORDINADOR
                    /         \
            SCRUM MASTER    PATROCINADOR
                |               |
           DESARROLLADOR   (Aprobaciones)
                |
          IMPLEMENTADOR
```

---

## 4. Modulos del Sistema

### 4.1. Modulos Principales

| Modulo | Proposito | Usuarios Principales |
|--------|-----------|----------------------|
| **PGD** | Planificacion estrategica a 4 anos | PMO |
| **POI** | Gestion de proyectos y actividades | PMO, Coordinador, SM |
| **Backlog** | Organizacion del trabajo pendiente | SM, Coordinador |
| **Tablero** | Visualizacion del trabajo en curso | Todos |
| **Documentos** | Gestion de actas e informes | PMO, SM, Patrocinador |
| **RRHH** | Gestion de personal y asignaciones | Administrador, PMO |
| **Dashboard** | Indicadores y metricas | PMO, Coordinador |
| **Notificaciones** | Alertas y recordatorios | Todos |

### 4.2. Flujo General de Trabajo

```
+------------------+     +------------------+     +------------------+
|   PLANIFICACION  |     |    EJECUCION     |     |     CONTROL      |
|                  |     |                  |     |                  |
| - Crear PGD      | --> | - Crear POI      | --> | - Ver Dashboard  |
| - Definir OEI    |     | - Asignar tareas |     | - Aprobar docs   |
| - Establecer AE  |     | - Ejecutar       |     | - Generar PDF    |
+------------------+     +------------------+     +------------------+
      (PMO)              (SM/Coordinador)         (PMO/Patrocinador)
```

---

## 5. Beneficios Esperados

### 5.1. Para la Institucion

| Beneficio | Descripcion |
|-----------|-------------|
| **Alineacion Estrategica** | Cada tarea se vincula a un objetivo estrategico |
| **Transparencia** | Visibilidad del avance real en cualquier momento |
| **Estandarizacion** | Metodologias consistentes para todos los equipos |
| **Auditabilidad** | Registro historico de cambios y aprobaciones |

### 5.2. Para los Equipos

| Beneficio | Descripcion |
|-----------|-------------|
| **Claridad** | Cada persona sabe que hacer y cuando |
| **Comunicacion** | Notificaciones automaticas y actualizaciones en tiempo real |
| **Productividad** | Menos tiempo en reportes manuales |
| **Colaboracion** | Herramientas compartidas para todo el equipo |

### 5.3. Para la Gerencia

| Beneficio | Descripcion |
|-----------|-------------|
| **Vision Global** | Dashboard con indicadores clave (KPIs) |
| **Toma de Decisiones** | Datos actualizados para decidir |
| **Control** | Alertas tempranas de desviaciones |
| **Reportes** | Generacion automatica de informes ejecutivos |

---

## 6. Caracteristicas Destacadas

### 6.1. Generacion Automatica de Documentos

El sistema genera automaticamente documentos en formato PDF con el formato institucional:

- **Acta de Constitucion** - Documento formal de inicio de proyecto
- **Acta de Reunion** - Registro de reuniones con compromisos
- **Informe de Sprint** - Resumen del avance por ciclo (Proyectos)
- **Informe de Actividad** - Reporte periodico (Actividades)
- **Cronograma** - Diagrama de Gantt exportable

### 6.2. Seguimiento en Tiempo Real

- Tableros visuales tipo Kanban
- Actualizaciones instantaneas cuando alguien mueve una tarea
- Notificaciones automaticas de cambios importantes

### 6.3. Flujos de Aprobacion

```
Documentos de Proyecto:
    SM crea documento
         |
         v
    Coordinador revisa
         |
         v
    PMO aprueba (o Patrocinador para Actas de Constitucion)

Informes de Actividad:
    Coordinador crea informe
         |
         v
    PMO aprueba
```

### 6.4. Dashboard Gerencial

Indicadores disponibles:
- Proyectos por estado (en curso, atrasados, completados)
- Avance porcentual por objetivo estrategico
- Tareas completadas vs pendientes
- Velocidad de los equipos
- Alertas de proyectos en riesgo

---

## 7. Metodologias de Trabajo

### 7.1. Scrum (para Proyectos)

**Que es:** Metodologia agil que divide el trabajo en ciclos cortos llamados "Sprints" (2-4 semanas).

**Como funciona en SIGP:**
1. Se define el trabajo pendiente (Backlog)
2. Se planifica que se hara en el siguiente Sprint
3. El equipo ejecuta las tareas durante el Sprint
4. Al final, se revisa lo logrado y se genera el Informe de Sprint

**Estructura del trabajo:**
```
Epica (agrupacion grande)
    |
    v
Historia de Usuario (funcionalidad)
    |
    v
Tarea (trabajo especifico)
```

### 7.2. Kanban (para Actividades)

**Que es:** Metodologia de flujo continuo que visualiza el trabajo en columnas.

**Como funciona en SIGP:**
1. Las tareas entran en la columna "Por Hacer"
2. Se mueven a "En Progreso" cuando alguien las toma
3. Terminan en "Completado" cuando finalizan
4. No hay ciclos, el flujo es continuo

**Estructura del trabajo:**
```
Tarea (trabajo principal)
    |
    v
Subtarea (trabajo mas pequeno)
```

---

## 8. Integracion con Procesos Existentes

### 8.1. Planificacion Estrategica

El sistema soporta la estructura de planificacion del gobierno digital:

| Nivel | Descripcion | Horizonte |
|-------|-------------|-----------|
| PGD | Plan de Gobierno Digital | 4 anos |
| OEI | Objetivo Estrategico Institucional | Anual |
| OGD | Objetivo de Gobierno Digital | Anual |
| OEGD | Objetivo Especifico de Gobierno Digital | Anual |
| AE | Accion Estrategica | Variable |
| POI | Plan Operativo Informatico | Anual |

### 8.2. Trazabilidad Completa

Cada tarea puede rastrearse hasta su objetivo estrategico:

```
Tarea: "Desarrollar modulo de login"
    |
    pertenece a --> Historia de Usuario: "Como usuario quiero iniciar sesion"
    |
    pertenece a --> Proyecto: "Sistema de Gestion Documental"
    |
    vinculado a --> Accion Estrategica: "Modernizar servicios digitales"
    |
    vinculado a --> OEGD: "Mejorar acceso a servicios"
    |
    vinculado a --> OGD: "Gobierno Digital eficiente"
    |
    vinculado a --> OEI: "Transformacion digital institucional"
```

---

## 9. Consideraciones de Implementacion

### 9.1. Prerequisitos

- Definicion clara de la estructura organizacional
- Identificacion de proyectos y actividades actuales
- Capacitacion de usuarios por rol
- Migracion de informacion existente (si aplica)

### 9.2. Fases Sugeridas

| Fase | Descripcion | Resultado |
|------|-------------|-----------|
| **Fase 1** | Configuracion base y usuarios | Sistema operativo |
| **Fase 2** | Carga de PGD y estructura estrategica | Planificacion lista |
| **Fase 3** | Creacion de POI y asignacion de equipos | Ejecucion habilitada |
| **Fase 4** | Capacitacion y uso inicial | Equipos usando el sistema |
| **Fase 5** | Ajustes y optimizacion | Sistema estabilizado |

---

## 10. Resumen de Capacidades

| Categoria | Capacidad |
|-----------|-----------|
| **Planificacion** | PGD, OEI, OGD, OEGD, Acciones Estrategicas |
| **Ejecucion** | Proyectos (Scrum), Actividades (Kanban) |
| **Documentacion** | Actas, Informes, PDFs automaticos |
| **Recursos** | Personal, asignaciones, disponibilidad |
| **Seguimiento** | Tableros, Dashboard, Notificaciones |
| **Aprobacion** | Flujos multinivel con roles definidos |
| **Reportes** | KPIs, graficos, exportacion |

---

## Anexo: Glosario Basico

| Termino | Significado |
|---------|-------------|
| **PGD** | Plan de Gobierno Digital |
| **POI** | Plan Operativo Informatico |
| **OEI** | Objetivo Estrategico Institucional |
| **Sprint** | Ciclo de trabajo de 2-4 semanas |
| **Backlog** | Lista priorizada de trabajo pendiente |
| **Historia de Usuario** | Descripcion de una funcionalidad desde la perspectiva del usuario |
| **Kanban** | Metodologia visual de flujo continuo |
| **Dashboard** | Panel de control con indicadores |
| **KPI** | Indicador clave de rendimiento |

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Este documento es un resumen ejecutivo del Sistema SIGP. Para detalles tecnicos, consultar la documentacion de arquitectura y especificaciones.*
