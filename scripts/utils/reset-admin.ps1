# =============================================================================
# SIGP - Script para Resetear Admin y Desbloquear
# =============================================================================
# Actualiza la contrasena del admin a Password123! y resetea bloqueos
# =============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SIGP - Reset Admin y Desbloqueo de Usuarios" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

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

# Actualizar admin en la base de datos
Write-Host ""
Write-Host "[2/3] Actualizando usuario admin en base de datos..." -ForegroundColor Yellow

$sqlUpdate = @"
UPDATE public.usuarios
SET
    password_hash = '$passwordHash',
    intentos_fallidos = 0,
    bloqueado_hasta = NULL,
    activo = true,
    updated_at = NOW()
WHERE email = 'admin@inei.gob.pe';
"@

docker-compose exec -T postgres psql -U postgres -d sigp_inei -c $sqlUpdate

Write-Host "      Usuario admin actualizado" -ForegroundColor Green

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

docker-compose exec -T postgres psql -U postgres -d sigp_inei -c $sqlResetAll

Write-Host "      Bloqueos reseteados" -ForegroundColor Green

# Verificar el resultado
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Verificacion" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$sqlVerify = "SELECT email, username, rol, intentos_fallidos, bloqueado_hasta, activo FROM public.usuarios WHERE email = 'admin@inei.gob.pe';"

docker-compose exec -T postgres psql -U postgres -d sigp_inei -c $sqlVerify

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Resultado" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Usuario:     admin@inei.gob.pe" -ForegroundColor White
Write-Host "  Contrasena:  Password123!" -ForegroundColor Yellow
Write-Host "  Estado:      Activo y desbloqueado" -ForegroundColor Green
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
