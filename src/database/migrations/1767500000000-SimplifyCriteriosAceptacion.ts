import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyCriteriosAceptacion1767500000000
  implements MigrationInterface
{
  name = 'SimplifyCriteriosAceptacion1767500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      ADD COLUMN IF NOT EXISTS descripcion TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      ADD COLUMN IF NOT EXISTS completado BOOLEAN DEFAULT FALSE;
    `);

    // Migrate data: concatenate given, when, then into descripcion
    await queryRunner.query(`
      UPDATE agile.criterios_aceptacion
      SET descripcion = CONCAT(
        'Dado que ', COALESCE(given, ''),
        ', cuando ', COALESCE("when", ''),
        ', entonces ', COALESCE("then", '')
      ),
      completado = (estado = 'Cumplido')
      WHERE descripcion IS NULL;
    `);

    // Make descripcion NOT NULL after migration
    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      ALTER COLUMN descripcion SET NOT NULL;
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      DROP COLUMN IF EXISTS given;
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      DROP COLUMN IF EXISTS "when";
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      DROP COLUMN IF EXISTS "then";
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      DROP COLUMN IF EXISTS estado;
    `);

    // Drop the enum type if it exists and is not used elsewhere
    await queryRunner.query(`
      DROP TYPE IF EXISTS agile.criterios_aceptacion_estado_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate enum type
    await queryRunner.query(`
      CREATE TYPE agile.criterios_aceptacion_estado_enum AS ENUM ('Pendiente', 'Cumplido', 'Fallido');
    `);

    // Re-add old columns
    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      ADD COLUMN given TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      ADD COLUMN "when" TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      ADD COLUMN "then" TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      ADD COLUMN estado agile.criterios_aceptacion_estado_enum DEFAULT 'Pendiente';
    `);

    // Migrate data back (best effort - descripcion to given)
    await queryRunner.query(`
      UPDATE agile.criterios_aceptacion
      SET given = descripcion,
          "when" = '',
          "then" = '',
          estado = CASE WHEN completado THEN 'Cumplido' ELSE 'Pendiente' END;
    `);

    // Drop new columns
    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      DROP COLUMN IF EXISTS descripcion;
    `);

    await queryRunner.query(`
      ALTER TABLE agile.criterios_aceptacion
      DROP COLUMN IF EXISTS completado;
    `);
  }
}
