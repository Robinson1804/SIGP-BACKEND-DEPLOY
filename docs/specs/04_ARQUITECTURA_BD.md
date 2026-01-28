# ARQUITECTURA DE BASE DE DATOS - SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Arquitectura de Base de Datos
**Desarrollado por:** OTIN (Oficina Tecnica de Informatica)

---

## TABLA DE CONTENIDOS

1. [Vision General](#1-vision-general)
2. [Organizacion de Schemas](#2-organizacion-de-schemas)
3. [Schema PUBLIC - Core](#3-schema-public---core)
4. [Schema PLANNING - Planificacion Estrategica](#4-schema-planning---planificacion-estrategica)
5. [Schema POI - Plan Operativo](#5-schema-poi---plan-operativo)
6. [Schema AGILE - Gestion Agil](#6-schema-agile---gestion-agil)
7. [Schema RRHH - Recursos Humanos](#7-schema-rrhh---recursos-humanos)
8. [Schema NOTIFICACIONES](#8-schema-notificaciones)
9. [Diagrama Entidad-Relacion](#9-diagrama-entidad-relacion)
10. [Indices y Optimizacion](#10-indices-y-optimizacion)
11. [Triggers y Funciones](#11-triggers-y-funciones)
12. [Vistas Materializadas](#12-vistas-materializadas)

---

## 1. VISION GENERAL

### 1.1. Motor de Base de Datos

| Aspecto | Valor |
|---------|-------|
| Motor | PostgreSQL 14+ |
| Charset | UTF-8 |
| Collation | es_PE.UTF-8 |
| Timezone | America/Lima |

### 1.2. Convenciones de Nombrado

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Schemas | snake_case | `planning`, `agile` |
| Tablas | plural, snake_case | `usuarios`, `historias_usuario` |
| Columnas | snake_case | `fecha_creacion`, `created_by` |
| PKs | `id` | `id` |
| FKs | `{tabla_singular}_id` | `proyecto_id`, `usuario_id` |
| Indices | `idx_{tabla}_{columnas}` | `idx_tareas_estado` |
| Constraints | `{tipo}_{tabla}_{descripcion}` | `fk_tareas_hu`, `chk_sprint_fechas` |

### 1.3. Campos de Auditoria Estandar

Todas las tablas principales incluyen:

```sql
-- Campos de auditoria
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
created_by INTEGER REFERENCES public.usuarios(id),
updated_by INTEGER REFERENCES public.usuarios(id),
activo BOOLEAN DEFAULT TRUE  -- Soft delete
```

---

## 2. ORGANIZACION DE SCHEMAS

```
sigp_db/
|
+-- public (Core del sistema)
|   +-- usuarios
|   +-- sesiones
|   +-- configuraciones
|   +-- auditoria_logs
|
+-- planning (Planificacion estrategica)
|   +-- pgd
|   +-- oei
|   +-- ogd
|   +-- oegd
|   +-- acciones_estrategicas
|
+-- poi (Plan Operativo Informatico)
|   +-- proyectos
|   +-- actividades
|   +-- subproyectos
|   +-- documentos
|   +-- actas
|   +-- requerimientos
|   +-- cronogramas
|   +-- informes_sprint
|   +-- informes_actividad
|
+-- agile (Gestion Agil)
|   +-- epicas
|   +-- sprints
|   +-- historias_usuario
|   +-- hu_criterios_aceptacion
|   +-- hu_requerimientos
|   +-- hu_dependencias
|   +-- tareas
|   +-- subtareas
|   +-- daily_meetings
|   +-- daily_participantes
|   +-- comentarios
|   +-- historial_cambios
|
+-- rrhh (Recursos Humanos)
|   +-- personal
|   +-- divisiones
|   +-- habilidades
|   +-- personal_habilidades
|   +-- asignaciones
|
+-- notificaciones
    +-- notificaciones
    +-- preferencias_notificacion
    +-- plantillas_notificacion
```

---

## 3. SCHEMA PUBLIC - CORE

### 3.1. usuarios

```sql
CREATE TABLE public.usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN (
        'ADMIN', 'PMO', 'COORDINADOR', 'SCRUM_MASTER',
        'PATROCINADOR', 'DESARROLLADOR', 'IMPLEMENTADOR'
    )),
    avatar_url VARCHAR(500),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX idx_usuarios_activo ON public.usuarios(activo);
```

### 3.2. sesiones

```sql
CREATE TABLE public.sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sesiones_usuario ON public.sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON public.sesiones(token_hash);
CREATE INDEX idx_sesiones_expires ON public.sesiones(expires_at);
```

### 3.3. auditoria_logs

```sql
CREATE TABLE public.auditoria_logs (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES public.usuarios(id),
    accion VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auditoria_usuario ON public.auditoria_logs(usuario_id);
CREATE INDEX idx_auditoria_tabla ON public.auditoria_logs(tabla_afectada);
CREATE INDEX idx_auditoria_fecha ON public.auditoria_logs(created_at);
```

---

## 4. SCHEMA PLANNING - PLANIFICACION ESTRATEGICA

### 4.1. pgd (Plan de Gobierno Digital)

```sql
CREATE TABLE planning.pgd (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    anio_inicio INTEGER NOT NULL,
    anio_fin INTEGER NOT NULL,
    estado VARCHAR(50) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Finalizado')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT chk_pgd_anios CHECK (anio_fin = anio_inicio + 3),
    CONSTRAINT chk_pgd_rango CHECK (anio_fin > anio_inicio)
);
```

### 4.2. oei (Objetivo Estrategico Institucional)

```sql
CREATE TABLE planning.oei (
    id SERIAL PRIMARY KEY,
    pgd_id INTEGER NOT NULL REFERENCES planning.pgd(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    indicador TEXT,
    metas_anuales JSONB,  -- [{anio: 2024, meta: 5}, ...]
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_oei_codigo_pgd UNIQUE (pgd_id, codigo)
);

CREATE INDEX idx_oei_pgd ON planning.oei(pgd_id);
```

### 4.3. ogd (Objetivo de Gobierno Digital)

```sql
CREATE TABLE planning.ogd (
    id SERIAL PRIMARY KEY,
    pgd_id INTEGER NOT NULL REFERENCES planning.pgd(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    indicador TEXT,
    metas_anuales JSONB,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_ogd_codigo_pgd UNIQUE (pgd_id, codigo)
);

CREATE INDEX idx_ogd_pgd ON planning.ogd(pgd_id);
```

### 4.4. oegd (Objetivo Especifico de Gobierno Digital)

```sql
CREATE TABLE planning.oegd (
    id SERIAL PRIMARY KEY,
    ogd_id INTEGER NOT NULL REFERENCES planning.ogd(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_oegd_codigo_ogd UNIQUE (ogd_id, codigo)
);

CREATE INDEX idx_oegd_ogd ON planning.oegd(ogd_id);
```

### 4.5. acciones_estrategicas

```sql
CREATE TABLE planning.acciones_estrategicas (
    id SERIAL PRIMARY KEY,
    oegd_id INTEGER NOT NULL REFERENCES planning.oegd(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_ae_codigo_oegd UNIQUE (oegd_id, codigo)
);

CREATE INDEX idx_ae_oegd ON planning.acciones_estrategicas(oegd_id);
```

### 4.6. Diagrama Planning

```
+-------+       +---------+       +----------+       +------+
|  PGD  | 1---N |   OEI   |       |   OGD    | 1---N | OEGD |
| 4 años|       | (anual) |       | (anual)  |       |      |
+-------+       +---------+       +----+-----+       +--+---+
                                       |                |
                                       | 1              | 1
                                       |                |
                                       N                N
                                  +---------+      +----+----+
                                  |   OGD   |      |   AE    |
                                  +---------+      +---------+
```

---

## 5. SCHEMA POI - PLAN OPERATIVO

### 5.1. proyectos

```sql
CREATE TABLE poi.proyectos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'Proyecto' CHECK (tipo = 'Proyecto'),
    clasificacion VARCHAR(50) CHECK (clasificacion IN ('Al ciudadano', 'Gestion interna')),
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'En planificacion', 'En desarrollo', 'Finalizado', 'Cancelado'
    )),

    -- Vinculacion estrategica
    accion_estrategica_id INTEGER REFERENCES planning.acciones_estrategicas(id),

    -- Responsables
    coordinador_id INTEGER REFERENCES public.usuarios(id),
    scrum_master_id INTEGER REFERENCES public.usuarios(id),
    patrocinador_id INTEGER REFERENCES public.usuarios(id),

    -- Financiero
    coordinacion VARCHAR(100),
    areas_financieras TEXT[],
    monto_anual DECIMAL(15, 2),
    anios INTEGER[],

    -- Fechas
    fecha_inicio DATE,
    fecha_fin DATE,

    -- Metodologia (siempre Scrum para proyectos)
    metodo_gestion VARCHAR(20) DEFAULT 'Scrum' CHECK (metodo_gestion = 'Scrum'),

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT chk_proyecto_fechas CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX idx_proyectos_estado ON poi.proyectos(estado);
CREATE INDEX idx_proyectos_ae ON poi.proyectos(accion_estrategica_id);
CREATE INDEX idx_proyectos_sm ON poi.proyectos(scrum_master_id);
CREATE INDEX idx_proyectos_coord ON poi.proyectos(coordinador_id);
```

### 5.2. actividades

```sql
CREATE TABLE poi.actividades (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'Actividad' CHECK (tipo = 'Actividad'),
    clasificacion VARCHAR(50) CHECK (clasificacion IN ('Al ciudadano', 'Gestion interna')),
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'En ejecucion', 'Finalizado', 'Suspendido'
    )),

    -- Vinculacion estrategica
    accion_estrategica_id INTEGER REFERENCES planning.acciones_estrategicas(id),

    -- Responsables
    coordinador_id INTEGER REFERENCES public.usuarios(id),

    -- Financiero
    coordinacion VARCHAR(100),
    areas_financieras TEXT[],
    monto_anual DECIMAL(15, 2),
    anios INTEGER[],

    -- Fechas (pueden ser continuas)
    fecha_inicio DATE,
    fecha_fin DATE,

    -- Metodologia (siempre Kanban para actividades)
    metodo_gestion VARCHAR(20) DEFAULT 'Kanban' CHECK (metodo_gestion = 'Kanban'),

    -- Periodicidad de informes
    periodicidad_informe VARCHAR(20) DEFAULT 'MENSUAL' CHECK (periodicidad_informe IN (
        'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'
    )),

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id)
);

CREATE INDEX idx_actividades_estado ON poi.actividades(estado);
CREATE INDEX idx_actividades_coord ON poi.actividades(coordinador_id);
```

### 5.3. subproyectos

```sql
CREATE TABLE poi.subproyectos (
    id SERIAL PRIMARY KEY,
    proyecto_padre_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    monto DECIMAL(15, 2),
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'En planificacion', 'En desarrollo', 'Finalizado'
    )),

    -- Equipo propio
    scrum_master_id INTEGER REFERENCES public.usuarios(id),

    -- Fechas
    fecha_inicio DATE,
    fecha_fin DATE,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_subproy_codigo UNIQUE (proyecto_padre_id, codigo)
);

CREATE INDEX idx_subproyectos_padre ON poi.subproyectos(proyecto_padre_id);
```

### 5.4. documentos

```sql
CREATE TABLE poi.documentos (
    id SERIAL PRIMARY KEY,

    -- Relacion polimorfica
    tipo_contenedor VARCHAR(20) NOT NULL CHECK (tipo_contenedor IN ('PROYECTO', 'SUBPROYECTO')),
    proyecto_id INTEGER REFERENCES poi.proyectos(id),
    subproyecto_id INTEGER REFERENCES poi.subproyectos(id),

    -- Contenido
    fase VARCHAR(50) NOT NULL CHECK (fase IN (
        'Analisis y Planificacion', 'Diseno', 'Desarrollo',
        'Pruebas', 'Implementacion', 'Mantenimiento'
    )),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    link VARCHAR(500),
    archivo_url VARCHAR(500),
    archivo_nombre VARCHAR(255),
    archivo_tamano INTEGER,

    -- Estado
    es_obligatorio BOOLEAN DEFAULT FALSE,
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'Aprobado', 'No Aprobado'
    )),

    -- Aprobacion
    aprobado_por INTEGER REFERENCES public.usuarios(id),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    observacion_aprobacion TEXT,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT chk_documento_contenedor CHECK (
        (tipo_contenedor = 'PROYECTO' AND proyecto_id IS NOT NULL AND subproyecto_id IS NULL) OR
        (tipo_contenedor = 'SUBPROYECTO' AND subproyecto_id IS NOT NULL AND proyecto_id IS NULL)
    )
);

CREATE INDEX idx_documentos_proyecto ON poi.documentos(proyecto_id);
CREATE INDEX idx_documentos_subproyecto ON poi.documentos(subproyecto_id);
CREATE INDEX idx_documentos_fase ON poi.documentos(fase);
CREATE INDEX idx_documentos_estado ON poi.documentos(estado);
```

### 5.5. actas

```sql
CREATE TABLE poi.actas (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Acta de Reunion', 'Acta de Constitucion')),
    fecha DATE NOT NULL,

    -- Estado y aprobacion
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'Aprobado', 'No Aprobado'
    )),
    archivo_url VARCHAR(500),

    -- Campos de Acta de Reunion
    tipo_reunion VARCHAR(50) CHECK (tipo_reunion IN (
        'Reunion inicial', 'Reunion de seguimiento', 'Reunion de cierre'
    )),
    fase_perteneciente VARCHAR(100),
    hora_inicio TIME,
    hora_fin TIME,
    asistentes JSONB,
    ausentes JSONB,
    agenda JSONB,
    temas_desarrollados JSONB,
    acuerdos JSONB,
    proximos_pasos JSONB,
    observaciones TEXT,

    -- Campos de Acta de Constitucion
    objetivo_smart TEXT,
    alcance TEXT,
    fuera_de_alcance TEXT,
    entregables JSONB,
    riesgos JSONB,
    presupuesto_estimado DECIMAL(15, 2),

    -- Aprobacion
    aprobado_por INTEGER REFERENCES public.usuarios(id),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_acta_codigo UNIQUE (proyecto_id, codigo)
);

CREATE INDEX idx_actas_proyecto ON poi.actas(proyecto_id);
CREATE INDEX idx_actas_tipo ON poi.actas(tipo);
CREATE INDEX idx_actas_estado ON poi.actas(estado);
```

### 5.6. requerimientos

```sql
CREATE TABLE poi.requerimientos (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    codigo VARCHAR(20) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
        'Requerimiento funcional', 'Requerimiento no funcional'
    )),
    descripcion TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),

    -- Origen
    acta_origen_id INTEGER REFERENCES poi.actas(id),

    -- Estado
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'En desarrollo', 'Completado', 'Descartado'
    )),

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_req_codigo UNIQUE (proyecto_id, codigo)
);

CREATE INDEX idx_requerimientos_proyecto ON poi.requerimientos(proyecto_id);
CREATE INDEX idx_requerimientos_tipo ON poi.requerimientos(tipo);
```

### 5.7. cronogramas

```sql
CREATE TABLE poi.cronogramas (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    version INTEGER DEFAULT 1,
    nombre VARCHAR(200),

    -- Contenido
    tareas JSONB,  -- Estructura del cronograma
    dependencias JSONB,
    hitos JSONB,
    ruta_critica JSONB,

    -- Archivos
    archivo_url VARCHAR(500),
    archivo_exportado_url VARCHAR(500),

    -- Estado
    estado VARCHAR(50) DEFAULT 'Borrador' CHECK (estado IN (
        'Borrador', 'Aprobado', 'Obsoleto'
    )),

    -- Aprobacion
    aprobado_por INTEGER REFERENCES public.usuarios(id),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id)
);

CREATE INDEX idx_cronogramas_proyecto ON poi.cronogramas(proyecto_id);
```

### 5.8. informes_sprint

```sql
CREATE TABLE poi.informes_sprint (
    id SERIAL PRIMARY KEY,
    sprint_id INTEGER NOT NULL REFERENCES agile.sprints(id),
    proyecto_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    codigo VARCHAR(20) NOT NULL,
    titulo VARCHAR(200) NOT NULL,

    -- Periodo
    fecha_inicio_sprint DATE NOT NULL,
    fecha_fin_sprint DATE NOT NULL,
    sprint_goal TEXT,

    -- Metricas (auto-generadas)
    total_hus_planificadas INTEGER DEFAULT 0,
    total_hus_completadas INTEGER DEFAULT 0,
    total_story_points_planificados INTEGER DEFAULT 0,
    total_story_points_completados INTEGER DEFAULT 0,
    velocity DECIMAL(5, 2),
    porcentaje_completado DECIMAL(5, 2),

    -- Contenido
    resumen_sprint TEXT,
    hus_completadas JSONB,
    hus_no_completadas JSONB,
    tareas_destacadas JSONB,
    impedimentos_encontrados TEXT,
    lecciones_aprendidas TEXT,

    -- Archivos
    archivo_generado_url VARCHAR(500),
    archivo_final_url VARCHAR(500),

    -- Flujo de aprobacion: SM -> Coordinador -> PMO
    estado VARCHAR(50) DEFAULT 'Borrador' CHECK (estado IN (
        'Borrador', 'Enviado', 'Aprobado_Coordinador', 'Aprobado_PMO', 'Rechazado'
    )),

    -- Aprobacion Coordinador
    coordinador_id INTEGER REFERENCES public.usuarios(id),
    aprobado_por_coordinador BOOLEAN DEFAULT FALSE,
    fecha_aprobacion_coordinador TIMESTAMP WITH TIME ZONE,
    observacion_coordinador TEXT,

    -- Aprobacion PMO
    aprobado_por_pmo INTEGER REFERENCES public.usuarios(id),
    fecha_aprobacion_pmo TIMESTAMP WITH TIME ZONE,
    observacion_pmo TEXT,

    -- Auditoria
    fecha_generacion TIMESTAMP WITH TIME ZONE,
    fecha_envio TIMESTAMP WITH TIME ZONE,
    modificado_por_sm BOOLEAN DEFAULT FALSE,
    fecha_modificacion_sm TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id)
);

CREATE INDEX idx_informes_sprint_sprint ON poi.informes_sprint(sprint_id);
CREATE INDEX idx_informes_sprint_proyecto ON poi.informes_sprint(proyecto_id);
CREATE INDEX idx_informes_sprint_estado ON poi.informes_sprint(estado);
```

### 5.9. informes_actividad

```sql
CREATE TABLE poi.informes_actividad (
    id SERIAL PRIMARY KEY,
    actividad_id INTEGER NOT NULL REFERENCES poi.actividades(id),
    codigo VARCHAR(20) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,

    -- Periodicidad
    periodicidad VARCHAR(20) NOT NULL CHECK (periodicidad IN (
        'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'
    )),
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,

    -- Contenido
    resumen_actividades TEXT,
    tareas_completadas INTEGER DEFAULT 0,
    tareas_pendientes INTEGER DEFAULT 0,
    observaciones TEXT,
    archivo_url VARCHAR(500),

    -- Aprobacion (solo PMO)
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'Aprobado', 'No Aprobado'
    )),
    aprobado_por INTEGER REFERENCES public.usuarios(id),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    observacion_aprobacion TEXT,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id)
);

CREATE INDEX idx_informes_actividad_actividad ON poi.informes_actividad(actividad_id);
CREATE INDEX idx_informes_actividad_estado ON poi.informes_actividad(estado);
CREATE INDEX idx_informes_actividad_periodo ON poi.informes_actividad(periodo_inicio, periodo_fin);
```

---

## 6. SCHEMA AGILE - GESTION AGIL

### 6.1. epicas

```sql
CREATE TABLE agile.epicas (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6366F1',

    -- Estado y prioridad
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'En progreso', 'Completada'
    )),
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),

    -- Fechas
    fecha_inicio DATE,
    fecha_fin DATE,

    -- Orden
    orden INTEGER DEFAULT 0,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_epica_codigo UNIQUE (proyecto_id, codigo)
);

CREATE INDEX idx_epicas_proyecto ON agile.epicas(proyecto_id);
CREATE INDEX idx_epicas_estado ON agile.epicas(estado);
```

### 6.2. sprints

```sql
CREATE TABLE agile.sprints (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    nombre VARCHAR(100) NOT NULL,
    sprint_goal TEXT,
    link_evidencia VARCHAR(500),

    -- Estado
    estado VARCHAR(50) DEFAULT 'Planificado' CHECK (estado IN (
        'Planificado', 'Activo', 'Completado', 'Cancelado'
    )),

    -- Fechas (duracion sugerida: 2 semanas)
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,

    -- Metricas (calculadas)
    capacidad_equipo INTEGER,
    story_points_comprometidos INTEGER DEFAULT 0,
    story_points_completados INTEGER DEFAULT 0,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT chk_sprint_fechas CHECK (fecha_fin > fecha_inicio)
);

CREATE INDEX idx_sprints_proyecto ON agile.sprints(proyecto_id);
CREATE INDEX idx_sprints_estado ON agile.sprints(estado);
CREATE INDEX idx_sprints_fechas ON agile.sprints(fecha_inicio, fecha_fin);
```

### 6.3. historias_usuario

```sql
CREATE TABLE agile.historias_usuario (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES poi.proyectos(id),
    epica_id INTEGER REFERENCES agile.epicas(id),
    sprint_id INTEGER REFERENCES agile.sprints(id),

    -- Identificacion
    codigo VARCHAR(20) NOT NULL,
    titulo VARCHAR(300) NOT NULL,

    -- Formato "Como... quiero... para..."
    rol VARCHAR(100),
    quiero TEXT,
    para TEXT,

    -- Estimacion y prioridad
    prioridad VARCHAR(20) DEFAULT 'Should' CHECK (prioridad IN (
        'Must', 'Should', 'Could', 'Wont'
    )),
    estimacion VARCHAR(10) CHECK (estimacion IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    story_points INTEGER CHECK (story_points IN (1, 2, 3, 5, 8, 13, 21)),

    -- Estado
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'En analisis', 'Lista', 'En desarrollo',
        'En pruebas', 'En revision', 'Terminada'
    )),

    -- Asignacion
    asignado_a INTEGER REFERENCES public.usuarios(id),

    -- Orden en backlog
    orden_backlog INTEGER DEFAULT 0,

    -- Fechas
    fecha_inicio DATE,
    fecha_fin DATE,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT uq_hu_codigo UNIQUE (proyecto_id, codigo)
);

CREATE INDEX idx_hu_proyecto ON agile.historias_usuario(proyecto_id);
CREATE INDEX idx_hu_epica ON agile.historias_usuario(epica_id);
CREATE INDEX idx_hu_sprint ON agile.historias_usuario(sprint_id);
CREATE INDEX idx_hu_estado ON agile.historias_usuario(estado);
CREATE INDEX idx_hu_asignado ON agile.historias_usuario(asignado_a);
CREATE INDEX idx_hu_backlog ON agile.historias_usuario(proyecto_id, orden_backlog);
```

### 6.4. hu_criterios_aceptacion

```sql
CREATE TABLE agile.hu_criterios_aceptacion (
    id SERIAL PRIMARY KEY,
    historia_usuario_id INTEGER NOT NULL REFERENCES agile.historias_usuario(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    orden INTEGER DEFAULT 0,

    -- Estado de verificacion
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'Cumplido', 'Fallido'
    )),
    verificado_por INTEGER REFERENCES public.usuarios(id),
    verificado_en TIMESTAMP WITH TIME ZONE,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hu_ca_hu ON agile.hu_criterios_aceptacion(historia_usuario_id);
```

### 6.5. hu_requerimientos (tabla puente)

```sql
CREATE TABLE agile.hu_requerimientos (
    id SERIAL PRIMARY KEY,
    historia_usuario_id INTEGER NOT NULL REFERENCES agile.historias_usuario(id) ON DELETE CASCADE,
    requerimiento_id INTEGER NOT NULL REFERENCES poi.requerimientos(id),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_hu_req UNIQUE (historia_usuario_id, requerimiento_id)
);

CREATE INDEX idx_hu_req_hu ON agile.hu_requerimientos(historia_usuario_id);
CREATE INDEX idx_hu_req_req ON agile.hu_requerimientos(requerimiento_id);
```

### 6.6. hu_dependencias

```sql
CREATE TABLE agile.hu_dependencias (
    id SERIAL PRIMARY KEY,
    historia_usuario_id INTEGER NOT NULL REFERENCES agile.historias_usuario(id) ON DELETE CASCADE,
    depende_de_id INTEGER NOT NULL REFERENCES agile.historias_usuario(id),
    tipo_dependencia VARCHAR(50) DEFAULT 'Bloqueada por' CHECK (tipo_dependencia IN (
        'Bloqueada por', 'Relacionada con'
    )),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_hu_dep UNIQUE (historia_usuario_id, depende_de_id),
    CONSTRAINT chk_hu_no_self_dep CHECK (historia_usuario_id != depende_de_id)
);

CREATE INDEX idx_hu_dep_hu ON agile.hu_dependencias(historia_usuario_id);
CREATE INDEX idx_hu_dep_dep ON agile.hu_dependencias(depende_de_id);
```

### 6.7. tareas (Entidad Unificada)

```sql
CREATE TABLE agile.tareas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,

    -- Tipo discriminador
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('SCRUM', 'KANBAN')),

    -- Contenido
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,

    -- Relaciones condicionales
    historia_usuario_id INTEGER REFERENCES agile.historias_usuario(id),
    actividad_id INTEGER REFERENCES poi.actividades(id),

    -- Estado y prioridad
    estado VARCHAR(50) DEFAULT 'Por hacer' CHECK (estado IN (
        'Por hacer', 'En progreso', 'En revision', 'Finalizado'
    )),
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),

    -- Asignacion
    asignado_a INTEGER REFERENCES public.usuarios(id),
    informador INTEGER REFERENCES public.usuarios(id),

    -- Tiempo
    horas_estimadas DECIMAL(5, 2),
    horas_reales DECIMAL(5, 2),

    -- Fechas
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    entregado_a_tiempo BOOLEAN,

    -- Evidencia (obligatoria para finalizar)
    evidencia_url VARCHAR(500),

    -- Validacion (Scrum Master/Coordinador)
    validada BOOLEAN DEFAULT FALSE,
    validada_por INTEGER REFERENCES public.usuarios(id),
    validada_en TIMESTAMP WITH TIME ZONE,
    observacion_validacion TEXT,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    -- Constraints
    CONSTRAINT chk_tarea_scrum CHECK (
        tipo != 'SCRUM' OR (historia_usuario_id IS NOT NULL AND actividad_id IS NULL)
    ),
    CONSTRAINT chk_tarea_kanban CHECK (
        tipo != 'KANBAN' OR (actividad_id IS NOT NULL AND historia_usuario_id IS NULL)
    )
);

CREATE INDEX idx_tareas_hu ON agile.tareas(historia_usuario_id);
CREATE INDEX idx_tareas_actividad ON agile.tareas(actividad_id);
CREATE INDEX idx_tareas_estado ON agile.tareas(estado);
CREATE INDEX idx_tareas_asignado ON agile.tareas(asignado_a);
CREATE INDEX idx_tareas_tipo ON agile.tareas(tipo);
```

### 6.8. subtareas (Solo Kanban)

```sql
CREATE TABLE agile.subtareas (
    id SERIAL PRIMARY KEY,
    tarea_id INTEGER NOT NULL REFERENCES agile.tareas(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,

    -- Estado y prioridad
    estado VARCHAR(50) DEFAULT 'Por hacer' CHECK (estado IN (
        'Por hacer', 'En progreso', 'Finalizado', 'Validado'
    )),
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),

    -- Asignacion
    responsable INTEGER REFERENCES public.usuarios(id),
    informador INTEGER REFERENCES public.usuarios(id),

    -- Tiempo
    horas_estimadas DECIMAL(5, 2),
    horas_reales DECIMAL(5, 2),

    -- Fechas
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    entregado_a_tiempo BOOLEAN,

    -- Evidencia (obligatoria para finalizar)
    evidencia_url VARCHAR(500),

    -- Validacion
    validada BOOLEAN DEFAULT FALSE,
    validado_por INTEGER REFERENCES public.usuarios(id),
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    observacion_validacion TEXT,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id)
);

CREATE INDEX idx_subtareas_tarea ON agile.subtareas(tarea_id);
CREATE INDEX idx_subtareas_estado ON agile.subtareas(estado);
CREATE INDEX idx_subtareas_responsable ON agile.subtareas(responsable);
```

### 6.9. daily_meetings

```sql
CREATE TABLE agile.daily_meetings (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,

    -- Relacion polimorfica
    tipo_poi VARCHAR(20) NOT NULL CHECK (tipo_poi IN ('PROYECTO', 'ACTIVIDAD')),
    proyecto_id INTEGER REFERENCES poi.proyectos(id),
    actividad_id INTEGER REFERENCES poi.actividades(id),
    sprint_id INTEGER REFERENCES agile.sprints(id),

    -- Facilitador
    facilitador_id INTEGER NOT NULL REFERENCES public.usuarios(id),

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES public.usuarios(id),

    CONSTRAINT chk_daily_poi CHECK (
        (tipo_poi = 'PROYECTO' AND proyecto_id IS NOT NULL AND actividad_id IS NULL) OR
        (tipo_poi = 'ACTIVIDAD' AND actividad_id IS NOT NULL AND proyecto_id IS NULL)
    )
);

CREATE INDEX idx_daily_proyecto ON agile.daily_meetings(proyecto_id);
CREATE INDEX idx_daily_actividad ON agile.daily_meetings(actividad_id);
CREATE INDEX idx_daily_sprint ON agile.daily_meetings(sprint_id);
CREATE INDEX idx_daily_fecha ON agile.daily_meetings(fecha);
```

### 6.10. daily_participantes

```sql
CREATE TABLE agile.daily_participantes (
    id SERIAL PRIMARY KEY,
    daily_meeting_id INTEGER NOT NULL REFERENCES agile.daily_meetings(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),

    -- Respuestas a las 3 preguntas
    que_hice_ayer TEXT,
    que_hare_hoy TEXT,
    impedimentos TEXT,

    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_daily_participante UNIQUE (daily_meeting_id, usuario_id)
);

CREATE INDEX idx_daily_part_daily ON agile.daily_participantes(daily_meeting_id);
CREATE INDEX idx_daily_part_usuario ON agile.daily_participantes(usuario_id);
```

### 6.11. comentarios

```sql
CREATE TABLE agile.comentarios (
    id SERIAL PRIMARY KEY,

    -- Relacion polimorfica
    entidad_tipo VARCHAR(20) NOT NULL CHECK (entidad_tipo IN ('HU', 'TAREA', 'SUBTAREA')),
    entidad_id INTEGER NOT NULL,

    -- Contenido
    texto TEXT NOT NULL,

    -- Hilos
    respuesta_a INTEGER REFERENCES agile.comentarios(id),

    -- Auditoria
    usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_comentarios_entidad ON agile.comentarios(entidad_tipo, entidad_id);
CREATE INDEX idx_comentarios_usuario ON agile.comentarios(usuario_id);
CREATE INDEX idx_comentarios_respuesta ON agile.comentarios(respuesta_a);
```

### 6.12. historial_cambios

```sql
CREATE TABLE agile.historial_cambios (
    id BIGSERIAL PRIMARY KEY,

    -- Relacion polimorfica
    entidad_tipo VARCHAR(20) NOT NULL,
    entidad_id INTEGER NOT NULL,

    -- Cambio
    accion VARCHAR(50) NOT NULL,
    campo_modificado VARCHAR(100),
    valor_anterior TEXT,
    valor_nuevo TEXT,

    -- Auditoria
    usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_historial_entidad ON agile.historial_cambios(entidad_tipo, entidad_id);
CREATE INDEX idx_historial_fecha ON agile.historial_cambios(created_at);
```

---

## 7. SCHEMA RRHH - RECURSOS HUMANOS

### 7.1. divisiones

```sql
CREATE TABLE rrhh.divisiones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    division_padre_id INTEGER REFERENCES rrhh.divisiones(id),
    jefe_id INTEGER REFERENCES public.usuarios(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_divisiones_padre ON rrhh.divisiones(division_padre_id);
```

### 7.2. personal

```sql
CREATE TABLE rrhh.personal (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES public.usuarios(id),
    division_id INTEGER REFERENCES rrhh.divisiones(id),

    -- Datos personales
    codigo_empleado VARCHAR(20) UNIQUE,
    dni VARCHAR(15),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),

    -- Laboral
    cargo VARCHAR(100),
    fecha_ingreso DATE,
    modalidad VARCHAR(50) CHECK (modalidad IN ('Planilla', 'CAS', 'Locador', 'Practicante')),

    -- Disponibilidad
    horas_semanales INTEGER DEFAULT 40,
    disponible BOOLEAN DEFAULT TRUE,

    -- Auditoria
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_personal_usuario ON rrhh.personal(usuario_id);
CREATE INDEX idx_personal_division ON rrhh.personal(division_id);
CREATE INDEX idx_personal_disponible ON rrhh.personal(disponible);
```

### 7.3. habilidades

```sql
CREATE TABLE rrhh.habilidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50) CHECK (categoria IN (
        'Lenguaje', 'Framework', 'Base de Datos', 'Cloud',
        'DevOps', 'Metodologia', 'Soft Skill', 'Otro'
    )),
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7.4. personal_habilidades

```sql
CREATE TABLE rrhh.personal_habilidades (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER NOT NULL REFERENCES rrhh.personal(id),
    habilidad_id INTEGER NOT NULL REFERENCES rrhh.habilidades(id),
    nivel VARCHAR(20) DEFAULT 'Intermedio' CHECK (nivel IN (
        'Basico', 'Intermedio', 'Avanzado', 'Experto'
    )),
    anios_experiencia INTEGER,
    certificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_personal_habilidad UNIQUE (personal_id, habilidad_id)
);

CREATE INDEX idx_ph_personal ON rrhh.personal_habilidades(personal_id);
CREATE INDEX idx_ph_habilidad ON rrhh.personal_habilidades(habilidad_id);
```

### 7.5. asignaciones

```sql
CREATE TABLE rrhh.asignaciones (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER NOT NULL REFERENCES rrhh.personal(id),

    -- Tipo de asignacion
    tipo_asignacion VARCHAR(20) NOT NULL CHECK (tipo_asignacion IN (
        'PROYECTO', 'ACTIVIDAD', 'SUBPROYECTO'
    )),
    proyecto_id INTEGER REFERENCES poi.proyectos(id),
    actividad_id INTEGER REFERENCES poi.actividades(id),
    subproyecto_id INTEGER REFERENCES poi.subproyectos(id),

    -- Rol en el equipo
    rol_equipo VARCHAR(50) NOT NULL,

    -- Dedicacion
    porcentaje_dedicacion INTEGER DEFAULT 100 CHECK (
        porcentaje_dedicacion > 0 AND porcentaje_dedicacion <= 100
    ),

    -- Fechas
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,

    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_asignaciones_personal ON rrhh.asignaciones(personal_id);
CREATE INDEX idx_asignaciones_proyecto ON rrhh.asignaciones(proyecto_id);
CREATE INDEX idx_asignaciones_actividad ON rrhh.asignaciones(actividad_id);
```

---

## 8. SCHEMA NOTIFICACIONES

### 8.1. notificaciones

```sql
CREATE TABLE notificaciones.notificaciones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
        'Proyectos', 'Sprints', 'Retrasos', 'Aprobaciones',
        'Tareas', 'Documentos', 'Sistema'
    )),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,

    -- Relacion con entidad
    entidad_tipo VARCHAR(50),
    entidad_id INTEGER,
    proyecto_id INTEGER REFERENCES poi.proyectos(id),

    -- Destinatario
    destinatario_id INTEGER NOT NULL REFERENCES public.usuarios(id),

    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    fecha_leida TIMESTAMP WITH TIME ZONE,

    -- Accion
    url_accion VARCHAR(500),

    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notif_destinatario ON notificaciones.notificaciones(destinatario_id);
CREATE INDEX idx_notif_tipo ON notificaciones.notificaciones(tipo);
CREATE INDEX idx_notif_leida ON notificaciones.notificaciones(destinatario_id, leida);
CREATE INDEX idx_notif_fecha ON notificaciones.notificaciones(created_at);
```

### 8.2. preferencias_notificacion

```sql
CREATE TABLE notificaciones.preferencias_notificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
    tipo_notificacion VARCHAR(50) NOT NULL,

    -- Canales
    email BOOLEAN DEFAULT TRUE,
    push BOOLEAN DEFAULT TRUE,
    en_app BOOLEAN DEFAULT TRUE,

    -- Frecuencia
    digest VARCHAR(20) DEFAULT 'INMEDIATO' CHECK (digest IN (
        'INMEDIATO', 'DIARIO', 'SEMANAL', 'DESACTIVADO'
    )),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_pref_usuario_tipo UNIQUE (usuario_id, tipo_notificacion)
);

CREATE INDEX idx_pref_usuario ON notificaciones.preferencias_notificacion(usuario_id);
```

---

## 9. DIAGRAMA ENTIDAD-RELACION

### 9.1. Vision General

```
+-----------------------------------------------------------------------------+
|                           DIAGRAMA E-R SIMPLIFICADO                          |
+-----------------------------------------------------------------------------+

PLANNING                         POI                              AGILE
=========                       =====                            =======

+-----+                    +------------+                    +---------+
| PGD |                    | PROYECTOS  |<------------------>| SPRINTS |
+--+--+                    +-----+------+                    +----+----+
   |                             |                               |
   | 1:N                         | 1:N                           | 1:N
   v                             v                               v
+-----+                    +------------+                    +------+
| OEI |                    |SUBPROYECTOS|                    |  HUs |
+-----+                    +------------+                    +--+---+
                                 |                              |
+-----+                          | 1:N                          | 1:N
| OGD |                          v                              v
+--+--+                    +------------+                    +-------+
   |                       | DOCUMENTOS |                    | TAREAS|
   | 1:N                   | ACTAS      |                    +-------+
   v                       | CRONOGRAMA |                        |
+------+                   +------------+                        | (solo KANBAN)
| OEGD |                                                         v
+--+---+                   +------------+                    +----------+
   |                       |ACTIVIDADES |<------------------>| SUBTAREAS|
   | 1:N                   +-----+------+                    +----------+
   v                             |
+----+                           | 1:N
| AE |<--------------------------+
+----+

                          RRHH                           NOTIFICACIONES
                         ======                          ===============

                    +----------+                         +---------------+
                    | PERSONAL |<----------------------->| NOTIFICACIONES|
                    +----+-----+                         +---------------+
                         |
                         | N:M
                         v
                    +-----------+
                    |HABILIDADES|
                    +-----------+
```

### 9.2. Relaciones Principales

| Desde | Hacia | Tipo | FK |
|-------|-------|------|-----|
| OEI | PGD | N:1 | pgd_id |
| OGD | PGD | N:1 | pgd_id |
| OEGD | OGD | N:1 | ogd_id |
| AE | OEGD | N:1 | oegd_id |
| Proyecto | AE | N:1 | accion_estrategica_id |
| Actividad | AE | N:1 | accion_estrategica_id |
| Subproyecto | Proyecto | N:1 | proyecto_padre_id |
| Sprint | Proyecto | N:1 | proyecto_id |
| Epica | Proyecto | N:1 | proyecto_id |
| HU | Proyecto | N:1 | proyecto_id |
| HU | Epica | N:1 | epica_id |
| HU | Sprint | N:1 | sprint_id |
| Tarea (SCRUM) | HU | N:1 | historia_usuario_id |
| Tarea (KANBAN) | Actividad | N:1 | actividad_id |
| Subtarea | Tarea | N:1 | tarea_id |

---

## 10. INDICES Y OPTIMIZACION

### 10.1. Indices Principales

```sql
-- Indices compuestos para consultas frecuentes

-- Backlog: HUs ordenadas por proyecto y backlog
CREATE INDEX idx_hu_backlog_orden ON agile.historias_usuario(proyecto_id, sprint_id, orden_backlog)
WHERE activo = TRUE AND sprint_id IS NULL;

-- Tablero: Tareas por sprint y estado
CREATE INDEX idx_tareas_tablero ON agile.tareas(historia_usuario_id, estado)
WHERE activo = TRUE;

-- Dashboard: Proyectos por estado
CREATE INDEX idx_proyectos_dashboard ON poi.proyectos(estado, fecha_fin)
WHERE activo = TRUE;

-- Notificaciones no leidas
CREATE INDEX idx_notif_no_leidas ON notificaciones.notificaciones(destinatario_id, created_at)
WHERE leida = FALSE;

-- Busqueda full-text en HUs
CREATE INDEX idx_hu_fulltext ON agile.historias_usuario
USING GIN (to_tsvector('spanish', titulo || ' ' || COALESCE(quiero, '') || ' ' || COALESCE(para, '')));
```

### 10.2. Particionamiento (Futuro)

```sql
-- Particionar historial_cambios por fecha
CREATE TABLE agile.historial_cambios (
    ...
) PARTITION BY RANGE (created_at);

CREATE TABLE agile.historial_cambios_2024
PARTITION OF agile.historial_cambios
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE agile.historial_cambios_2025
PARTITION OF agile.historial_cambios
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

---

## 11. TRIGGERS Y FUNCIONES

### 11.1. Trigger de Auditoria

```sql
CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas principales
CREATE TRIGGER trg_usuarios_audit
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
```

### 11.2. Trigger de Estado de HU

```sql
CREATE OR REPLACE FUNCTION agile.fn_actualizar_estado_hu()
RETURNS TRIGGER AS $$
DECLARE
    total_tareas INTEGER;
    tareas_finalizadas INTEGER;
BEGIN
    -- Solo para tareas tipo SCRUM
    IF NEW.tipo = 'SCRUM' AND NEW.historia_usuario_id IS NOT NULL THEN
        SELECT COUNT(*), COUNT(*) FILTER (WHERE estado = 'Finalizado')
        INTO total_tareas, tareas_finalizadas
        FROM agile.tareas
        WHERE historia_usuario_id = NEW.historia_usuario_id
          AND activo = TRUE;

        -- Si todas las tareas estan finalizadas, mover HU a revision
        IF total_tareas > 0 AND total_tareas = tareas_finalizadas THEN
            UPDATE agile.historias_usuario
            SET estado = 'En revision'
            WHERE id = NEW.historia_usuario_id
              AND estado = 'En desarrollo';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tarea_estado_hu
    AFTER UPDATE OF estado ON agile.tareas
    FOR EACH ROW EXECUTE FUNCTION agile.fn_actualizar_estado_hu();
```

### 11.3. Trigger de Metricas de Sprint

```sql
CREATE OR REPLACE FUNCTION agile.fn_actualizar_metricas_sprint()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agile.sprints s
    SET
        story_points_comprometidos = (
            SELECT COALESCE(SUM(story_points), 0)
            FROM agile.historias_usuario
            WHERE sprint_id = s.id AND activo = TRUE
        ),
        story_points_completados = (
            SELECT COALESCE(SUM(story_points), 0)
            FROM agile.historias_usuario
            WHERE sprint_id = s.id AND estado = 'Terminada' AND activo = TRUE
        )
    WHERE s.id = COALESCE(NEW.sprint_id, OLD.sprint_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hu_metricas_sprint
    AFTER INSERT OR UPDATE OR DELETE ON agile.historias_usuario
    FOR EACH ROW EXECUTE FUNCTION agile.fn_actualizar_metricas_sprint();
```

---

## 12. VISTAS MATERIALIZADAS

### 12.1. Vista de Dashboard de Proyectos

```sql
CREATE MATERIALIZED VIEW poi.mv_dashboard_proyectos AS
SELECT
    p.id,
    p.codigo,
    p.nombre,
    p.estado,
    p.fecha_inicio,
    p.fecha_fin,
    p.scrum_master_id,
    sm.nombre || ' ' || sm.apellido AS scrum_master_nombre,

    -- Metricas de sprints
    (SELECT COUNT(*) FROM agile.sprints WHERE proyecto_id = p.id AND activo = TRUE) AS total_sprints,
    (SELECT COUNT(*) FROM agile.sprints WHERE proyecto_id = p.id AND estado = 'Activo' AND activo = TRUE) AS sprints_activos,

    -- Metricas de HUs
    (SELECT COUNT(*) FROM agile.historias_usuario WHERE proyecto_id = p.id AND activo = TRUE) AS total_hus,
    (SELECT COUNT(*) FROM agile.historias_usuario WHERE proyecto_id = p.id AND estado = 'Terminada' AND activo = TRUE) AS hus_completadas,

    -- Avance
    CASE
        WHEN (SELECT COUNT(*) FROM agile.historias_usuario WHERE proyecto_id = p.id AND activo = TRUE) > 0
        THEN ROUND(
            (SELECT COUNT(*) FROM agile.historias_usuario WHERE proyecto_id = p.id AND estado = 'Terminada' AND activo = TRUE)::DECIMAL /
            (SELECT COUNT(*) FROM agile.historias_usuario WHERE proyecto_id = p.id AND activo = TRUE) * 100, 2
        )
        ELSE 0
    END AS porcentaje_avance,

    -- Velocidad promedio
    (SELECT ROUND(AVG(story_points_completados), 2)
     FROM agile.sprints
     WHERE proyecto_id = p.id AND estado = 'Completado' AND activo = TRUE) AS velocidad_promedio

FROM poi.proyectos p
LEFT JOIN public.usuarios sm ON p.scrum_master_id = sm.id
WHERE p.activo = TRUE;

-- Indice para la vista
CREATE UNIQUE INDEX idx_mv_dashboard_proyecto ON poi.mv_dashboard_proyectos(id);

-- Refrescar cada 5 minutos (via cron job)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY poi.mv_dashboard_proyectos;
```

### 12.2. Vista de Velocidad de Equipos

```sql
CREATE MATERIALIZED VIEW agile.mv_velocidad_equipos AS
SELECT
    s.proyecto_id,
    s.id AS sprint_id,
    s.nombre AS sprint_nombre,
    s.fecha_inicio,
    s.fecha_fin,
    s.story_points_comprometidos,
    s.story_points_completados,
    CASE
        WHEN s.story_points_comprometidos > 0
        THEN ROUND(s.story_points_completados::DECIMAL / s.story_points_comprometidos * 100, 2)
        ELSE 0
    END AS porcentaje_cumplimiento,
    s.story_points_completados AS velocidad
FROM agile.sprints s
WHERE s.estado = 'Completado' AND s.activo = TRUE
ORDER BY s.proyecto_id, s.fecha_inicio;

CREATE INDEX idx_mv_velocidad_proyecto ON agile.mv_velocidad_equipos(proyecto_id);
```

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Arquitectura de Base de Datos v1.0*
