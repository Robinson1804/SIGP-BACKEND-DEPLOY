-- =============================================================================
-- SIGP - Database Initialization Script
-- Creates all required schemas for the application
-- =============================================================================

-- Create schemas
CREATE SCHEMA IF NOT EXISTS planning;
CREATE SCHEMA IF NOT EXISTS poi;
CREATE SCHEMA IF NOT EXISTS agile;
CREATE SCHEMA IF NOT EXISTS rrhh;
CREATE SCHEMA IF NOT EXISTS notificaciones;

-- Grant permissions to postgres user
GRANT ALL ON SCHEMA planning TO postgres;
GRANT ALL ON SCHEMA poi TO postgres;
GRANT ALL ON SCHEMA agile TO postgres;
GRANT ALL ON SCHEMA rrhh TO postgres;
GRANT ALL ON SCHEMA notificaciones TO postgres;

-- Grant usage and create permissions
GRANT USAGE, CREATE ON SCHEMA planning TO postgres;
GRANT USAGE, CREATE ON SCHEMA poi TO postgres;
GRANT USAGE, CREATE ON SCHEMA agile TO postgres;
GRANT USAGE, CREATE ON SCHEMA rrhh TO postgres;
GRANT USAGE, CREATE ON SCHEMA notificaciones TO postgres;

-- Set search path to include all schemas
ALTER DATABASE sigp_inei SET search_path TO public, planning, poi, agile, rrhh, notificaciones;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'SIGP schemas created successfully';
END $$;
