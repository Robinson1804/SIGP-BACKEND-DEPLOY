import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddValidacionesNotificationType1767200000000 implements MigrationInterface {
  name = 'AddValidacionesNotificationType1767200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar el valor 'Validaciones' al enum de tipo de notificación
    // Ejecutar fuera de transacción porque ADD VALUE no puede estar en transacción
    await queryRunner.commitTransaction();

    await queryRunner.query(`
      ALTER TYPE notificaciones.notificaciones_tipo_enum
      ADD VALUE IF NOT EXISTS 'Validaciones' BEFORE 'Aprobaciones'
    `);

    // Iniciar nueva transacción para el resto
    await queryRunner.startTransaction();

    // Actualizar notificaciones existentes de cronograma enviadas a PMO/PATROCINADOR
    // que tenían tipo 'Aprobaciones' y deberían ser 'Validaciones'
    // (las que tienen titulo con "pendiente de aprobación")
    // Nota: Esto se ejecutará en una nueva transacción después del commit
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir las notificaciones a 'Aprobaciones'
    await queryRunner.query(`
      UPDATE notificaciones.notificaciones
      SET tipo = 'Aprobaciones'
      WHERE tipo = 'Validaciones'
    `);

    // No se puede eliminar un valor de enum en PostgreSQL fácilmente
    // Se deja el valor en el enum pero sin usar
  }
}
