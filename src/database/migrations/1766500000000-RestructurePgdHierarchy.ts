import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestructurePgdHierarchy1766500000000 implements MigrationInterface {
  name = 'RestructurePgdHierarchy1766500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================================
    // FASE 1: CREAR TABLA AEI (Acciones Estratégicas Institucionales)
    // ============================================================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS planning.aei (
        id SERIAL PRIMARY KEY,
        oei_id INTEGER NOT NULL,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(300) NOT NULL,
        descripcion TEXT,
        indicador_codigo VARCHAR(50),
        indicador_nombre VARCHAR(500),
        unidad_medida VARCHAR(50),
        linea_base_anio INTEGER,
        linea_base_valor DECIMAL(15, 2),
        metas_anuales JSONB,
        activo BOOLEAN DEFAULT TRUE,
        created_by INTEGER,
        updated_by INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Índices para AEI
    await queryRunner.query(`CREATE INDEX idx_aei_oei_id ON planning.aei(oei_id)`);
    await queryRunner.query(`CREATE INDEX idx_aei_codigo ON planning.aei(codigo)`);
    await queryRunner.query(`CREATE INDEX idx_aei_activo ON planning.aei(activo)`);

    // ============================================================================
    // FASE 2: CREAR TABLAS JUNCTION PARA RELACIONES M:N
    // ============================================================================

    // Tabla ogd_oei (Many-to-Many entre OGD y OEI)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS planning.ogd_oei (
        id SERIAL PRIMARY KEY,
        ogd_id INTEGER NOT NULL,
        oei_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(ogd_id, oei_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_ogd_oei_ogd ON planning.ogd_oei(ogd_id)`);
    await queryRunner.query(`CREATE INDEX idx_ogd_oei_oei ON planning.ogd_oei(oei_id)`);

    // Tabla oegd_aei (Many-to-Many entre OEGD y AEI)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS planning.oegd_aei (
        id SERIAL PRIMARY KEY,
        oegd_id INTEGER NOT NULL,
        aei_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(oegd_id, aei_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_oegd_aei_oegd ON planning.oegd_aei(oegd_id)`);
    await queryRunner.query(`CREATE INDEX idx_oegd_aei_aei ON planning.oegd_aei(aei_id)`);

    // ============================================================================
    // FASE 3: MODIFICAR COLUMNAS EN TABLAS EXISTENTES
    // ============================================================================

    // --- OEI: Agregar indicador_codigo, renombrar linea_base ---
    await queryRunner.query(`
      ALTER TABLE planning.oei
      ADD COLUMN IF NOT EXISTS indicador_codigo VARCHAR(50)
    `);

    // Renombrar indicador a indicador_nombre
    await queryRunner.query(`
      ALTER TABLE planning.oei
      RENAME COLUMN indicador TO indicador_nombre
    `);

    // Agregar linea_base_anio
    await queryRunner.query(`
      ALTER TABLE planning.oei
      ADD COLUMN IF NOT EXISTS linea_base_anio INTEGER
    `);

    // Renombrar linea_base a linea_base_valor
    await queryRunner.query(`
      ALTER TABLE planning.oei
      RENAME COLUMN linea_base TO linea_base_valor
    `);

    // --- OGD: Agregar indicador_codigo, renombrar columnas ---
    await queryRunner.query(`
      ALTER TABLE planning.ogd
      ADD COLUMN IF NOT EXISTS indicador_codigo VARCHAR(50)
    `);

    await queryRunner.query(`
      ALTER TABLE planning.ogd
      RENAME COLUMN indicador TO indicador_nombre
    `);

    await queryRunner.query(`
      ALTER TABLE planning.ogd
      ADD COLUMN IF NOT EXISTS linea_base_anio INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE planning.ogd
      RENAME COLUMN linea_base TO linea_base_valor
    `);

    // --- OEGD: Agregar todos los campos nuevos ---
    await queryRunner.query(`
      ALTER TABLE planning.oegd
      ADD COLUMN IF NOT EXISTS indicador_codigo VARCHAR(50)
    `);

    await queryRunner.query(`
      ALTER TABLE planning.oegd
      RENAME COLUMN indicador TO indicador_nombre
    `);

    await queryRunner.query(`
      ALTER TABLE planning.oegd
      ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(50)
    `);

    await queryRunner.query(`
      ALTER TABLE planning.oegd
      ADD COLUMN IF NOT EXISTS linea_base_anio INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE planning.oegd
      ADD COLUMN IF NOT EXISTS linea_base_valor DECIMAL(15, 2)
    `);

    await queryRunner.query(`
      ALTER TABLE planning.oegd
      ADD COLUMN IF NOT EXISTS metas_anuales JSONB
    `);

    // --- Acciones Estratégicas: Agregar campos nuevos ---
    await queryRunner.query(`
      ALTER TABLE planning.acciones_estrategicas
      ADD COLUMN IF NOT EXISTS indicador_codigo VARCHAR(50)
    `);

    await queryRunner.query(`
      ALTER TABLE planning.acciones_estrategicas
      RENAME COLUMN indicador TO indicador_nombre
    `);

    await queryRunner.query(`
      ALTER TABLE planning.acciones_estrategicas
      ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(50)
    `);

    await queryRunner.query(`
      ALTER TABLE planning.acciones_estrategicas
      ADD COLUMN IF NOT EXISTS linea_base_anio INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE planning.acciones_estrategicas
      ADD COLUMN IF NOT EXISTS linea_base_valor DECIMAL(15, 2)
    `);

    await queryRunner.query(`
      ALTER TABLE planning.acciones_estrategicas
      ADD COLUMN IF NOT EXISTS metas_anuales JSONB
    `);

    // ============================================================================
    // FASE 4: MODIFICAR FOREIGN KEYS PARA CASCADE DELETE
    // ============================================================================

    // Helper: Eliminar todas las FK de una tabla/columna (TypeORM genera nombres automáticos)
    const dropAllForeignKeys = async (table: string, column: string) => {
      const fks = await queryRunner.query(`
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'planning'
          AND tc.table_name = '${table}'
          AND kcu.column_name = '${column}'
      `);
      for (const fk of fks) {
        await queryRunner.query(`
          ALTER TABLE planning.${table} DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"
        `);
      }
    };

    // --- OEI → PGD: CASCADE ---
    await dropAllForeignKeys('oei', 'pgd_id');
    await queryRunner.query(`
      ALTER TABLE planning.oei
      ADD CONSTRAINT fk_oei_pgd
      FOREIGN KEY (pgd_id) REFERENCES planning.pgd(id) ON DELETE CASCADE
    `);

    // --- AEI → OEI: CASCADE ---
    await queryRunner.query(`
      ALTER TABLE planning.aei
      ADD CONSTRAINT fk_aei_oei
      FOREIGN KEY (oei_id) REFERENCES planning.oei(id) ON DELETE CASCADE
    `);

    // --- OGD → PGD: CASCADE ---
    await dropAllForeignKeys('ogd', 'pgd_id');
    await queryRunner.query(`
      ALTER TABLE planning.ogd
      ADD CONSTRAINT fk_ogd_pgd
      FOREIGN KEY (pgd_id) REFERENCES planning.pgd(id) ON DELETE CASCADE
    `);

    // --- ogd_oei junction: CASCADE en ambos lados ---
    await queryRunner.query(`
      ALTER TABLE planning.ogd_oei
      ADD CONSTRAINT fk_ogd_oei_ogd
      FOREIGN KEY (ogd_id) REFERENCES planning.ogd(id) ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE planning.ogd_oei
      ADD CONSTRAINT fk_ogd_oei_oei
      FOREIGN KEY (oei_id) REFERENCES planning.oei(id) ON DELETE CASCADE
    `);

    // --- OEGD → OGD: CASCADE ---
    await dropAllForeignKeys('oegd', 'ogd_id');
    await queryRunner.query(`
      ALTER TABLE planning.oegd
      ADD CONSTRAINT fk_oegd_ogd
      FOREIGN KEY (ogd_id) REFERENCES planning.ogd(id) ON DELETE CASCADE
    `);

    // --- oegd_aei junction: CASCADE en ambos lados ---
    await queryRunner.query(`
      ALTER TABLE planning.oegd_aei
      ADD CONSTRAINT fk_oegd_aei_oegd
      FOREIGN KEY (oegd_id) REFERENCES planning.oegd(id) ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE planning.oegd_aei
      ADD CONSTRAINT fk_oegd_aei_aei
      FOREIGN KEY (aei_id) REFERENCES planning.aei(id) ON DELETE CASCADE
    `);

    // --- Acciones Estratégicas → OEGD: CASCADE ---
    await dropAllForeignKeys('acciones_estrategicas', 'oegd_id');
    await queryRunner.query(`
      ALTER TABLE planning.acciones_estrategicas
      ADD CONSTRAINT fk_ae_oegd
      FOREIGN KEY (oegd_id) REFERENCES planning.oegd(id) ON DELETE CASCADE
    `);

    // ============================================================================
    // FASE 5: MODIFICAR FK DE PROYECTOS Y ACTIVIDADES PARA SET NULL
    // ============================================================================

    // Helper para schema 'poi'
    const dropAllForeignKeysPoi = async (table: string, column: string) => {
      const fks = await queryRunner.query(`
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'poi'
          AND tc.table_name = '${table}'
          AND kcu.column_name = '${column}'
      `);
      for (const fk of fks) {
        await queryRunner.query(`
          ALTER TABLE poi.${table} DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"
        `);
      }
    };

    // --- Proyectos → AccionEstrategica: SET NULL ---
    await dropAllForeignKeysPoi('proyectos', 'accion_estrategica_id');
    await queryRunner.query(`
      ALTER TABLE poi.proyectos
      ADD CONSTRAINT fk_proyecto_ae
      FOREIGN KEY (accion_estrategica_id) REFERENCES planning.acciones_estrategicas(id) ON DELETE SET NULL
    `);

    // --- Actividades → AccionEstrategica: SET NULL ---
    await dropAllForeignKeysPoi('actividades', 'accion_estrategica_id');
    await queryRunner.query(`
      ALTER TABLE poi.actividades
      ADD CONSTRAINT fk_actividad_ae
      FOREIGN KEY (accion_estrategica_id) REFERENCES planning.acciones_estrategicas(id) ON DELETE SET NULL
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    // Restaurar FK de proyectos (sin SET NULL, comportamiento por defecto)
    await queryRunner.query(`ALTER TABLE poi.proyectos DROP CONSTRAINT IF EXISTS fk_proyecto_ae`);
    await queryRunner.query(`ALTER TABLE poi.actividades DROP CONSTRAINT IF EXISTS fk_actividad_ae`);

    // Eliminar FK de acciones_estrategicas
    await queryRunner.query(`ALTER TABLE planning.acciones_estrategicas DROP CONSTRAINT IF EXISTS fk_ae_oegd`);

    // Eliminar FK de tablas junction
    await queryRunner.query(`ALTER TABLE planning.oegd_aei DROP CONSTRAINT IF EXISTS fk_oegd_aei_oegd`);
    await queryRunner.query(`ALTER TABLE planning.oegd_aei DROP CONSTRAINT IF EXISTS fk_oegd_aei_aei`);
    await queryRunner.query(`ALTER TABLE planning.ogd_oei DROP CONSTRAINT IF EXISTS fk_ogd_oei_ogd`);
    await queryRunner.query(`ALTER TABLE planning.ogd_oei DROP CONSTRAINT IF EXISTS fk_ogd_oei_oei`);

    // Eliminar FK de tablas principales
    await queryRunner.query(`ALTER TABLE planning.oegd DROP CONSTRAINT IF EXISTS fk_oegd_ogd`);
    await queryRunner.query(`ALTER TABLE planning.ogd DROP CONSTRAINT IF EXISTS fk_ogd_pgd`);
    await queryRunner.query(`ALTER TABLE planning.aei DROP CONSTRAINT IF EXISTS fk_aei_oei`);
    await queryRunner.query(`ALTER TABLE planning.oei DROP CONSTRAINT IF EXISTS fk_oei_pgd`);

    // Eliminar columnas nuevas de acciones_estrategicas
    await queryRunner.query(`ALTER TABLE planning.acciones_estrategicas DROP COLUMN IF EXISTS metas_anuales`);
    await queryRunner.query(`ALTER TABLE planning.acciones_estrategicas DROP COLUMN IF EXISTS linea_base_valor`);
    await queryRunner.query(`ALTER TABLE planning.acciones_estrategicas DROP COLUMN IF EXISTS linea_base_anio`);
    await queryRunner.query(`ALTER TABLE planning.acciones_estrategicas DROP COLUMN IF EXISTS unidad_medida`);
    await queryRunner.query(`ALTER TABLE planning.acciones_estrategicas RENAME COLUMN indicador_nombre TO indicador`);
    await queryRunner.query(`ALTER TABLE planning.acciones_estrategicas DROP COLUMN IF EXISTS indicador_codigo`);

    // Eliminar columnas nuevas de OEGD
    await queryRunner.query(`ALTER TABLE planning.oegd DROP COLUMN IF EXISTS metas_anuales`);
    await queryRunner.query(`ALTER TABLE planning.oegd DROP COLUMN IF EXISTS linea_base_valor`);
    await queryRunner.query(`ALTER TABLE planning.oegd DROP COLUMN IF EXISTS linea_base_anio`);
    await queryRunner.query(`ALTER TABLE planning.oegd DROP COLUMN IF EXISTS unidad_medida`);
    await queryRunner.query(`ALTER TABLE planning.oegd RENAME COLUMN indicador_nombre TO indicador`);
    await queryRunner.query(`ALTER TABLE planning.oegd DROP COLUMN IF EXISTS indicador_codigo`);

    // Restaurar columnas de OGD
    await queryRunner.query(`ALTER TABLE planning.ogd RENAME COLUMN linea_base_valor TO linea_base`);
    await queryRunner.query(`ALTER TABLE planning.ogd DROP COLUMN IF EXISTS linea_base_anio`);
    await queryRunner.query(`ALTER TABLE planning.ogd RENAME COLUMN indicador_nombre TO indicador`);
    await queryRunner.query(`ALTER TABLE planning.ogd DROP COLUMN IF EXISTS indicador_codigo`);

    // Restaurar columnas de OEI
    await queryRunner.query(`ALTER TABLE planning.oei RENAME COLUMN linea_base_valor TO linea_base`);
    await queryRunner.query(`ALTER TABLE planning.oei DROP COLUMN IF EXISTS linea_base_anio`);
    await queryRunner.query(`ALTER TABLE planning.oei RENAME COLUMN indicador_nombre TO indicador`);
    await queryRunner.query(`ALTER TABLE planning.oei DROP COLUMN IF EXISTS indicador_codigo`);

    // Eliminar tablas junction
    await queryRunner.query(`DROP TABLE IF EXISTS planning.oegd_aei`);
    await queryRunner.query(`DROP TABLE IF EXISTS planning.ogd_oei`);

    // Eliminar tabla AEI
    await queryRunner.query(`DROP TABLE IF EXISTS planning.aei`);
  }
}
