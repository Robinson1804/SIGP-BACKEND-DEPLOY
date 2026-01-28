import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHistoriaUsuarioExtendedFields1767400000000 implements MigrationInterface {
  name = 'AddHistoriaUsuarioExtendedFields1767400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar campos extendidos a historias_usuario
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ADD COLUMN IF NOT EXISTS requerimiento_id INTEGER,
      ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
      ADD COLUMN IF NOT EXISTS fecha_fin DATE,
      ADD COLUMN IF NOT EXISTS imagen_url TEXT
    `);

    // Agregar foreign key para requerimiento_id
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'fk_historia_usuario_requerimiento'
        ) THEN
          ALTER TABLE agile.historias_usuario
          ADD CONSTRAINT fk_historia_usuario_requerimiento
          FOREIGN KEY (requerimiento_id) REFERENCES poi.requerimientos(id)
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    console.log('✅ Campos extendidos agregados a tabla historias_usuario');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      DROP CONSTRAINT IF EXISTS fk_historia_usuario_requerimiento
    `);

    // Eliminar columnas
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      DROP COLUMN IF EXISTS requerimiento_id,
      DROP COLUMN IF EXISTS fecha_inicio,
      DROP COLUMN IF EXISTS fecha_fin,
      DROP COLUMN IF EXISTS imagen_url
    `);
  }
}
