import { DataSource } from 'typeorm';
import { Seeder } from './seeder.interface';

/**
 * Seed: System Configurations
 *
 * Creates default system configurations
 */
export class ConfiguracionesSeed implements Seeder {
  name = 'ConfiguracionesSeed';
  order = 2;

  private configs = [
    // General settings
    {
      clave: 'app.nombre',
      valor: 'SIGP',
      tipo_dato: 'STRING',
      es_publica: true,
      descripcion: 'Nombre de la aplicación',
    },
    {
      clave: 'app.version',
      valor: '1.0.0',
      tipo_dato: 'STRING',
      es_publica: true,
      descripcion: 'Versión actual del sistema',
    },
    {
      clave: 'app.institucion',
      valor: 'INEI',
      tipo_dato: 'STRING',
      es_publica: true,
      descripcion: 'Nombre de la institución',
    },

    // Sprint settings
    {
      clave: 'sprint.duracion_minima_dias',
      valor: '7',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Duración mínima de un sprint en días',
    },
    {
      clave: 'sprint.duracion_maxima_dias',
      valor: '28',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Duración máxima de un sprint en días',
    },
    {
      clave: 'sprint.story_points_fibonacci',
      valor_json: JSON.stringify([1, 2, 3, 5, 8, 13, 21]),
      tipo_dato: 'JSON',
      es_publica: false,
      descripcion: 'Valores válidos de story points (Fibonacci)',
    },

    // Notification settings
    {
      clave: 'notificaciones.dias_antes_vencimiento',
      valor: '3',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Días de anticipación para alertas de vencimiento',
    },
    {
      clave: 'notificaciones.max_no_leidas',
      valor: '100',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Máximo de notificaciones no leídas antes de archivar',
    },

    // File upload settings
    {
      clave: 'archivos.max_tamano_mb',
      valor: '50',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Tamaño máximo de archivo en MB',
    },
    {
      clave: 'archivos.extensiones_permitidas',
      valor_json: JSON.stringify([
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar', 'txt', 'csv',
      ]),
      tipo_dato: 'JSON',
      es_publica: false,
      descripcion: 'Extensiones de archivo permitidas',
    },

    // Security settings
    {
      clave: 'seguridad.sesion_timeout_minutos',
      valor: '30',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Tiempo de inactividad antes de cerrar sesión',
    },
    {
      clave: 'seguridad.intentos_login_max',
      valor: '5',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Intentos máximos de login antes de bloquear',
    },
    {
      clave: 'seguridad.bloqueo_minutos',
      valor: '15',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Minutos de bloqueo tras exceder intentos',
    },

    // Dashboard settings
    {
      clave: 'dashboard.refresh_interval_segundos',
      valor: '300',
      tipo_dato: 'NUMBER',
      es_publica: true,
      descripcion: 'Intervalo de actualización del dashboard',
    },
    {
      clave: 'dashboard.proyectos_criticos_dias',
      valor: '7',
      tipo_dato: 'NUMBER',
      es_publica: false,
      descripcion: 'Días para considerar proyecto como crítico',
    },
  ];

  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      for (const config of this.configs) {
        // Check if config exists
        const existing = await queryRunner.query(
          `SELECT id FROM public.configuraciones WHERE clave = $1`,
          [config.clave],
        );

        if (existing.length > 0) {
          console.log(`  → Config '${config.clave}' already exists, skipping...`);
          continue;
        }

        // Insert configuration
        await queryRunner.query(
          `
          INSERT INTO public.configuraciones (
            clave,
            valor,
            valor_json,
            tipo_dato,
            es_publica,
            descripcion,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          `,
          [
            config.clave,
            config.valor || null,
            config.valor_json || null,
            config.tipo_dato,
            config.es_publica,
            config.descripcion || null,
          ],
        );

        console.log(`  → Config '${config.clave}' created`);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async revert(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      for (const config of this.configs) {
        await queryRunner.query(
          `DELETE FROM public.configuraciones WHERE clave = $1`,
          [config.clave],
        );
      }

      console.log('  → Configurations removed');
    } finally {
      await queryRunner.release();
    }
  }
}
