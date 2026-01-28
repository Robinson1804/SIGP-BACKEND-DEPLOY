-- Actualizar contraseñas de usuarios a Password123!
-- Hash generado con bcrypt(Password123!, 10)

UPDATE public.usuarios
SET
    password_hash = '$2b$10$80Wo.D.AMftkUsKopgu.5.OgQM6Jp6O6ZfOiiYRWPMEWZNZxYrUXK',
    intentos_fallidos = 0,
    bloqueado_hasta = NULL,
    activo = true,
    updated_at = NOW()
WHERE email IN (
    'admin@inei.gob.pe',
    'pmo@inei.gob.pe',
    'coordinador@inei.gob.pe',
    'scrummaster@inei.gob.pe',
    'patrocinador@inei.gob.pe',
    'desarrollador@inei.gob.pe',
    'implementador@inei.gob.pe'
);

-- Verificar resultado
SELECT
    email,
    username,
    rol,
    activo,
    intentos_fallidos,
    CASE WHEN bloqueado_hasta IS NULL THEN 'No' ELSE 'Si' END as bloqueado
FROM public.usuarios
WHERE email IN (
    'admin@inei.gob.pe',
    'pmo@inei.gob.pe',
    'coordinador@inei.gob.pe',
    'scrummaster@inei.gob.pe',
    'patrocinador@inei.gob.pe',
    'desarrollador@inei.gob.pe',
    'implementador@inei.gob.pe'
)
ORDER BY CASE rol
    WHEN 'ADMIN' THEN 1
    WHEN 'PMO' THEN 2
    WHEN 'COORDINADOR' THEN 3
    WHEN 'SCRUM_MASTER' THEN 4
    WHEN 'PATROCINADOR' THEN 5
    WHEN 'DESARROLLADOR' THEN 6
    WHEN 'IMPLEMENTADOR' THEN 7
END;
