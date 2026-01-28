import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActasFields1734800000000 implements MigrationInterface {
  name = 'AddActasFields1734800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convertir campos de texto a JSONB para listas
    await queryRunner.query(`
      ALTER TABLE poi.actas
      ALTER COLUMN alcance TYPE JSONB USING CASE
        WHEN alcance IS NULL THEN NULL
        ELSE to_jsonb(ARRAY[alcance])
      END
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas
      ALTER COLUMN fuera_de_alcance TYPE JSONB USING CASE
        WHEN fuera_de_alcance IS NULL THEN NULL
        ELSE to_jsonb(ARRAY[fuera_de_alcance])
      END
    `);

    // Campos adicionales Acta de Constitución
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS justificacion TEXT
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS supuestos JSONB
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS restricciones JSONB
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS cronograma_hitos JSONB
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS equipo_proyecto JSONB
    `);

    // Campos adicionales Acta de Reunión
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS modalidad VARCHAR(20)
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS lugar_link TEXT
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS moderador_id INTEGER REFERENCES public.usuarios(id)
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS proxima_reunion_fecha DATE
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS anexos_referenciados JSONB
    `);

    // Campo para documento firmado subido
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS documento_firmado_url TEXT
    `);
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS documento_firmado_fecha TIMESTAMP WITH TIME ZONE
    `);

    // Comentario para rechazo
    await queryRunner.query(`
      ALTER TABLE poi.actas ADD COLUMN IF NOT EXISTS comentario_rechazo TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS justificacion`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS supuestos`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS restricciones`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS cronograma_hitos`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS equipo_proyecto`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS modalidad`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS lugar_link`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS moderador_id`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS proxima_reunion_fecha`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS anexos_referenciados`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS documento_firmado_url`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS documento_firmado_fecha`);
    await queryRunner.query(`ALTER TABLE poi.actas DROP COLUMN IF EXISTS comentario_rechazo`);
  }
}
