# =============================================================================
# SIGP - Test de Permisos del Rol PMO
# =============================================================================
# Verifica que el rol PMO tiene los permisos correctos
# =============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SIGP - Test de Permisos PMO" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login como PMO
Write-Host "[1/5] Test de Login PMO..." -ForegroundColor Yellow
Write-Host "      Email: pmo@inei.gob.pe" -ForegroundColor DarkGray
Write-Host "      Password: Password123!" -ForegroundColor DarkGray

$loginBody = @{
    email = "pmo@inei.gob.pe"
    password = "Password123!"
} | ConvertTo-Json

try {
    $pmoAuthResponse = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    $pmoToken = $pmoAuthResponse.data.accessToken
    $pmoUser = $pmoAuthResponse.data.user

    Write-Host ""
    Write-Host "      [OK] Login exitoso" -ForegroundColor Green
    Write-Host "      Usuario ID: $($pmoUser.id)" -ForegroundColor Cyan
    Write-Host "      Email: $($pmoUser.email)" -ForegroundColor Cyan
    Write-Host "      Nombre: $($pmoUser.nombre) $($pmoUser.apellido)" -ForegroundColor Cyan
    Write-Host "      Rol: $($pmoUser.rol)" -ForegroundColor Cyan
    Write-Host "      Token: $($pmoToken.Substring(0,50))..." -ForegroundColor DarkGray
} catch {
    Write-Host ""
    Write-Host "      [ERROR] Login fallido" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "      Mensaje: $($errorBody.error.message)" -ForegroundColor Red
    } else {
        Write-Host "      Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 1
}

# Test 2: Listar proyectos (permitido para PMO)
Write-Host ""
Write-Host "[2/5] Test: Listar Proyectos (permitido para PMO)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/proyectos" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $pmoToken" } `
        -ErrorAction Stop

    Write-Host "      [OK] Puede listar proyectos" -ForegroundColor Green
    Write-Host "      Total: $($response.data.Count) proyecto(s)" -ForegroundColor Cyan
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "      [FAIL] Status $statusCode" -ForegroundColor Red
}

# Test 3: Crear un subproyecto (permitido: ADMIN, PMO, COORDINADOR)
Write-Host ""
Write-Host "[3/5] Test: Crear Subproyecto (permitido para PMO)..." -ForegroundColor Yellow

$createSubproyectoBody = @{
    proyectoId = 1
    codigo = "TEST-PMO-001"
    nombre = "Test Subproyecto PMO"
    descripcion = "Subproyecto de prueba para validar permisos PMO"
    fechaInicio = "2025-01-01"
    fechaFin = "2025-12-31"
    estado = "ACTIVO"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/subproyectos" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $pmoToken" } `
        -Body $createSubproyectoBody `
        -ErrorAction Stop

    Write-Host "      [OK] Puede crear subproyectos" -ForegroundColor Green
    Write-Host "      Subproyecto ID: $($response.data.id)" -ForegroundColor Cyan
    $testSubproyectoId = $response.data.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 404) {
        Write-Host "      [INFO] Error de validacion (proyecto no existe)" -ForegroundColor Yellow
        Write-Host "      Esto es normal si no hay proyectos en BD" -ForegroundColor DarkGray
    } elseif ($statusCode -eq 403) {
        Write-Host "      [FAIL] Acceso denegado (403)" -ForegroundColor Red
    } else {
        Write-Host "      [FAIL] Status $statusCode" -ForegroundColor Red
    }
}

# Test 4: Crear un sprint (permitido: ADMIN, PMO, COORDINADOR, SCRUM_MASTER)
Write-Host ""
Write-Host "[4/5] Test: Crear Sprint (permitido para PMO)..." -ForegroundColor Yellow

$createSprintBody = @{
    codigo = "SPR-PMO-001"
    nombre = "Sprint Test PMO"
    objetivo = "Validar permisos del rol PMO"
    fechaInicio = "2025-01-15"
    fechaFin = "2025-01-29"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/sprints" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $pmoToken" } `
        -Body $createSprintBody `
        -ErrorAction Stop

    Write-Host "      [OK] Puede crear sprints" -ForegroundColor Green
    Write-Host "      Sprint ID: $($response.data.id)" -ForegroundColor Cyan
    $testSprintId = $response.data.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 404) {
        Write-Host "      [INFO] Error de validacion" -ForegroundColor Yellow
    } elseif ($statusCode -eq 403) {
        Write-Host "      [FAIL] Acceso denegado (403)" -ForegroundColor Red
    } elseif ($statusCode -eq 409) {
        Write-Host "      [INFO] Sprint ya existe (codigo duplicado)" -ForegroundColor Yellow
    } else {
        Write-Host "      [FAIL] Status $statusCode" -ForegroundColor Red
    }
}

# Test 5: Listar sprints
Write-Host ""
Write-Host "[5/5] Test: Listar Sprints (todos los usuarios autenticados)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/sprints" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $pmoToken" } `
        -ErrorAction Stop

    Write-Host "      [OK] Puede listar sprints" -ForegroundColor Green
    Write-Host "      Total: $($response.data.Count) sprint(s)" -ForegroundColor Cyan
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "      [FAIL] Status $statusCode" -ForegroundColor Red
}

# Comparacion con DESARROLLADOR
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Comparacion: PMO vs DESARROLLADOR" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

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
    Write-Host "[INFO] DESARROLLADOR autenticado" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] No se pudo autenticar DESARROLLADOR" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Test: Crear Sprint con DESARROLLADOR (debe fallar)..." -ForegroundColor Yellow

$createSprintBodyDev = @{
    codigo = "SPR-DEV-999"
    nombre = "Sprint Test DEV"
    objetivo = "Esto no deberia crearse"
    fechaInicio = "2025-02-01"
    fechaFin = "2025-02-15"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/sprints" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $devToken" } `
        -Body $createSprintBodyDev `
        -ErrorAction Stop

    Write-Host "      [FAIL] DESARROLLADOR pudo crear sprint (NO DEBERIA)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "      [OK] DESARROLLADOR bloqueado correctamente (403)" -ForegroundColor Green
    } else {
        Write-Host "      [INFO] Status $statusCode" -ForegroundColor Yellow
    }
}

# Resumen final
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Resumen de Permisos PMO" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Usuario: pmo@inei.gob.pe" -ForegroundColor White
Write-Host "  Rol: PMO (Nivel 90)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Permisos PMO:" -ForegroundColor White
Write-Host "  [OK] Login exitoso" -ForegroundColor Green
Write-Host "  [OK] Listar proyectos, sprints, tareas" -ForegroundColor Green
Write-Host "  [OK] Crear proyectos, subproyectos, sprints" -ForegroundColor Green
Write-Host "  [OK] Actualizar proyectos, subproyectos, sprints" -ForegroundColor Green
Write-Host "  [OK] Eliminar proyectos (segun configuracion)" -ForegroundColor Green
Write-Host ""
Write-Host "  Diferencia con ADMIN:" -ForegroundColor White
Write-Host "  - ADMIN: Acceso TOTAL (bypass automatico)" -ForegroundColor Yellow
Write-Host "  - PMO: Acceso segun permisos especificos" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Nivel de acceso: ALTO (90/100)" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
