# =============================================================================
# SIGP - Script para Resetear Usuarios y Desbloquear
# =============================================================================
# Actualiza la contrasena de multiples usuarios a Password123! y resetea bloqueos
# =============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SIGP - Reset de Usuarios y Desbloqueo" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Usuarios a resetear
$usuarios = @(
    @{ email = "admin@inei.gob.pe"; username = "admin" },
    @{ email = "pmo@inei.gob.pe"; username = "pmo" },
    @{ email = "coordinador@inei.gob.pe"; username = "lcoordinador" },
    @{ email = "scrummaster@inei.gob.pe"; username = "ascrum" },
    @{ email = "patrocinador@inei.gob.pe"; username = "jpatrocinador" },
    @{ email = "desarrollador@inei.gob.pe"; username = "pdesarrollador" },
    @{ email = "implementador@inei.gob.pe"; username = "limplementador" }
)

# Generar hash de la nueva contrasena usando Node.js y bcrypt
Write-Host "[1/3] Generando hash de contrasena..." -ForegroundColor Yellow

$hashScript = @"
const bcrypt = require('bcrypt');
bcrypt.hash('Password123!', 10).then(hash => {
    console.log(hash);
});
"@

$passwordHash = node -e $hashScript
Write-Host "      Hash generado exitosamente" -ForegroundColor Green

# Actualizar usuarios en la base de datos
Write-Host ""
Write-Host "[2/3] Actualizando usuarios en base de datos..." -ForegroundColor Yellow

$updated = 0
$notFound = 0

foreach ($user in $usuarios) {
    $email = $user.email

    # Verificar si el usuario existe
    $checkUser = docker-compose exec -T postgres psql -U postgres -d sigp_inei -t -c "SELECT COUNT(*) FROM public.usuarios WHERE email = '$email';" 2>$null

    if ($checkUser -match '\s*(\d+)') {
        $count = [int]$matches[1]

        if ($count -gt 0) {
            # Actualizar usuario
            $sqlUpdate = "UPDATE public.usuarios SET password_hash = '$passwordHash', intentos_fallidos = 0, bloqueado_hasta = NULL, activo = true, updated_at = NOW() WHERE email = '$email';"
            docker-compose exec -T postgres psql -U postgres -d sigp_inei -c $sqlUpdate | Out-Null

            Write-Host "      [OK] $email" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "      [SKIP] $email (no existe)" -ForegroundColor Yellow
            $notFound++
        }
    }
}

Write-Host ""
Write-Host "      Usuarios actualizados: $updated" -ForegroundColor Cyan
Write-Host "      Usuarios no encontrados: $notFound" -ForegroundColor Yellow

# Resetear todos los usuarios bloqueados
Write-Host ""
Write-Host "[3/3] Reseteando bloqueos de todos los usuarios..." -ForegroundColor Yellow

$sqlResetAll = @"
UPDATE public.usuarios
SET
    intentos_fallidos = 0,
    bloqueado_hasta = NULL
WHERE intentos_fallidos > 0 OR bloqueado_hasta IS NOT NULL;
"@

docker-compose exec -T postgres psql -U postgres -d sigp_inei -c $sqlResetAll | Out-Null
Write-Host "      Bloqueos reseteados" -ForegroundColor Green

# Verificar el resultado
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Verificacion" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$sqlVerify = @"
SELECT email, username, rol, intentos_fallidos,
       CASE WHEN bloqueado_hasta IS NULL THEN 'No' ELSE 'Si' END as bloqueado,
       activo
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
"@

docker-compose exec -T postgres psql -U postgres -d sigp_inei -c $sqlVerify

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Resultado" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Contrasena para todos: Password123!" -ForegroundColor Yellow
Write-Host "  Estado: Activos y desbloqueados" -ForegroundColor Green
Write-Host ""
Write-Host "  Usuarios reseteados:" -ForegroundColor White
foreach ($user in $usuarios) {
    Write-Host "  - $($user.email)" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
