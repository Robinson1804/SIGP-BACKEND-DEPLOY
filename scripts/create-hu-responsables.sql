-- Crear tabla hu_responsables para soportar múltiples responsables por historia de usuario
CREATE TABLE IF NOT EXISTS agile.hu_responsables (
  id SERIAL PRIMARY KEY,
  historia_usuario_id INT NOT NULL REFERENCES agile.historias_usuario(id) ON DELETE CASCADE,
  personal_id INT NOT NULL REFERENCES rrhh.personal(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INT,
  UNIQUE(historia_usuario_id, personal_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_hu_responsables_hu_id ON agile.hu_responsables(historia_usuario_id);
CREATE INDEX IF NOT EXISTS idx_hu_responsables_personal_id ON agile.hu_responsables(personal_id);

-- Migrar datos existentes de asignado_a a la nueva tabla
INSERT INTO agile.hu_responsables (historia_usuario_id, personal_id, activo, created_at)
SELECT id, asignado_a, true, NOW()
FROM agile.historias_usuario
WHERE asignado_a IS NOT NULL
ON CONFLICT (historia_usuario_id, personal_id) DO NOTHING;
