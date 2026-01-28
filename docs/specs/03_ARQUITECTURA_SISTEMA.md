# ARQUITECTURA DEL SISTEMA - SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Arquitectura Tecnica
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## TABLA DE CONTENIDOS

1. [Stack Tecnologico](#1-stack-tecnologico)
2. [Arquitectura General](#2-arquitectura-general)
3. [Arquitectura de Capas](#3-arquitectura-de-capas)
4. [Estructura de Modulos](#4-estructura-de-modulos)
5. [Modulo Agile (Detalle)](#5-modulo-agile-detalle)
6. [Patrones de Diseno](#6-patrones-de-diseno)
7. [Infraestructura de Servicios](#7-infraestructura-de-servicios)
8. [Sistema de Autenticacion](#8-sistema-de-autenticacion)
9. [Sistema de Tiempo Real](#9-sistema-de-tiempo-real-websockets)
10. [Sistema de Archivos](#10-sistema-de-archivos-minio)
11. [Sistema de Cache](#11-sistema-de-cache-redis)
12. [Calculo de KPIs y Metricas](#12-calculo-de-kpis-y-metricas)
13. [Decisiones de Arquitectura](#13-decisiones-de-arquitectura)

---

## 1. STACK TECNOLOGICO

### 1.1. Tecnologias Principales

| Capa | Tecnologia | Version | Proposito |
|------|------------|---------|-----------|
| **Frontend** | Next.js | 14.x | Framework React con SSR/SSG |
| **Frontend** | TypeScript | 5.x | Tipado estatico |
| **Frontend** | TailwindCSS | 3.x | Estilos utilitarios |
| **Frontend** | Radix UI | - | Componentes accesibles |
| **Backend** | NestJS | 11.x | Framework Node.js empresarial |
| **Backend** | TypeScript | 5.x | Tipado estatico |
| **ORM** | TypeORM | 0.3.x | Mapeo objeto-relacional |
| **Base de Datos** | PostgreSQL | 14+ | Base de datos relacional |
| **Cache** | Redis | 7.x | Cache y sesiones |
| **Storage** | MinIO | - | Almacenamiento S3-compatible |
| **Real-time** | Socket.io | 4.x | WebSockets |
| **Auth** | Passport + JWT | - | Autenticacion |

### 1.2. Librerias Complementarias

| Categoria | Libreria | Proposito |
|-----------|----------|-----------|
| Validacion | class-validator | Validacion de DTOs |
| Transformacion | class-transformer | Transformacion de objetos |
| Documentacion | Swagger | Documentacion API |
| Graficos | Recharts | Visualizacion de datos |
| Drag & Drop | @dnd-kit | Arrastrar y soltar |
| Formularios | React Hook Form | Gestion de formularios |
| Schemas | Zod | Validacion de schemas |
| PDF | PDFKit / Puppeteer | Generacion de PDFs |
| Excel | ExcelJS | Exportacion a Excel |

---

## 2. ARQUITECTURA GENERAL

### 2.1. Diagrama de Arquitectura de Alto Nivel

```
+─────────────────────────────────────────────────────────────────────────────+
│                              CLIENTES                                        │
│  +──────────────+  +──────────────+  +──────────────+  +──────────────+     │
│  │   Desktop    │  │   Tablet     │  │   Mobile     │  │   API Client │     │
│  │   Browser    │  │   Browser    │  │   Browser    │  │   (Swagger)  │     │
│  +──────+───────+  +──────+───────+  +──────+───────+  +──────+───────+     │
+─────────│────────────────│────────────────│────────────────│────────────────+
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
+─────────────────────────────────────────────────────────────────────────────+
│                           CAPA DE PRESENTACION                               │
│  +─────────────────────────────────────────────────────────────────────+    │
│  │                     NEXT.JS 14 (App Router)                          │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │    │
│  │  │    Pages     │ │  Components  │ │   Contexts   │ │    Hooks    │ │    │
│  │  │  (Routes)    │ │     (UI)     │ │   (State)    │ │   (Logic)   │ │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │    │
│  +─────────────────────────────────────────────────────────────────────+    │
+─────────────────────────────────────────────────────────────────────────────+
                                    │
                          HTTP/REST │ WebSocket
                                    ▼
+─────────────────────────────────────────────────────────────────────────────+
│                           CAPA DE APLICACION                                 │
│  +─────────────────────────────────────────────────────────────────────+    │
│  │                        NESTJS 11 (Backend)                           │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │    │
│  │  │ Controllers  │ │   Services   │ │   Guards     │ │  Gateways   │ │    │
│  │  │   (REST)     │ │  (Business)  │ │   (Auth)     │ │ (WebSocket) │ │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │    │
│  │  │    DTOs      │ │   Entities   │ │ Interceptors │ │    Pipes    │ │    │
│  │  │ (Validation) │ │  (TypeORM)   │ │ (Transform)  │ │ (Validate)  │ │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │    │
│  +─────────────────────────────────────────────────────────────────────+    │
+─────────────────────────────────────────────────────────────────────────────+
                                    │
                                    ▼
+─────────────────────────────────────────────────────────────────────────────+
│                            CAPA DE DATOS                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   PostgreSQL    │  │      Redis      │  │      MinIO      │              │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │              │
│  │  │  Schemas  │  │  │  │   Cache   │  │  │  │  Buckets  │  │              │
│  │  │  ─────────│  │  │  │  Sessions │  │  │  │ Documents │  │              │
│  │  │  public   │  │  │  │  Pub/Sub  │  │  │  │  Avatars  │  │              │
│  │  │  poi      │  │  │  │  Queues   │  │  │  │  Backups  │  │              │
│  │  │  agile    │  │  │  └───────────┘  │  │  └───────────┘  │              │
│  │  │  rrhh     │  │  └─────────────────┘  └─────────────────┘              │
│  │  └───────────┘  │                                                         │
│  └─────────────────┘                                                         │
+─────────────────────────────────────────────────────────────────────────────+
```

### 2.2. Diagrama de Despliegue

```
+─────────────────────────────────────────────────────────────────────────────+
│                         AMBIENTE DE PRODUCCION                               │
+─────────────────────────────────────────────────────────────────────────────+

                              ┌─────────────────┐
                              │  Load Balancer  │
                              │    (Nginx)      │
                              └────────┬────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
     │  NestJS App 1   │     │  NestJS App 2   │     │  NestJS App N   │
     │    (Docker)     │     │    (Docker)     │     │    (Docker)     │
     │   Port: 3010    │     │   Port: 3010    │     │   Port: 3010    │
     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
              │                        │                        │
              └────────────────────────┼────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   PostgreSQL    │         │      Redis      │         │      MinIO      │
│    (Master)     │         │    (Cluster)    │         │    (Cluster)    │
│   Port: 5432    │         │   Port: 6379    │         │   Port: 9000    │
└────────┬────────┘         └─────────────────┘         └─────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Replica)     │
│   Port: 5433    │
└─────────────────┘
```

---

## 3. ARQUITECTURA DE CAPAS

### 3.1. Estructura del Backend (NestJS)

```
src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
│
├── common/                          # Compartido entre modulos
│   ├── constants/
│   │   └── roles.constant.ts        # Enum de roles
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── dto/
│       ├── pagination.dto.ts
│       └── response.dto.ts
│
├── config/                          # Configuraciones
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── minio.config.ts
│
├── modules/                         # Modulos de negocio
│   ├── auth/                        # Autenticacion
│   ├── planning/                    # PGD, OEI, OGD, OEGD, AE
│   ├── poi/                         # Proyectos, Actividades
│   ├── agile/                       # Sprints, HU, Tareas
│   ├── rrhh/                        # Personal
│   ├── notifications/               # Notificaciones
│   └── dashboard/                   # KPIs y metricas
│
├── websockets/                      # Gateways WebSocket
│   ├── kanban.gateway.ts
│   └── notifications.gateway.ts
│
├── storage/                         # MinIO service
│   └── storage.service.ts
│
├── redis/                           # Redis service
│   └── redis.service.ts
│
├── database/                        # Base de datos
│   ├── migrations/
│   ├── seeds/
│   └── sql/                         # Triggers, views
│
└── scheduled-jobs/                  # Cron jobs
    └── notification-digest.job.ts
```

### 3.2. Estructura de un Modulo

```
modules/poi/
├── poi.module.ts                    # Modulo principal
│
├── proyectos/
│   ├── entities/
│   │   ├── proyecto.entity.ts
│   │   └── proyecto-estado.enum.ts
│   ├── dto/
│   │   ├── create-proyecto.dto.ts
│   │   └── update-proyecto.dto.ts
│   ├── services/
│   │   └── proyecto.service.ts
│   └── controllers/
│       └── proyecto.controller.ts
│
├── actividades/
│   ├── entities/
│   ├── dto/
│   ├── services/
│   └── controllers/
│
└── documentos/
    ├── entities/
    ├── dto/
    ├── services/
    └── controllers/
```

---

## 4. ESTRUCTURA DE MODULOS

### 4.1. Vista General de Modulos

```
src/modules/
│
├── auth/                    # Autenticacion y usuarios
│
├── planning/                # Planificacion estrategica (PGD)
│   ├── pgd/
│   ├── oei/
│   ├── ogd/
│   ├── oegd/
│   └── acciones-estrategicas/
│
├── poi/                     # Plan Operativo Informatico
│   ├── proyectos/           # Proyectos (base)
│   ├── actividades/         # Actividades (base)
│   ├── documentos/          # Docs de proyecto por fases
│   ├── actas/               # Actas de reunion y constitucion
│   ├── requerimientos/      # RF y RNF
│   ├── cronograma/          # Gantt y dependencias
│   └── informes/            # Informes de Sprint y Actividad
│
├── agile/                   # Metodologias agiles (ver seccion 5)
│   ├── epicas/
│   ├── sprints/
│   ├── historias-usuario/
│   ├── tareas/
│   ├── subtareas/
│   ├── tablero/
│   ├── backlog/
│   └── daily-meeting/
│
├── rrhh/                    # Recursos humanos
│   ├── personal/
│   └── divisiones/
│
├── notifications/           # Notificaciones
│
└── dashboard/               # KPIs y metricas
```

### 4.2. Dependencias entre Modulos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEPENDENCIAS ENTRE MODULOS                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────┐
                              │   AUTH   │
                              └────┬─────┘
                                   │ (todos dependen)
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
       ▼                           ▼                           ▼
┌─────────────┐             ┌─────────────┐             ┌─────────────┐
│  PLANNING   │             │    RRHH     │             │NOTIFICATIONS│
│ (PGD, OEI..)│             │ (Personal)  │             │             │
└──────┬──────┘             └──────┬──────┘             └─────────────┘
       │                           │                           ▲
       │ vincula AE                │ asigna personal           │
       ▼                           ▼                           │
┌─────────────────────────────────────────────────────┐        │
│                        POI                           │        │
│  ┌───────────────┐         ┌───────────────┐        │        │
│  │  PROYECTOS    │         │  ACTIVIDADES  │        │        │
│  │   (Scrum)     │         │   (Kanban)    │        │        │
│  └───────┬───────┘         └───────┬───────┘        │        │
└──────────│─────────────────────────│────────────────┘        │
           │                         │                         │
           ▼                         ▼                         │
┌─────────────────────────────────────────────────────┐        │
│                       AGILE                          │────────┘
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  (eventos)
│  │ Sprints │ │   HUs   │ │ Tareas  │ │ Tablero │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  DASHBOARD  │
                    │   (KPIs)    │
                    └─────────────┘
```

---

## 5. MODULO AGILE (Detalle)

El modulo Agile es el mas extenso del sistema. Gestiona todo lo relacionado con metodologias agiles: Scrum para Proyectos y Kanban para Actividades.

### 5.1. Estructura del Modulo Agile

```
modules/agile/
│
├── agile.module.ts              # Modulo principal
│
├── epicas/
│   ├── entities/
│   │   ├── epica.entity.ts
│   │   └── epica-estado.enum.ts
│   ├── dto/
│   │   ├── create-epica.dto.ts
│   │   └── update-epica.dto.ts
│   ├── services/
│   │   └── epicas.service.ts
│   └── controllers/
│       └── epicas.controller.ts
│
├── sprints/
│   ├── entities/
│   │   ├── sprint.entity.ts
│   │   └── sprint-estado.enum.ts
│   ├── dto/
│   │   ├── create-sprint.dto.ts
│   │   ├── update-sprint.dto.ts
│   │   └── cerrar-sprint.dto.ts
│   ├── services/
│   │   ├── sprints.service.ts
│   │   └── sprint-metricas.service.ts   # Velocidad, burndown
│   └── controllers/
│       └── sprints.controller.ts
│
├── historias-usuario/
│   ├── entities/
│   │   ├── historia-usuario.entity.ts
│   │   ├── hu-estado.enum.ts
│   │   ├── hu-prioridad.enum.ts         # MoSCoW
│   │   ├── hu-criterio-aceptacion.entity.ts
│   │   ├── hu-requerimiento.entity.ts   # Tabla puente
│   │   └── hu-dependencia.entity.ts
│   ├── dto/
│   │   ├── create-hu.dto.ts
│   │   ├── update-hu.dto.ts
│   │   ├── mover-hu-sprint.dto.ts
│   │   └── cambiar-estado-hu.dto.ts
│   ├── services/
│   │   └── historias-usuario.service.ts
│   └── controllers/
│       └── historias-usuario.controller.ts
│
├── tareas/
│   ├── entities/
│   │   ├── tarea.entity.ts              # Tarea unificada (SCRUM|KANBAN)
│   │   ├── tarea-tipo.enum.ts           # SCRUM | KANBAN
│   │   └── tarea-estado.enum.ts
│   ├── dto/
│   │   ├── create-tarea.dto.ts
│   │   ├── update-tarea.dto.ts
│   │   ├── finalizar-tarea.dto.ts       # Con evidencia
│   │   └── validar-tarea.dto.ts         # SM valida
│   ├── services/
│   │   └── tareas.service.ts
│   └── controllers/
│       └── tareas.controller.ts
│
├── subtareas/                            # SOLO KANBAN
│   ├── entities/
│   │   └── subtarea.entity.ts
│   ├── dto/
│   │   ├── create-subtarea.dto.ts
│   │   └── update-subtarea.dto.ts
│   ├── services/
│   │   └── subtareas.service.ts
│   └── controllers/
│       └── subtareas.controller.ts
│
├── tablero/
│   ├── dto/
│   │   ├── mover-item.dto.ts
│   │   └── filtros-tablero.dto.ts
│   ├── services/
│   │   ├── tablero-scrum.service.ts     # Por Sprint
│   │   └── tablero-kanban.service.ts    # Flujo continuo
│   └── controllers/
│       └── tablero.controller.ts
│
├── backlog/
│   ├── dto/
│   │   ├── ordenar-backlog.dto.ts
│   │   └── filtros-backlog.dto.ts
│   ├── services/
│   │   └── backlog.service.ts
│   └── controllers/
│       └── backlog.controller.ts
│
└── daily-meeting/
    ├── entities/
    │   └── daily-meeting.entity.ts
    ├── dto/
    │   └── create-daily.dto.ts
    ├── services/
    │   └── daily-meeting.service.ts
    └── controllers/
        └── daily-meeting.controller.ts
```

### 5.2. Comparativa Scrum vs Kanban

| Aspecto | SCRUM (Proyectos) | KANBAN (Actividades) |
|---------|-------------------|----------------------|
| **Contenedor** | Sprint (2-4 semanas) | Flujo continuo |
| **Unidad de trabajo** | Historia de Usuario | Tarea |
| **Jerarquia** | Epica → HU → Tarea | Tarea → Subtarea |
| **Subtareas** | NO | SI |
| **Story Points** | SI | NO |
| **Prioridad** | MoSCoW | Alta/Media/Baja |
| **Metricas** | Velocidad, Burndown | Lead Time, Throughput |
| **Informe** | Informe de Sprint | Informe de Actividad |
| **Tablero** | Por Sprint activo | Todas las tareas |

### 5.3. Diagrama de Relaciones - Scrum

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PROYECTO (Scrum)                                │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐         ┌─────────────────┐
│     EPICA       │         │     SPRINT      │
│   (opcional)    │         │                 │
│   codigo: EP-X  │         │  2-4 semanas    │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ 1:N                       │ 1:N (HUs asignadas)
         ▼                           │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HISTORIA DE USUARIO (HU)                             │
│                                                                              │
│  codigo: US-XXX | story_points: 1,2,3,5,8,13,21 | prioridad: MoSCoW        │
│  estado: Por hacer → En progreso → Revision → Finalizado                    │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TAREA (tipo: SCRUM)                                  │
│                                                                              │
│  codigo: TAR-XXX | horas_estimadas | horas_reales | evidencia_url           │
│  historia_usuario_id: NOT NULL | actividad_id: NULL                         │
│                                                                              │
│                        ⛔ NO TIENE SUBTAREAS                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4. Diagrama de Relaciones - Kanban

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ACTIVIDAD (Kanban)                                │
│                                                                              │
│  Flujo continuo, sin sprints, sin HUs                                       │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N (directo)
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TAREA (tipo: KANBAN)                                │
│                                                                              │
│  codigo: TAR-XXX | horas_estimadas | horas_reales | evidencia_url           │
│  actividad_id: NOT NULL | historia_usuario_id: NULL                         │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUBTAREA                                        │
│                                                                              │
│  codigo: SUB-XXX | horas_estimadas | horas_reales | evidencia_url           │
│  tarea_id: NOT NULL (solo tareas tipo KANBAN)                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5. Entidad Tarea Unificada (Decision de Diseno)

Se utiliza una **unica entidad Tarea** con un campo discriminador `tipo` para diferenciar entre Scrum y Kanban:

```typescript
// entities/tarea.entity.ts
@Entity('tareas', { schema: 'agile' })
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;  // TAR-001, TAR-002...

  @Column({ type: 'enum', enum: TareaTipo })
  tipo: TareaTipo;  // 'SCRUM' | 'KANBAN'

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // ═══════════════════════════════════════════════════════════
  // RELACIONES CONDICIONALES
  // ═══════════════════════════════════════════════════════════

  // Solo si tipo = SCRUM (NOT NULL para Scrum, NULL para Kanban)
  @ManyToOne(() => HistoriaUsuario, hu => hu.tareas, { nullable: true })
  @JoinColumn({ name: 'historia_usuario_id' })
  historiaUsuario?: HistoriaUsuario;

  @Column({ nullable: true })
  historia_usuario_id?: number;

  // Solo si tipo = KANBAN (NOT NULL para Kanban, NULL para Scrum)
  @ManyToOne(() => Actividad, act => act.tareas, { nullable: true })
  @JoinColumn({ name: 'actividad_id' })
  actividad?: Actividad;

  @Column({ nullable: true })
  actividad_id?: number;

  // Solo KANBAN tiene subtareas
  @OneToMany(() => Subtarea, subtarea => subtarea.tarea)
  subtareas?: Subtarea[];

  // ═══════════════════════════════════════════════════════════
  // CAMPOS COMUNES
  // ═══════════════════════════════════════════════════════════

  @Column({ type: 'enum', enum: TareaEstado, default: TareaEstado.POR_HACER })
  estado: TareaEstado;

  @Column({ type: 'enum', enum: TareaPrioridad, default: TareaPrioridad.MEDIA })
  prioridad: TareaPrioridad;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  horas_estimadas: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  horas_reales: number;  // Se registra al finalizar

  @Column({ nullable: true })
  evidencia_url: string;  // Requerida para finalizar

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @ManyToOne(() => Personal)
  @JoinColumn({ name: 'asignado_a' })
  asignadoA: Personal;

  // Solo para Scrum: SM valida las tareas
  @Column({ default: false })
  validada: boolean;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'validada_por' })
  validadaPor?: Usuario;

  @Column({ type: 'timestamp', nullable: true })
  validada_en?: Date;

  // Auditoria
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'created_by' })
  createdBy: Usuario;
}

// enums/tarea-tipo.enum.ts
export enum TareaTipo {
  SCRUM = 'SCRUM',
  KANBAN = 'KANBAN'
}

// enums/tarea-estado.enum.ts
export enum TareaEstado {
  POR_HACER = 'Por hacer',
  EN_PROGRESO = 'En progreso',
  EN_REVISION = 'En revision',
  FINALIZADO = 'Finalizado'
}
```

### 5.6. Validaciones por Tipo de Tarea

```typescript
// tareas.service.ts
async create(dto: CreateTareaDto): Promise<Tarea> {
  // Validar segun tipo
  if (dto.tipo === TareaTipo.SCRUM) {
    if (!dto.historia_usuario_id) {
      throw new BadRequestException('Tarea Scrum requiere historia_usuario_id');
    }
    if (dto.actividad_id) {
      throw new BadRequestException('Tarea Scrum no puede tener actividad_id');
    }
  }

  if (dto.tipo === TareaTipo.KANBAN) {
    if (!dto.actividad_id) {
      throw new BadRequestException('Tarea Kanban requiere actividad_id');
    }
    if (dto.historia_usuario_id) {
      throw new BadRequestException('Tarea Kanban no puede tener historia_usuario_id');
    }
  }

  return this.tareaRepo.save(dto);
}

async crearSubtarea(tareaId: number, dto: CreateSubtareaDto): Promise<Subtarea> {
  const tarea = await this.tareaRepo.findOne(tareaId);

  // Solo tareas KANBAN pueden tener subtareas
  if (tarea.tipo !== TareaTipo.KANBAN) {
    throw new BadRequestException('Solo las tareas Kanban pueden tener subtareas');
  }

  return this.subtareaRepo.save({ ...dto, tarea_id: tareaId });
}
```

### 5.7. Flujos de Trabajo

#### Flujo Scrum

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO SCRUM                                        │
└─────────────────────────────────────────────────────────────────────────────┘

  BACKLOG                    SPRINT                      TABLERO
     │                          │                           │
     │  HUs priorizadas         │  HUs seleccionadas        │  Por Sprint
     │  (ordenadas por          │  (Sprint Planning)        │  activo
     │   Story Points)          │                           │
     ▼                          ▼                           ▼
┌─────────┐              ┌─────────────┐             ┌───────────────┐
│ US-001  │  ──────────> │ Sprint 5    │ ──────────> │ Por Hacer     │
│ US-002  │   Mover a    │ - US-001    │  Tablero    │ En Progreso   │
│ US-003  │   Sprint     │ - US-002    │  muestra    │ Revision      │
│ ...     │              │ 13 SP total │  HUs y      │ Finalizado    │
└─────────┘              └─────────────┘  Tareas     └───────────────┘
                                │
                                │ Al cerrar Sprint
                                ▼
                         ┌─────────────┐
                         │ INFORME DE  │ (auto-generado)
                         │ SPRINT      │
                         │ SM→Coord→PMO│
                         └─────────────┘
```

#### Flujo Kanban

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO KANBAN                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ACTIVIDAD                   TAREAS                     TABLERO
     │                          │                           │
     │  Continua                │  Flujo constante          │  Todas las
     │  (sin sprints)           │  (sin iteraciones)        │  tareas
     ▼                          ▼                           ▼
┌─────────────┐           ┌─────────────┐            ┌───────────────┐
│ Actividad:  │           │ TAR-001     │            │ Por Hacer     │
│ Soporte     │ ────────> │  └─SUB-001  │ ─────────> │ En Progreso   │
│ Servidores  │  Crear    │  └─SUB-002  │  Flujo     │ En Revision   │
│             │  Tareas   │ TAR-002     │  continuo  │ Completado    │
└─────────────┘           │  └─SUB-001  │            └───────────────┘
                          └─────────────┘
                                │
                                │ Segun periodicidad
                                ▼
                         ┌─────────────┐
                         │ INFORME DE  │ (manual)
                         │ ACTIVIDAD   │
                         │ Coord→PMO   │
                         └─────────────┘
```

### 5.8. Justificacion: Una Entidad Tarea (Opcion A)

**Decision:** Usar una unica entidad `Tarea` con campo discriminador `tipo`.

**Razones:**
1. **80% de campos son identicos** - nombre, descripcion, estado, prioridad, horas, evidencia, fechas
2. **Simplifica queries de reportes** - Una sola tabla para metricas globales
3. **Facilita busquedas** - "Todas las tareas del usuario X" sin UNION
4. **Menor complejidad** - Un solo servicio, un solo controlador base
5. **Validaciones claras** - El campo `tipo` determina reglas de negocio

**Restricciones implementadas:**
- `tipo = SCRUM`: historia_usuario_id NOT NULL, actividad_id NULL, subtareas NO permitidas
- `tipo = KANBAN`: actividad_id NOT NULL, historia_usuario_id NULL, subtareas SI permitidas

---

## 6. PATRONES DE DISENO

### 6.1. Patrones Implementados

| Patron | Donde se Usa | Proposito |
|--------|--------------|-----------|
| **Repository** | TypeORM Entities | Abstraccion de acceso a datos |
| **Dependency Injection** | NestJS Core | Inversion de control |
| **Decorator** | Guards, Pipes, Interceptors | Modificar comportamiento |
| **Strategy** | Auth Strategies (JWT, Local) | Algoritmos intercambiables |
| **Observer** | WebSocket Events | Notificaciones en tiempo real |
| **Factory** | DTOs, Entities | Creacion de objetos |
| **Singleton** | Services, Redis Client | Instancia unica |
| **Middleware** | Auth, Logging | Pipeline de procesamiento |

### 6.2. Patron de Autenticacion (Guard + Decorator)

```typescript
// Uso en Controller
@Controller('proyectos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoController {

  @Get()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  findAll(@CurrentUser() user: Usuario) {
    return this.proyectoService.findAll(user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() dto: CreateProyectoDto) {
    return this.proyectoService.create(dto);
  }
}
```

### 6.3. Patron de Respuesta Estandarizada

```typescript
// Interceptor de transformacion
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

// Respuesta de error
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

---

## 7. INFRAESTRUCTURA DE SERVICIOS

### 7.1. Docker Compose (Desarrollo)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: sigp_db
      POSTGRES_USER: sigp_user
      POSTGRES_PASSWORD: sigp_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_password
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 7.2. Variables de Entorno

```bash
# Aplicacion
PORT=3010
NODE_ENV=development

# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=sigp_user
DATABASE_PASSWORD=sigp_pass
DATABASE_NAME=sigp_db

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRATION=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_password
MINIO_USE_SSL=false
```

---

## 8. SISTEMA DE AUTENTICACION

### 8.1. Flujo de Autenticacion JWT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE AUTENTICACION                               │
└─────────────────────────────────────────────────────────────────────────────┘

  Cliente                    Backend                      Redis
     │                          │                           │
     │  POST /auth/login        │                           │
     │  {email, password}       │                           │
     │─────────────────────────>│                           │
     │                          │                           │
     │                          │  Validar credenciales     │
     │                          │  (bcrypt.compare)         │
     │                          │                           │
     │                          │  Generar JWT              │
     │                          │  (access + refresh)       │
     │                          │                           │
     │                          │  Guardar sesion           │
     │                          │─────────────────────────> │
     │                          │                           │
     │  {accessToken,           │                           │
     │   refreshToken}          │                           │
     │<─────────────────────────│                           │
     │                          │                           │
     │  GET /api/v1/proyectos   │                           │
     │  Authorization: Bearer   │                           │
     │─────────────────────────>│                           │
     │                          │                           │
     │                          │  Validar JWT              │
     │                          │  (JwtAuthGuard)           │
     │                          │                           │
     │                          │  Verificar sesion         │
     │                          │─────────────────────────> │
     │                          │                           │
     │                          │  Verificar roles          │
     │                          │  (RolesGuard)             │
     │                          │                           │
     │  {data: [...]}           │                           │
     │<─────────────────────────│                           │
```

### 8.2. Estructura del Token JWT

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": 123,
    "email": "usuario@ejemplo.com",
    "rol": "scrum_master",
    "iat": 1702468200,
    "exp": 1702554600
  }
}
```

### 8.3. Jerarquia de Roles

```
                    ┌─────────────┐
                    │    ADMIN    │  Nivel: 100
                    │ (Superusuario)
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │     PMO     │  Nivel: 90
                    │ (Sub-admin) │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │ COORDINADOR │  Nivel: 80
                    │(Supervisa SM)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────┴──────┐          ┌───────┴───────┐
       │SCRUM_MASTER │          │ PATROCINADOR  │  Nivel: 70/60
       │ (Proyectos) │          │   (Sponsor)   │
       └──────┬──────┘          └───────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────┴─────┐    ┌──────┴──────┐
│DESARROLLADOR│ │IMPLEMENTADOR│  Nivel: 50
│(Proyectos)  │ │(Actividades)│
└─────────────┘ └─────────────┘
```

---

## 9. SISTEMA DE TIEMPO REAL (WebSockets)

### 9.1. Arquitectura WebSocket

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA WEBSOCKET                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  Browser 1          Browser 2          Browser 3
     │                  │                   │
     │ Socket.io        │ Socket.io         │ Socket.io
     │                  │                   │
     └────────────┬─────┴─────────┬─────────┘
                  │               │
                  ▼               ▼
         ┌─────────────┐  ┌─────────────┐
         │  NestJS 1   │  │  NestJS 2   │
         │  Gateway    │  │  Gateway    │
         └──────┬──────┘  └──────┬──────┘
                │                │
                └───────┬────────┘
                        │
                        ▼
                ┌─────────────┐
                │    Redis    │
                │   Pub/Sub   │
                └─────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    channel:        channel:      channel:
    proyecto:1      proyecto:2    notifications
```

### 9.2. Eventos WebSocket

| Evento | Direccion | Payload | Descripcion |
|--------|-----------|---------|-------------|
| `tarea:mover` | Client→Server | `{tareaId, columnaDestino}` | Mover tarea en tablero |
| `tarea:actualizada` | Server→Client | `{tarea, accion}` | Notificar cambio |
| `sprint:actualizado` | Server→Client | `{sprint}` | Cambio en sprint |
| `notificacion:nueva` | Server→Client | `{notificacion}` | Nueva notificacion |
| `usuario:conectado` | Server→Client | `{usuarioId}` | Usuario se conecta |
| `room:join` | Client→Server | `{proyectoId}` | Unirse a sala |
| `room:leave` | Client→Server | `{proyectoId}` | Salir de sala |

### 9.3. Gateway de Kanban

```typescript
@WebSocketGateway({
  namespace: '/kanban',
  cors: { origin: '*' }
})
export class KanbanGateway {

  @SubscribeMessage('tarea:mover')
  async handleMoverTarea(
    @MessageBody() data: { tareaId: number; columnaDestino: string },
    @ConnectedSocket() client: Socket
  ) {
    // Actualizar en BD
    const tarea = await this.tareaService.moverColumna(
      data.tareaId,
      data.columnaDestino
    );

    // Broadcast a todos en la sala del proyecto
    this.server
      .to(`proyecto:${tarea.proyectoId}`)
      .emit('tarea:actualizada', { tarea, accion: 'mover' });
  }
}
```

---

## 10. SISTEMA DE ARCHIVOS (MinIO)

### 10.1. Estructura de Buckets

```
sigp-documentos/
├── proyectos/
│   └── {proyecto_id}/
│       ├── actas/
│       │   ├── constitucion/
│       │   │   └── acta_constitucion_v{n}.pdf
│       │   └── reunion/
│       │       └── acta_reunion_{fecha}.pdf
│       ├── documentos/
│       │   └── {fase}/
│       │       └── {nombre_documento}.{ext}
│       ├── cronogramas/
│       │   └── cronograma_v{n}.xlsx
│       ├── informes-sprint/
│       │   └── informe_sprint_{n}.pdf
│       └── versiones/
│           └── {documento}_v{n}.{ext}
│
├── actividades/
│   └── {actividad_id}/
│       └── informes/
│           └── informe_{periodo}_{fecha}.pdf

sigp-adjuntos/
├── historias/
│   └── {hu_id}/
│       └── {tarea_id}/
│           └── evidencia_{n}.{ext}
├── tareas/
│   └── {tarea_id}/
│       └── adjunto_{n}.{ext}
└── subtareas/
    └── {subtarea_id}/
        └── adjunto_{n}.{ext}

sigp-avatares/
└── usuarios/
    └── {usuario_id}/
        └── avatar.{ext}
```

### 10.2. Presigned URLs

```typescript
// Generar URL para subir archivo
async getUploadUrl(bucket: string, key: string): Promise<string> {
  return await this.minioClient.presignedPutObject(
    bucket,
    key,
    60 * 5 // 5 minutos de validez
  );
}

// Generar URL para descargar archivo
async getDownloadUrl(bucket: string, key: string): Promise<string> {
  return await this.minioClient.presignedGetObject(
    bucket,
    key,
    60 * 60 // 1 hora de validez
  );
}
```

### 10.3. Limites de Archivos

| Tipo | Formatos | Tamano Max | Cantidad |
|------|----------|------------|----------|
| Documentos Proyecto | .pdf, .docx, .xlsx, .pptx | 50 MB | Ilimitado |
| Evidencias Tarea | .jpg, .png, .pdf, .zip | 25 MB | 5 por tarea |
| Avatares | .jpg, .png, .webp | 2 MB | 1 por usuario |
| Informes | .pdf, .docx | 50 MB | 1 por periodo |

---

## 11. SISTEMA DE CACHE (Redis)

### 11.1. Estructura de Keys

```
# ═══════════════════════════════════════════════════════════════
# CACHE DE DATOS (TTL: 5-15 min)
# ═══════════════════════════════════════════════════════════════
cache:proyecto:{id}                    -> JSON proyecto completo
cache:proyecto:{id}:estadisticas       -> Metricas calculadas
cache:sprint:{id}                      -> JSON sprint
cache:sprint:{id}:burndown             -> Datos burndown chart
cache:usuario:{id}                     -> JSON usuario
cache:dashboard:{proyectoId}           -> KPIs del proyecto

# ═══════════════════════════════════════════════════════════════
# SESIONES (TTL: 24h - 7d)
# ═══════════════════════════════════════════════════════════════
session:{userId}:{deviceId}            -> Access token + metadata
session:refresh:{userId}               -> Refresh token
session:active:{userId}                -> Lista de dispositivos activos

# ═══════════════════════════════════════════════════════════════
# RATE LIMITING (TTL: 1 min)
# ═══════════════════════════════════════════════════════════════
ratelimit:{userId}:{endpoint}          -> Contador de peticiones
ratelimit:ip:{ip}                      -> Contador por IP
ratelimit:global:{endpoint}            -> Limite global

# ═══════════════════════════════════════════════════════════════
# WEBSOCKET (Sin TTL)
# ═══════════════════════════════════════════════════════════════
ws:room:proyecto:{id}                  -> Set de socket IDs
ws:user:{userId}                       -> Socket ID actual
ws:online                              -> Set de usuarios online

# ═══════════════════════════════════════════════════════════════
# PUB/SUB CHANNELS
# ═══════════════════════════════════════════════════════════════
channel:notifications                  -> Notificaciones globales
channel:proyecto:{id}                  -> Eventos del proyecto
channel:broadcast                      -> Mensajes del sistema
```

### 11.2. Estrategia de Cache

```typescript
// Patron Cache-Aside
async getProyecto(id: number): Promise<Proyecto> {
  const cacheKey = `cache:proyecto:${id}`;

  // 1. Buscar en cache
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Buscar en BD
  const proyecto = await this.proyectoRepo.findOne(id);

  // 3. Guardar en cache (TTL: 10 min)
  await this.redis.setex(cacheKey, 600, JSON.stringify(proyecto));

  return proyecto;
}

// Invalidar cache al actualizar
async updateProyecto(id: number, data: UpdateProyectoDto) {
  await this.proyectoRepo.update(id, data);
  await this.redis.del(`cache:proyecto:${id}`);
  await this.redis.del(`cache:proyecto:${id}:estadisticas`);
}
```

---

## 12. CALCULO DE KPIs Y METRICAS

### 12.1. Velocidad del Equipo

```sql
-- Velocidad por Sprint
SELECT
    s.id as sprint_id,
    s.nombre as sprint_nombre,
    COALESCE(SUM(hu.story_points), 0) as velocidad
FROM sprints s
LEFT JOIN historias_usuario hu ON hu.sprint_id = s.id
    AND hu.estado = 'Finalizada'
WHERE s.proyecto_id = :proyectoId
GROUP BY s.id, s.nombre
ORDER BY s.fecha_inicio DESC;

-- Velocidad promedio (ultimos 3 sprints)
SELECT ROUND(AVG(velocidad), 2) as velocidad_promedio
FROM (
    SELECT COALESCE(SUM(hu.story_points), 0) as velocidad
    FROM sprints s
    LEFT JOIN historias_usuario hu ON hu.sprint_id = s.id
        AND hu.estado = 'Finalizada'
    WHERE s.proyecto_id = :proyectoId
      AND s.estado = 'Finalizado'
    GROUP BY s.id
    ORDER BY s.fecha_fin DESC
    LIMIT 3
) as ultimos;
```

### 12.2. Salud del Proyecto

```typescript
interface SaludProyecto {
  estado: 'VERDE' | 'AMARILLO' | 'ROJO';
  score: number;
  factores: {
    avance: { real: number; planificado: number; desviacion: number };
    sprintsAtrasados: number;
    tareasBlockeadas: number;
    husSinAsignar: number;
  };
}

async calcularSalud(proyectoId: number): Promise<SaludProyecto> {
  const proyecto = await this.getProyecto(proyectoId);

  // Calcular avance real vs planificado
  const avanceReal = await this.calcularAvanceReal(proyectoId);
  const avancePlanificado = this.calcularAvancePlanificado(proyecto);
  const desviacion = avanceReal - avancePlanificado;

  // Contar problemas
  const sprintsAtrasados = await this.contarSprintsAtrasados(proyectoId);
  const tareasBlockeadas = await this.contarTareasBlockeadas(proyectoId);
  const husSinAsignar = await this.contarHUsSinAsignar(proyectoId);

  // Calcular score (0-100)
  let score = 100;
  score -= Math.abs(desviacion) * 2;           // -2 por cada % de desviacion
  score -= sprintsAtrasados * 15;              // -15 por sprint atrasado
  score -= tareasBlockeadas * 5;               // -5 por tarea bloqueada
  score -= husSinAsignar * 2;                  // -2 por HU sin asignar
  score = Math.max(0, Math.min(100, score));

  // Determinar estado
  let estado: 'VERDE' | 'AMARILLO' | 'ROJO';
  if (score >= 70) estado = 'VERDE';
  else if (score >= 40) estado = 'AMARILLO';
  else estado = 'ROJO';

  return {
    estado,
    score,
    factores: {
      avance: { real: avanceReal, planificado: avancePlanificado, desviacion },
      sprintsAtrasados,
      tareasBlockeadas,
      husSinAsignar
    }
  };
}
```

### 12.3. Burndown Chart Data

```typescript
interface BurndownData {
  fecha: string;
  spRestantes: number;
  spIdeal: number;
}

async getBurndownData(sprintId: number): Promise<BurndownData[]> {
  const sprint = await this.sprintRepo.findOne(sprintId);
  const totalSP = await this.getTotalSPSprint(sprintId);

  const diasSprint = differenceInDays(sprint.fechaFin, sprint.fechaInicio);
  const spPorDia = totalSP / diasSprint;

  const result: BurndownData[] = [];
  let spRestantes = totalSP;

  for (let dia = 0; dia <= diasSprint; dia++) {
    const fecha = addDays(sprint.fechaInicio, dia);

    // SP completados hasta esta fecha
    const spCompletados = await this.getSPCompletadosHastaFecha(
      sprintId,
      fecha
    );

    result.push({
      fecha: format(fecha, 'yyyy-MM-dd'),
      spRestantes: totalSP - spCompletados,
      spIdeal: totalSP - (spPorDia * dia)
    });
  }

  return result;
}
```

### 12.4. Metricas Kanban

```sql
-- Lead Time promedio (dias)
SELECT
    ROUND(AVG(
        EXTRACT(EPOCH FROM (fecha_completado - fecha_creacion)) / 86400
    ), 2) as lead_time_dias
FROM tareas
WHERE actividad_id = :actividadId
  AND estado = 'Finalizado'
  AND fecha_completado IS NOT NULL;

-- Cycle Time promedio (dias)
SELECT
    ROUND(AVG(
        EXTRACT(EPOCH FROM (fecha_completado - fecha_inicio_trabajo)) / 86400
    ), 2) as cycle_time_dias
FROM tareas
WHERE actividad_id = :actividadId
  AND estado = 'Finalizado'
  AND fecha_inicio_trabajo IS NOT NULL;

-- Throughput semanal
SELECT
    DATE_TRUNC('week', fecha_completado) as semana,
    COUNT(*) as tareas_completadas
FROM tareas
WHERE actividad_id = :actividadId
  AND estado = 'Finalizado'
GROUP BY DATE_TRUNC('week', fecha_completado)
ORDER BY semana DESC
LIMIT 12;
```

### 12.5. Dashboard KPIs Summary

```typescript
interface DashboardKPIs {
  proyectos: {
    total: number;
    enCurso: number;
    atrasados: number;
    completados: number;
    porSalud: { verde: number; amarillo: number; rojo: number };
  };
  sprints: {
    activos: number;
    velocidadPromedio: number;
  };
  tareas: {
    completadasHoy: number;
    enProgreso: number;
    bloqueadas: number;
  };
  equipos: {
    personasAsignadas: number;
    sinAsignacion: number;
  };
  avanceOEI: {
    oeiId: number;
    nombre: string;
    porcentaje: number;
  }[];
}
```

---

## 13. DECISIONES DE ARQUITECTURA

### 13.1. ADR-001: NestJS como Framework Backend

**Estado:** Aceptado

**Contexto:** Necesitamos un framework backend robusto, tipado y con buenas practicas.

**Decision:** Usar NestJS con TypeScript.

**Justificacion:**
- Arquitectura modular similar a Angular
- Soporte nativo para TypeScript
- Inyeccion de dependencias integrada
- Decoradores para validacion, auth, etc.
- Excelente documentacion
- Soporte para WebSockets, GraphQL, microservicios

**Consecuencias:**
- Curva de aprendizaje para desarrolladores sin experiencia en NestJS
- Mayor estructura inicial vs Express puro

---

### 13.2. ADR-002: PostgreSQL como Base de Datos

**Estado:** Aceptado

**Contexto:** Necesitamos una BD relacional robusta con soporte para JSON y buen rendimiento.

**Decision:** Usar PostgreSQL 14+.

**Justificacion:**
- ACID compliant
- Soporte para JSONB (datos semi-estructurados)
- Excelente rendimiento con indices
- Soporte para schemas (separacion logica)
- Full-text search integrado
- Extensiones (pg_trgm para busqueda fuzzy)

**Consecuencias:**
- Requiere mas configuracion que SQLite
- Necesita servidor dedicado o contenedor

---

### 13.3. ADR-003: Redis para Cache y Sesiones

**Estado:** Aceptado

**Contexto:** Necesitamos cache distribuido y soporte para WebSocket multi-instancia.

**Decision:** Usar Redis para cache, sesiones y Pub/Sub.

**Justificacion:**
- Extremadamente rapido (in-memory)
- Soporta Pub/Sub para WebSockets
- TTL nativo para cache
- Estructuras de datos versatiles
- Cluster mode para alta disponibilidad

**Consecuencias:**
- Servicio adicional para mantener
- Datos volatiles (requiere persistencia si es critico)

---

### 13.4. ADR-004: MinIO para Almacenamiento

**Estado:** Aceptado

**Contexto:** Necesitamos almacenamiento de archivos escalable y seguro.

**Decision:** Usar MinIO (S3-compatible).

**Justificacion:**
- API compatible con Amazon S3
- Presigned URLs para seguridad
- Puede correr on-premise
- Sin vendor lock-in (migrable a S3)
- Buckets con politicas de acceso

**Consecuencias:**
- Servicio adicional para mantener
- Requiere configuracion de politicas

---

### 13.5. ADR-005: Separacion de Schemas en PostgreSQL

**Estado:** Aceptado

**Contexto:** El sistema tiene multiples dominios (POI, Agile, RRHH, etc.).

**Decision:** Usar schemas separados en PostgreSQL.

**Schemas:**
- `public` - Usuarios, auth, configuracion
- `poi` - Proyectos, actividades, documentos
- `agile` - Sprints, HU, tareas
- `rrhh` - Personal, divisiones
- `notificaciones` - Sistema de alertas

**Justificacion:**
- Separacion logica clara
- Permisos granulares por schema
- Facilita backups parciales
- Evita colision de nombres

**Consecuencias:**
- Queries cross-schema necesitan prefijo
- Migraciones mas complejas

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Arquitectura del Sistema v1.0*
