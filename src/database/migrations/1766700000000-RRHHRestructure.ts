import { MigrationInterface, QueryRunner } from 'typeorm';

export class RRHHRestructure1766700000000 implements MigrationInterface {
  name = 'RRHHRestructure1766700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna coordinador_id a divisiones
    await queryRunner.query(`
      ALTER TABLE rrhh.divisiones
      ADD COLUMN IF NOT EXISTS coordinador_id INTEGER REFERENCES rrhh.personal(id) ON DELETE SET NULL
    `);

    // 2. Crear índice para coordinador_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_divisiones_coordinador
      ON rrhh.divisiones(coordinador_id)
    `);

    // 3. Crear tabla division_scrum_masters (Many-to-Many)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rrhh.division_scrum_masters (
        division_id INTEGER NOT NULL REFERENCES rrhh.divisiones(id) ON DELETE CASCADE,
        personal_id INTEGER NOT NULL REFERENCES rrhh.personal(id) ON DELETE CASCADE,
        fecha_asignacion DATE DEFAULT CURRENT_DATE,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (division_id, personal_id)
      )
    `);

    // 4. Crear índices para la tabla intermedia
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_division_scrum_masters_division
      ON rrhh.division_scrum_masters(division_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_division_scrum_masters_personal
      ON rrhh.division_scrum_masters(personal_id)
    `);

    // 5. Agregar columna roles_adicionales a usuarios
    await queryRunner.query(`
      ALTER TABLE public.usuarios
      ADD COLUMN IF NOT EXISTS roles_adicionales JSONB DEFAULT '[]'
    `);

    // 6. Migrar datos de modalidad (si existen registros con valores antiguos)
    await queryRunner.query(`
      UPDATE rrhh.personal SET modalidad = 'Nombrado' WHERE modalidad = 'Planilla'
    `);

    await queryRunner.query(`
      UPDATE rrhh.personal SET modalidad = 'Orden de Servicio' WHERE modalidad = 'Locador'
    `);

    // 7. Actualizar el default de modalidad en la tabla
    await queryRunner.query(`
      ALTER TABLE rrhh.personal
      ALTER COLUMN modalidad SET DEFAULT 'Nombrado'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en orden inverso

    // 1. Revertir default de modalidad
    await queryRunner.query(`
      ALTER TABLE rrhh.personal
      ALTER COLUMN modalidad SET DEFAULT 'Planilla'
    `);

    // 2. Revertir datos de modalidad
    await queryRunner.query(`
      UPDATE rrhh.personal SET modalidad = 'Planilla' WHERE modalidad = 'Nombrado'
    `);

    await queryRunner.query(`
      UPDATE rrhh.personal SET modalidad = 'Locador' WHERE modalidad = 'Orden de Servicio'
    `);

    // 3. Eliminar columna roles_adicionales
    await queryRunner.query(`
      ALTER TABLE public.usuarios DROP COLUMN IF EXISTS roles_adicionales
    `);

    // 4. Eliminar índices de la tabla intermedia
    await queryRunner.query(`
      DROP INDEX IF EXISTS rrhh.idx_division_scrum_masters_personal
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS rrhh.idx_division_scrum_masters_division
    `);

    // 5. Eliminar tabla division_scrum_masters
    await queryRunner.query(`
      DROP TABLE IF EXISTS rrhh.division_scrum_masters
    `);

    // 6. Eliminar índice de coordinador
    await queryRunner.query(`
      DROP INDEX IF EXISTS rrhh.idx_divisiones_coordinador
    `);

    // 7. Eliminar columna coordinador_id
    await queryRunner.query(`
      ALTER TABLE rrhh.divisiones DROP COLUMN IF EXISTS coordinador_id
    `);
  }
}
