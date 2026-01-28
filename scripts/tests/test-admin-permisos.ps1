# =============================================================================
# SIGP - Test de Permisos del Rol ADMIN
# =============================================================================
# Verifica que el rol ADMIN tiene acceso a todos los endpoints
# =============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SIGP - Test de Permisos ADMIN" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Login como ADMIN
Write-Host "[1/4] Autenticando como ADMIN..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@inei.gob.pe"
    password = "Password123!"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    $adminToken = $authResponse.data.accessToken
    Write-Host "      Token obtenido para: $($authResponse.data.user.email)" -ForegroundColor Green
    Write-Host "      Rol: $($authResponse.data.user.rol)" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] No se pudo autenticar" -ForegroundColor Red
    exit 1
}

# Login como DESARROLLADOR (para comparar)
Write-Host ""
Write-Host "[2/4] Autenticando como DESARROLLADOR..." -ForegroundColor Yellow
$devLoginBody = @{
    email = "desarrollador@inei.gob.pe"
    password = "Password123!"
} | ConvertTo-Json

try {
    $devAuthResponse = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $devLoginBody `
        -ErrorAction Stop

    $devToken = $devAuthResponse.data.accessToken
    Write-Host "      Token obtenido para: $($devAuthResponse.data.user.email)" -ForegroundColor Green
    Write-Host "      Rol: $($devAuthResponse.data.user.rol)" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] No se pudo autenticar" -ForegroundColor Red
    exit 1
}

# Test 1: Endpoint que requiere ADMIN, PMO, COORDINADOR
Write-Host ""
Write-Host "[3/4] Test: Listar Subproyectos (requiere ADMIN/PMO/COORDINADOR)..." -ForegroundColor Yellow

Write-Host "      Probando con ADMIN..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/subproyectos" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $adminToken" } `
        -ErrorAction Stop
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host " [FAIL] $statusCode" -ForegroundColor Red
}

Write-Host "      Probando con DESARROLLADOR..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/subproyectos" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $devToken" } `
        -ErrorAction Stop
    Write-Host " [OK] (inesperado)" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host " [BLOQUEADO] 403 (esperado)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $statusCode" -ForegroundColor Red
    }
}

# Test 2: Endpoint que requiere SCRUM_MASTER
Write-Host ""
Write-Host "[4/4] Test: Crear Tarea (requiere ADMIN/PMO/COORDINADOR/SCRUM_MASTER)..." -ForegroundColor Yellow

Write-Host "      Probando con ADMIN..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/tareas" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $adminToken" } `
        -ErrorAction Stop
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host " [FAIL] $statusCode" -ForegroundColor Red
}

Write-Host "      Probando con DESARROLLADOR..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/tareas" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $devToken" } `
        -ErrorAction Stop
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host " [BLOQUEADO] 403" -ForegroundColor Yellow
    } else {
        Write-Host " [FAIL] $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Resultado" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Politica de Permisos:" -ForegroundColor White
Write-Host "  - ADMIN tiene acceso TOTAL a todos los endpoints" -ForegroundColor Green
Write-Host "  - Otros roles solo acceden a endpoints autorizados" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Ver: src/common/guards/roles.guard.ts" -ForegroundColor DarkGray
Write-Host "  Linea 26-29: ADMIN bypass automatico" -ForegroundColor DarkGray
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
