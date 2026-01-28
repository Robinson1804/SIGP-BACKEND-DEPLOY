import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNotificacionTimestamps1767100000000 implements MigrationInterface {
  name = 'FixNotificacionTimestamps1767100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cambiar columnas de timestamp without time zone a timestamp with time zone
    // Esto preserva los datos existentes y los interpreta como UTC
    await queryRunner.query(`
      ALTER TABLE notificaciones.notificaciones
      ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ
      USING "createdAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE notificaciones.notificaciones
      ALTER COLUMN "fechaLeida" TYPE TIMESTAMPTZ
      USING "fechaLeida" AT TIME ZONE 'UTC'
    `);

    // Configurar timezone de la base de datos a Lima
    await queryRunner.query(`
      ALTER DATABASE sigp_inei SET timezone TO 'America/Lima'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir a timestamp without time zone
    await queryRunner.query(`
      ALTER TABLE notificaciones.notificaciones
      ALTER COLUMN "createdAt" TYPE TIMESTAMP
      USING "createdAt" AT TIME ZONE 'America/Lima'
    `);

    await queryRunner.query(`
      ALTER TABLE notificaciones.notificaciones
      ALTER COLUMN "fechaLeida" TYPE TIMESTAMP
      USING "fechaLeida" AT TIME ZONE 'America/Lima'
    `);

    await queryRunner.query(`
      ALTER DATABASE sigp_inei SET timezone TO 'UTC'
    `);
  }
}
