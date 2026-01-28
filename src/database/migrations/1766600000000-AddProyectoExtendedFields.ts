import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProyectoExtendedFields1766600000000 implements MigrationInterface {
  name = 'AddProyectoExtendedFields1766600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna area_responsable
    await queryRunner.query(`
      ALTER TABLE poi.proyectos
      ADD COLUMN IF NOT EXISTS area_responsable VARCHAR(100)
    `);

    // Agregar columna costos_anuales (JSONB)
    await queryRunner.query(`
      ALTER TABLE poi.proyectos
      ADD COLUMN IF NOT EXISTS costos_anuales JSONB
    `);

    // Agregar columna alcances (array de texto)
    await queryRunner.query(`
      ALTER TABLE poi.proyectos
      ADD COLUMN IF NOT EXISTS alcances TEXT[]
    `);

    // Agregar columna problematica
    await queryRunner.query(`
      ALTER TABLE poi.proyectos
      ADD COLUMN IF NOT EXISTS problematica TEXT
    `);

    // Agregar columna beneficiarios
    await queryRunner.query(`
      ALTER TABLE poi.proyectos
      ADD COLUMN IF NOT EXISTS beneficiarios TEXT
    `);

    // Agregar columna beneficios (array de texto)
    await queryRunner.query(`
      ALTER TABLE poi.proyectos
      ADD COLUMN IF NOT EXISTS beneficios TEXT[]
    `);

    // Agregar comentarios a las columnas para documentación
    await queryRunner.query(`
      COMMENT ON COLUMN poi.proyectos.area_responsable IS 'Área responsable del proyecto (ej: OTIN, OGD, etc.)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN poi.proyectos.costos_anuales IS 'Costos estimados por año en formato JSON [{anio: number, monto: number}]'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN poi.proyectos.alcances IS 'Lista de items que describen el alcance del proyecto'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN poi.proyectos.problematica IS 'Problemática identificada que el proyecto busca resolver'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN poi.proyectos.beneficiarios IS 'Beneficiarios del proyecto'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN poi.proyectos.beneficios IS 'Lista de beneficios esperados del proyecto'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE poi.proyectos DROP COLUMN IF EXISTS area_responsable`);
    await queryRunner.query(`ALTER TABLE poi.proyectos DROP COLUMN IF EXISTS costos_anuales`);
    await queryRunner.query(`ALTER TABLE poi.proyectos DROP COLUMN IF EXISTS alcances`);
    await queryRunner.query(`ALTER TABLE poi.proyectos DROP COLUMN IF EXISTS problematica`);
    await queryRunner.query(`ALTER TABLE poi.proyectos DROP COLUMN IF EXISTS beneficiarios`);
    await queryRunner.query(`ALTER TABLE poi.proyectos DROP COLUMN IF EXISTS beneficios`);
  }
}
