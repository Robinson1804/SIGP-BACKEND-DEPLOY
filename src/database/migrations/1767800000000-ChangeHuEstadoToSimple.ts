import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeHuEstadoToSimple1767800000000 implements MigrationInterface {
  name = 'ChangeHuEstadoToSimple1767800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the default value
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // Convert column to VARCHAR to allow text manipulation
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado TYPE VARCHAR(50) USING estado::VARCHAR;
    `);

    // Update existing values to new states
    await queryRunner.query(`
      UPDATE agile.historias_usuario
      SET estado = CASE
        WHEN estado = 'Pendiente' THEN 'Por hacer'
        WHEN estado = 'En analisis' THEN 'Por hacer'
        WHEN estado = 'Lista' THEN 'Por hacer'
        WHEN estado = 'En desarrollo' THEN 'En progreso'
        WHEN estado = 'En pruebas' THEN 'En progreso'
        WHEN estado = 'En revision' THEN 'En progreso'
        WHEN estado = 'Terminada' THEN 'Finalizado'
        ELSE 'Por hacer'
      END;
    `);

    // Drop the old enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS agile.historias_usuario_estado_enum;
    `);

    // Create new enum type with simple states
    await queryRunner.query(`
      CREATE TYPE agile.historias_usuario_estado_enum AS ENUM ('Por hacer', 'En progreso', 'Finalizado');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado TYPE agile.historias_usuario_estado_enum
      USING estado::agile.historias_usuario_estado_enum;
    `);

    // Set new default
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado SET DEFAULT 'Por hacer';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop default
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // Convert column to varchar
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado TYPE VARCHAR(50) USING estado::VARCHAR;
    `);

    // Update values back to original states
    await queryRunner.query(`
      UPDATE agile.historias_usuario
      SET estado = CASE
        WHEN estado = 'Por hacer' THEN 'Pendiente'
        WHEN estado = 'En progreso' THEN 'En desarrollo'
        WHEN estado = 'Finalizado' THEN 'Terminada'
        ELSE 'Pendiente'
      END;
    `);

    // Drop new enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS agile.historias_usuario_estado_enum;
    `);

    // Create old enum type
    await queryRunner.query(`
      CREATE TYPE agile.historias_usuario_estado_enum AS ENUM ('Pendiente', 'En analisis', 'Lista', 'En desarrollo', 'En pruebas', 'En revision', 'Terminada');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado TYPE agile.historias_usuario_estado_enum
      USING estado::agile.historias_usuario_estado_enum;
    `);

    // Set default
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN estado SET DEFAULT 'Pendiente';
    `);
  }
}
