# =============================================================================
# SIGP - Script para Crear Usuarios de Prueba
# =============================================================================
# Crea 7 usuarios de prueba, uno por cada rol del sistema
# Contrasena para todos: Password123!
# =============================================================================

$baseUrl = "http://localhost:3010/api/v1"
$password = "Password123!"

# Colores para output
$colors = @{
    Success = "Green"
    Error = "Red"
    Info = "Cyan"
    Warning = "Yellow"
}

# Definir usuarios de prueba
$testUsers = @(
    @{
        email = "admin@inei.gob.pe"
        username = "cadmin"
        nombre = "Carlos"
        apellido = "Administrador"
        rol = "ADMIN"
        telefono = "987654321"
    },
    @{
        email = "pmo@inei.gob.pe"
        username = "mpmo"
        nombre = "Maria"
        apellido = "PMO"
        rol = "PMO"
        telefono = "987654322"
    },
    @{
        email = "coordinador@inei.gob.pe"
        username = "lcoordinador"
        nombre = "Luis"
        apellido = "Coordinador"
        rol = "COORDINADOR"
        telefono = "987654323"
    },
    @{
        email = "scrummaster@inei.gob.pe"
        username = "ascrum"
        nombre = "Ana"
        apellido = "Scrum"
        rol = "SCRUM_MASTER"
        telefono = "987654324"
    },
    @{
        email = "patrocinador@inei.gob.pe"
        username = "jpatrocinador"
        nombre = "Jorge"
        apellido = "Patrocinador"
        rol = "PATROCINADOR"
        telefono = "987654325"
    },
    @{
        email = "desarrollador@inei.gob.pe"
        username = "pdesarrollador"
        nombre = "Pedro"
        apellido = "Desarrollador"
        rol = "DESARROLLADOR"
        telefono = "987654326"
    },
    @{
        email = "implementador@inei.gob.pe"
        username = "limplementador"
        nombre = "Laura"
        apellido = "Implementadora"
        rol = "IMPLEMENTADOR"
        telefono = "987654327"
    }
)

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SIGP - Creacion de Usuarios de Prueba" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contrasena para todos los usuarios: " -NoNewline
Write-Host $password -ForegroundColor Yellow
Write-Host ""

$created = 0
$skipped = 0
$failed = 0

foreach ($user in $testUsers) {
    $userBody = @{
        email = $user.email
        username = $user.username
        password = $password
        nombre = $user.nombre
        apellido = $user.apellido
        rol = $user.rol
        telefono = $user.telefono
    } | ConvertTo-Json

    Write-Host "[" -NoNewline
    Write-Host $user.rol.PadRight(15) -NoNewline -ForegroundColor Magenta
    Write-Host "] " -NoNewline
    Write-Host "$($user.email.PadRight(30)) " -NoNewline

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $userBody `
            -ErrorAction Stop

        Write-Host "[OK] CREADO" -ForegroundColor $colors.Success
        Write-Host "                  -> Username: $($user.username)" -ForegroundColor DarkGray
        $created++
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMsg = ""

        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorMsg = $errorBody.message
        }
        catch {
            $errorMsg = $_.Exception.Message
        }

        if ($statusCode -eq 409 -or $errorMsg -like "*already*") {
            Write-Host "[SKIP] YA EXISTE" -ForegroundColor $colors.Warning
            $skipped++
        }
        else {
            Write-Host "[ERROR] FALLO" -ForegroundColor $colors.Error
            Write-Host "                  -> $errorMsg" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Resumen" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Usuarios creados:    " -NoNewline
Write-Host $created -ForegroundColor $colors.Success
Write-Host "  Usuarios existentes: " -NoNewline
Write-Host $skipped -ForegroundColor $colors.Warning
Write-Host "  Errores:             " -NoNewline
Write-Host $failed -ForegroundColor $colors.Error
Write-Host ""

if ($created -gt 0) {
    Write-Host "  [OK] Se crearon $created usuario(s) exitosamente" -ForegroundColor $colors.Success
}

Write-Host ""
Write-Host "  Credenciales para pruebas:" -ForegroundColor Cyan
Write-Host "  ---------------------------" -ForegroundColor DarkGray
foreach ($user in $testUsers) {
    Write-Host "  - " -NoNewline
    Write-Host "$($user.rol.PadRight(15))" -NoNewline -ForegroundColor Magenta
    Write-Host " -> " -NoNewline
    Write-Host "$($user.email)" -ForegroundColor White
    Write-Host "    Usuario: " -NoNewline -ForegroundColor DarkGray
    Write-Host "$($user.username)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  Contrasena: " -NoNewline -ForegroundColor DarkGray
Write-Host $password -ForegroundColor Yellow

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
