-- ================================================================
-- Migración: Crear tabla evidencias_tarea
-- Descripción: Sistema de evidencias para tareas (múltiples evidencias por tarea)
-- Fecha: 2025-12-15
-- ================================================================

-- Crear tabla evidencias_tarea en el esquema agile
CREATE TABLE IF NOT EXISTS agile.evidencias_tarea (
    id SERIAL PRIMARY KEY,
    tarea_id INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    url VARCHAR(500) NOT NULL,
    tipo VARCHAR(50),
    tamano_bytes BIGINT,
    subido_por INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_evidencia_tarea FOREIGN KEY (tarea_id)
        REFERENCES agile.tareas(id) ON DELETE CASCADE,
    CONSTRAINT fk_evidencia_usuario FOREIGN KEY (subido_por)
        REFERENCES public.usuarios(id) ON DELETE RESTRICT
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_evidencias_tarea_tarea_id ON agile.evidencias_tarea(tarea_id);
CREATE INDEX idx_evidencias_tarea_subido_por ON agile.evidencias_tarea(subido_por);
CREATE INDEX idx_evidencias_tarea_created_at ON agile.evidencias_tarea(created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE agile.evidencias_tarea IS 'Evidencias y archivos adjuntos de tareas (múltiples por tarea)';
COMMENT ON COLUMN agile.evidencias_tarea.nombre IS 'Nombre descriptivo de la evidencia';
COMMENT ON COLUMN agile.evidencias_tarea.url IS 'URL o ruta del archivo de evidencia';
COMMENT ON COLUMN agile.evidencias_tarea.tipo IS 'Tipo de evidencia: documento, imagen, video, enlace, etc.';
COMMENT ON COLUMN agile.evidencias_tarea.tamano_bytes IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN agile.evidencias_tarea.subido_por IS 'Usuario que subió la evidencia';
