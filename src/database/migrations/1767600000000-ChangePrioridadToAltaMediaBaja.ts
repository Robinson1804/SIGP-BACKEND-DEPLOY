import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePrioridadToAltaMediaBaja1767600000000
  implements MigrationInterface
{
  name = 'ChangePrioridadToAltaMediaBaja1767600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the default value
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad DROP DEFAULT;
    `);

    // Convert column to VARCHAR to allow text manipulation
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad TYPE VARCHAR(20) USING prioridad::VARCHAR;
    `);

    // Now update the values
    await queryRunner.query(`
      UPDATE agile.historias_usuario
      SET prioridad = CASE
        WHEN prioridad = 'Must' THEN 'Alta'
        WHEN prioridad = 'Should' THEN 'Media'
        WHEN prioridad = 'Could' THEN 'Baja'
        WHEN prioridad = 'Wont' THEN 'Baja'
        ELSE 'Media'
      END;
    `);

    // Drop the old enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS agile.historias_usuario_prioridad_enum;
    `);

    // Create new enum type
    await queryRunner.query(`
      CREATE TYPE agile.historias_usuario_prioridad_enum AS ENUM ('Alta', 'Media', 'Baja');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad TYPE agile.historias_usuario_prioridad_enum
      USING prioridad::agile.historias_usuario_prioridad_enum;
    `);

    // Set new default
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad SET DEFAULT 'Media';
    `);

    // Also update epicas table if it has prioridad column with MoSCoW values
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'agile' AND table_name = 'epicas' AND column_name = 'prioridad'
        ) THEN
          -- Drop default first
          ALTER TABLE agile.epicas ALTER COLUMN prioridad DROP DEFAULT;

          -- Convert to varchar first
          ALTER TABLE agile.epicas ALTER COLUMN prioridad TYPE VARCHAR(20) USING prioridad::VARCHAR;

          -- Update values
          UPDATE agile.epicas
          SET prioridad = CASE
            WHEN prioridad = 'Must' THEN 'Alta'
            WHEN prioridad = 'Should' THEN 'Media'
            WHEN prioridad = 'Could' THEN 'Baja'
            WHEN prioridad = 'Wont' THEN 'Baja'
            ELSE prioridad
          END;

          -- Convert back to enum
          ALTER TABLE agile.epicas
          ALTER COLUMN prioridad TYPE agile.historias_usuario_prioridad_enum
          USING prioridad::agile.historias_usuario_prioridad_enum;

          -- Set new default
          ALTER TABLE agile.epicas ALTER COLUMN prioridad SET DEFAULT 'Media';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop default
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad DROP DEFAULT;
    `);

    // Convert column to varchar
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad TYPE VARCHAR(20) USING prioridad::VARCHAR;
    `);

    // Update values back to MoSCoW
    await queryRunner.query(`
      UPDATE agile.historias_usuario
      SET prioridad = CASE
        WHEN prioridad = 'Alta' THEN 'Must'
        WHEN prioridad = 'Media' THEN 'Should'
        WHEN prioridad = 'Baja' THEN 'Could'
        ELSE 'Should'
      END;
    `);

    // Drop new enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS agile.historias_usuario_prioridad_enum;
    `);

    // Create old enum type
    await queryRunner.query(`
      CREATE TYPE agile.historias_usuario_prioridad_enum AS ENUM ('Must', 'Should', 'Could', 'Wont');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad TYPE agile.historias_usuario_prioridad_enum
      USING prioridad::agile.historias_usuario_prioridad_enum;
    `);

    // Set default
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ALTER COLUMN prioridad SET DEFAULT 'Should';
    `);
  }
}
