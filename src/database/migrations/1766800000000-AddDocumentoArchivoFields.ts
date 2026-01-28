import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentoArchivoFields1766800000000 implements MigrationInterface {
  name = 'AddDocumentoArchivoFields1766800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna archivo_id para referencia a tabla archivos
    await queryRunner.query(`
      ALTER TABLE poi.documentos
      ADD COLUMN IF NOT EXISTS archivo_id UUID
    `);

    // 2. Agregar columna tipo_archivo para el mime type
    await queryRunner.query(`
      ALTER TABLE poi.documentos
      ADD COLUMN IF NOT EXISTS tipo_archivo VARCHAR(100)
    `);

    // 3. Crear índice para archivo_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_documentos_archivo_id
      ON poi.documentos(archivo_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice
    await queryRunner.query(`
      DROP INDEX IF EXISTS poi.idx_documentos_archivo_id
    `);

    // Eliminar columna tipo_archivo
    await queryRunner.query(`
      ALTER TABLE poi.documentos
      DROP COLUMN IF EXISTS tipo_archivo
    `);

    // Eliminar columna archivo_id
    await queryRunner.query(`
      ALTER TABLE poi.documentos
      DROP COLUMN IF EXISTS archivo_id
    `);
  }
}
