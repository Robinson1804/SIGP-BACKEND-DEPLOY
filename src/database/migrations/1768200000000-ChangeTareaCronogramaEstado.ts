import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTareaCronogramaEstado1768200000000 implements MigrationInterface {
  name = 'ChangeTareaCronogramaEstado1768200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the default value
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // Convert column to VARCHAR to allow text manipulation
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado TYPE VARCHAR(50) USING estado::VARCHAR;
    `);

    // Update existing values to new states
    await queryRunner.query(`
      UPDATE poi.tareas_cronograma
      SET estado = CASE
        WHEN estado = 'Pendiente' THEN 'Por hacer'
        WHEN estado = 'En Progreso' THEN 'En progreso'
        WHEN estado = 'Completada' THEN 'Completado'
        WHEN estado = 'Bloqueada' THEN 'Por hacer'
        WHEN estado = 'Cancelada' THEN 'Completado'
        ELSE 'Por hacer'
      END;
    `);

    // Drop the old enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS poi.tareas_cronograma_estado_enum;
    `);

    // Create new enum type with simple states
    await queryRunner.query(`
      CREATE TYPE poi.tareas_cronograma_estado_enum AS ENUM ('Por hacer', 'En progreso', 'Completado');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado TYPE poi.tareas_cronograma_estado_enum
      USING estado::poi.tareas_cronograma_estado_enum;
    `);

    // Set new default
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado SET DEFAULT 'Por hacer';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop default
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // Convert column to varchar
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado TYPE VARCHAR(50) USING estado::VARCHAR;
    `);

    // Update values back to original states
    await queryRunner.query(`
      UPDATE poi.tareas_cronograma
      SET estado = CASE
        WHEN estado = 'Por hacer' THEN 'Pendiente'
        WHEN estado = 'En progreso' THEN 'En Progreso'
        WHEN estado = 'Completado' THEN 'Completada'
        ELSE 'Pendiente'
      END;
    `);

    // Drop new enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS poi.tareas_cronograma_estado_enum;
    `);

    // Create old enum type
    await queryRunner.query(`
      CREATE TYPE poi.tareas_cronograma_estado_enum AS ENUM ('Pendiente', 'En Progreso', 'Completada', 'Bloqueada', 'Cancelada');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado TYPE poi.tareas_cronograma_estado_enum
      USING estado::poi.tareas_cronograma_estado_enum;
    `);

    // Set default
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ALTER COLUMN estado SET DEFAULT 'Pendiente';
    `);
  }
}
