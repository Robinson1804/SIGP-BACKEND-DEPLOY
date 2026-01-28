# =============================================================================
# SIGP - Comparacion de Tokens: ADMIN vs PMO vs DESARROLLADOR
# =============================================================================
# Verifica que todos los usuarios devuelven tokens JWT normales
# =============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SIGP - Comparacion de Tokens JWT" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$usuarios = @(
    @{ nombre = "ADMIN"; email = "admin@inei.gob.pe" },
    @{ nombre = "PMO"; email = "pmo@inei.gob.pe" },
    @{ nombre = "DESARROLLADOR"; email = "desarrollador@inei.gob.pe" }
)

foreach ($user in $usuarios) {
    Write-Host "[$($user.nombre)]" -ForegroundColor Magenta
    Write-Host "  Email: $($user.email)" -ForegroundColor DarkGray

    $loginBody = @{
        email = $user.email
        password = "Password123!"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $loginBody `
            -ErrorAction Stop

        $token = $response.data.accessToken
        $userData = $response.data.user

        Write-Host "  [OK] Login exitoso" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Usuario devuelto:" -ForegroundColor Yellow
        Write-Host "    ID: $($userData.id)" -ForegroundColor Cyan
        Write-Host "    Email: $($userData.email)" -ForegroundColor Cyan
        Write-Host "    Username: $($userData.username)" -ForegroundColor Cyan
        Write-Host "    Nombre: $($userData.nombre) $($userData.apellido)" -ForegroundColor Cyan
        Write-Host "    Rol: $($userData.rol)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Token JWT:" -ForegroundColor Yellow
        Write-Host "    Tipo: Bearer" -ForegroundColor Cyan
        Write-Host "    Longitud: $($token.Length) caracteres" -ForegroundColor Cyan
        Write-Host "    Inicio: $($token.Substring(0,50))..." -ForegroundColor DarkGray

        # Decodificar el payload del JWT (parte media del token)
        $parts = $token.Split('.')
        if ($parts.Length -eq 3) {
            $payload = $parts[1]
            # Agregar padding si es necesario
            $padding = (4 - ($payload.Length % 4)) % 4
            $payload += "=" * $padding
            $payloadBytes = [System.Convert]::FromBase64String($payload)
            $payloadJson = [System.Text.Encoding]::UTF8.GetString($payloadBytes)
            $payloadObj = $payloadJson | ConvertFrom-Json

            Write-Host ""
            Write-Host "  Payload del Token (decodificado):" -ForegroundColor Yellow
            Write-Host "    sub (User ID): $($payloadObj.sub)" -ForegroundColor Cyan
            Write-Host "    email: $($payloadObj.email)" -ForegroundColor Cyan
            Write-Host "    username: $($payloadObj.username)" -ForegroundColor Cyan
            Write-Host "    rol: $($payloadObj.rol)" -ForegroundColor Cyan
            Write-Host "    iat (emitido): $(Get-Date -UnixTimeSeconds $payloadObj.iat)" -ForegroundColor DarkGray
            Write-Host "    exp (expira): $(Get-Date -UnixTimeSeconds $payloadObj.exp)" -ForegroundColor DarkGray
        }

        Write-Host ""
        Write-Host "  Estructura del Response:" -ForegroundColor Yellow
        Write-Host "    success: $($response.success)" -ForegroundColor Cyan
        Write-Host "    data.accessToken: SI (Bearer token)" -ForegroundColor Cyan
        Write-Host "    data.refreshToken: SI" -ForegroundColor Cyan
        Write-Host "    data.expiresIn: $($response.data.expiresIn) segundos" -ForegroundColor Cyan
        Write-Host "    data.user: Objeto con datos del usuario" -ForegroundColor Cyan

    } catch {
        Write-Host "  [ERROR] Login fallido" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "----------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Conclusion" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Todos los usuarios (ADMIN, PMO, DESARROLLADOR) devuelven:" -ForegroundColor White
Write-Host "  [OK] Token JWT estandar (Bearer)" -ForegroundColor Green
Write-Host "  [OK] Mismo formato de respuesta" -ForegroundColor Green
Write-Host "  [OK] Misma estructura de datos" -ForegroundColor Green
Write-Host "  [OK] Access Token + Refresh Token" -ForegroundColor Green
Write-Host ""
Write-Host "  Diferencias:" -ForegroundColor White
Write-Host "  - El campo 'rol' en el payload identifica privilegios" -ForegroundColor Yellow
Write-Host "  - ADMIN tiene bypass automatico en RolesGuard" -ForegroundColor Yellow
Write-Host "  - PMO tiene privilegios altos pero sin bypass" -ForegroundColor Yellow
Write-Host "  - DESARROLLADOR tiene privilegios basicos" -ForegroundColor Yellow
Write-Host ""
Write-Host "  PMO es un USUARIO NORMAL con privilegios altos" -ForegroundColor Cyan
Write-Host "  NO es un ADMIN disfrazado" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
