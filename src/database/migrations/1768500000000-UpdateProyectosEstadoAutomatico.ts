import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to update existing projects' states based on their data:
 *
 * - Finalizado: Project has sprints AND all sprints are "Finalizado"
 * - En desarrollo: Project has at least one sprint (any state)
 * - En planificacion: Project has all required fields completed
 * - Pendiente: Default state
 */
export class UpdateProyectosEstadoAutomatico1768500000000 implements MigrationInterface {
  name = 'UpdateProyectosEstadoAutomatico1768500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Update projects to "Finalizado" if ALL their sprints are "Finalizado"
    await queryRunner.query(`
      UPDATE poi.proyectos p
      SET estado = 'Finalizado'
      WHERE p.activo = true
        AND p.estado != 'Cancelado'
        AND p.estado != 'Finalizado'
        AND EXISTS (
          SELECT 1 FROM agile.sprints s
          WHERE s.proyecto_id = p.id AND s.activo = true
        )
        AND NOT EXISTS (
          SELECT 1 FROM agile.sprints s
          WHERE s.proyecto_id = p.id
            AND s.activo = true
            AND s.estado != 'Finalizado'
        );
    `);

    // Step 2: Update projects to "En desarrollo" if they have any sprints (that aren't all finalized)
    await queryRunner.query(`
      UPDATE poi.proyectos p
      SET estado = 'En desarrollo'
      WHERE p.activo = true
        AND p.estado != 'Cancelado'
        AND p.estado != 'Finalizado'
        AND p.estado != 'En desarrollo'
        AND EXISTS (
          SELECT 1 FROM agile.sprints s
          WHERE s.proyecto_id = p.id AND s.activo = true
        );
    `);

    // Step 3: Update projects to "En planificacion" if all required fields are completed
    // Required fields: nombre, descripcion, clasificacion, accion_estrategica_id,
    // coordinador_id, scrum_master_id, coordinacion, areas_financieras, fecha_inicio, fecha_fin, anios
    await queryRunner.query(`
      UPDATE poi.proyectos p
      SET estado = 'En planificacion'
      WHERE p.activo = true
        AND p.estado = 'Pendiente'
        AND p.nombre IS NOT NULL AND p.nombre != ''
        AND p.descripcion IS NOT NULL AND p.descripcion != ''
        AND p.clasificacion IS NOT NULL
        AND p.accion_estrategica_id IS NOT NULL
        AND p.coordinador_id IS NOT NULL
        AND p.scrum_master_id IS NOT NULL
        AND p.coordinacion IS NOT NULL AND p.coordinacion != ''
        AND p.areas_financieras IS NOT NULL AND array_length(p.areas_financieras, 1) > 0
        AND p.fecha_inicio IS NOT NULL
        AND p.fecha_fin IS NOT NULL
        AND p.anios IS NOT NULL AND array_length(p.anios, 1) > 0;
    `);

    // Log results
    const results = await queryRunner.query(`
      SELECT estado, COUNT(*) as count
      FROM poi.proyectos
      WHERE activo = true
      GROUP BY estado
      ORDER BY estado;
    `);
    console.log('Project states after migration:', results);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reset all non-cancelled/non-finalized projects to "Pendiente"
    // Note: This is a destructive operation and may not accurately restore the previous state
    await queryRunner.query(`
      UPDATE poi.proyectos
      SET estado = 'Pendiente'
      WHERE activo = true
        AND estado NOT IN ('Cancelado', 'Finalizado');
    `);
  }
}
