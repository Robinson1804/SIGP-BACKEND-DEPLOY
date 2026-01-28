import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create PostgreSQL Functions and Triggers
 *
 * Creates common functions and triggers used across all schemas:
 * - fn_update_updated_at: Auto-update updated_at timestamp
 * - fn_generate_codigo: Generate sequential codes
 * - fn_log_audit: Log changes to auditoria_logs
 */
export class CreateFunctionsAndTriggers1734153700000 implements MigrationInterface {
  name = 'CreateFunctionsAndTriggers1734153700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Function: Auto-update updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Function: Generate sequential codes with prefix
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_generate_codigo(
        p_prefix VARCHAR,
        p_sequence_name VARCHAR,
        p_padding INTEGER DEFAULT 4
      )
      RETURNS VARCHAR AS $$
      DECLARE
        v_next_val BIGINT;
        v_codigo VARCHAR;
      BEGIN
        EXECUTE format('SELECT nextval(%L)', p_sequence_name) INTO v_next_val;
        v_codigo := p_prefix || '-' || LPAD(v_next_val::TEXT, p_padding, '0');
        RETURN v_codigo;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Function: Log audit changes
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_log_audit()
      RETURNS TRIGGER AS $$
      DECLARE
        v_old_data JSONB;
        v_new_data JSONB;
        v_usuario_id INTEGER;
      BEGIN
        -- Get usuario_id from NEW or OLD
        IF TG_OP = 'DELETE' THEN
          v_old_data := to_jsonb(OLD);
          v_new_data := NULL;
          v_usuario_id := OLD.updated_by;
        ELSIF TG_OP = 'UPDATE' THEN
          v_old_data := to_jsonb(OLD);
          v_new_data := to_jsonb(NEW);
          v_usuario_id := NEW.updated_by;
        ELSE
          v_old_data := NULL;
          v_new_data := to_jsonb(NEW);
          v_usuario_id := NEW.created_by;
        END IF;

        -- Insert audit log
        INSERT INTO public.auditoria_logs (
          usuario_id,
          accion,
          tabla_afectada,
          registro_id,
          datos_anteriores,
          datos_nuevos,
          created_at
        ) VALUES (
          v_usuario_id,
          TG_OP,
          TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
          COALESCE(NEW.id, OLD.id),
          v_old_data,
          v_new_data,
          NOW()
        );

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Function: Calculate if task was delivered on time
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_calculate_entregado_a_tiempo()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.estado = 'Finalizado' AND NEW.fecha_completado IS NOT NULL THEN
          NEW.entregado_a_tiempo := NEW.fecha_completado <= NEW.fecha_fin;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Function: Update Historia de Usuario state based on tasks
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_actualizar_estado_hu()
      RETURNS TRIGGER AS $$
      DECLARE
        v_total_tareas INTEGER;
        v_tareas_completadas INTEGER;
        v_hu_id INTEGER;
      BEGIN
        -- Get HU ID
        v_hu_id := COALESCE(NEW.historia_usuario_id, OLD.historia_usuario_id);

        IF v_hu_id IS NULL THEN
          RETURN NEW;
        END IF;

        -- Count tasks
        SELECT
          COUNT(*),
          COUNT(*) FILTER (WHERE estado = 'Finalizado')
        INTO v_total_tareas, v_tareas_completadas
        FROM agile.tareas
        WHERE historia_usuario_id = v_hu_id AND activo = true;

        -- Update HU state
        IF v_total_tareas > 0 AND v_tareas_completadas = v_total_tareas THEN
          UPDATE agile.historias_usuario
          SET estado = 'Finalizado', updated_at = NOW()
          WHERE id = v_hu_id AND estado != 'Finalizado';
        ELSIF v_tareas_completadas > 0 THEN
          UPDATE agile.historias_usuario
          SET estado = 'En Progreso', updated_at = NOW()
          WHERE id = v_hu_id AND estado NOT IN ('En Progreso', 'Finalizado');
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Function: Update Sprint metrics
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_actualizar_metricas_sprint()
      RETURNS TRIGGER AS $$
      DECLARE
        v_sprint_id INTEGER;
        v_total_puntos INTEGER;
        v_puntos_completados INTEGER;
      BEGIN
        -- Get Sprint ID
        v_sprint_id := COALESCE(NEW.sprint_id, OLD.sprint_id);

        IF v_sprint_id IS NULL THEN
          RETURN NEW;
        END IF;

        -- Calculate points
        SELECT
          COALESCE(SUM(story_points), 0),
          COALESCE(SUM(story_points) FILTER (WHERE estado = 'Finalizado'), 0)
        INTO v_total_puntos, v_puntos_completados
        FROM agile.historias_usuario
        WHERE sprint_id = v_sprint_id AND activo = true;

        -- Update Sprint
        UPDATE agile.sprints
        SET
          puntos_comprometidos = v_total_puntos,
          puntos_completados = v_puntos_completados,
          updated_at = NOW()
        WHERE id = v_sprint_id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Function: Refresh all materialized views
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_refresh_all_materialized_views()
      RETURNS void AS $$
      BEGIN
        -- POI views
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'poi' AND matviewname = 'mv_dashboard_proyectos') THEN
          REFRESH MATERIALIZED VIEW CONCURRENTLY poi.mv_dashboard_proyectos;
        END IF;

        -- Agile views
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'agile' AND matviewname = 'mv_velocidad_equipos') THEN
          REFRESH MATERIALIZED VIEW CONCURRENTLY agile.mv_velocidad_equipos;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'agile' AND matviewname = 'mv_metricas_kanban') THEN
          REFRESH MATERIALIZED VIEW CONCURRENTLY agile.mv_metricas_kanban;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'agile' AND matviewname = 'mv_carga_trabajo_usuarios') THEN
          REFRESH MATERIALIZED VIEW CONCURRENTLY agile.mv_carga_trabajo_usuarios;
        END IF;

        -- Planning views
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'planning' AND matviewname = 'mv_progreso_oei') THEN
          REFRESH MATERIALIZED VIEW CONCURRENTLY planning.mv_progreso_oei;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_refresh_all_materialized_views()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_actualizar_metricas_sprint()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_actualizar_estado_hu()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_calculate_entregado_a_tiempo()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_log_audit()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_generate_codigo(VARCHAR, VARCHAR, INTEGER)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_update_updated_at()`);
  }
}
