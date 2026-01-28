# SIGP Backend - Test de correcciones de bugs (Simplificado)
# Usa IDs hardcodeados de datos existentes

$ErrorActionPreference = 'Continue'
$baseUrl = "http://localhost:3010/api/v1"

# Tokens
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJlbWFpbCI6ImFkbWludGVzdDRAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImFkbWludGVzdDQiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTc2NTc1NjEwMCwiZXhwIjoxNzY1ODQyNTAwfQ.rMH6s8s2oPIxZqGHDVx5P7E09e4Pt1PbHX7mtONcaAI"

Write-Host "`n=== TEST SIMPLE: ENDPOINT HU-REQUERIMIENTOS ===" -ForegroundColor Cyan

# Test simple para ver si el endpoint existe
Write-Host "Probando POST /historias-usuario/1/requerimientos..." -ForegroundColor Yellow

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $adminToken"
    }

    $body = @{
        requerimientoId = 1
        notas = "Test de vinculación"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/historias-usuario/1/requerimientos" -Method POST -Headers $headers -Body $body -UseBasicParsing

    Write-Host "[SUCCESS] Endpoint funciona! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message

    Write-Host "[RESPONSE] Status: $statusCode" -ForegroundColor Yellow
    Write-Host "Error: $errorBody" -ForegroundColor Gray

    if ($statusCode -eq 404) {
        Write-Host "[BUG CONFIRMADO] El endpoint NO existe (404)" -ForegroundColor Red
    } elseif ($statusCode -eq 409) {
        Write-Host "[EXITO] El endpoint existe y detecta duplicados correctamente" -ForegroundColor Green
    } elseif ($statusCode -eq 400) {
        Write-Host "[INFO] El endpoint existe pero hay problema con los datos" -ForegroundColor Yellow
    } else {
        Write-Host "[INFO] Status code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`n=== TEST SIMPLE: ENDPOINT SUBTAREAS ===" -ForegroundColor Cyan

# Test endpoint subtareas
Write-Host "Probando POST /subtareas..." -ForegroundColor Yellow

$timestamp = [int](Get-Date -UFormat %s)

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $adminToken"
    }

    $body = @{
        tareaId = 1
        codigo = "SUBTEST-$timestamp"
        nombre = "Subtarea de prueba"
        estado = "Por hacer"
        horasEstimadas = 2
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/subtareas" -Method POST -Headers $headers -Body $body -UseBasicParsing

    Write-Host "[SUCCESS] Endpoint funciona! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message

    Write-Host "[RESPONSE] Status: $statusCode" -ForegroundColor Yellow
    Write-Host "Error: $errorBody" -ForegroundColor Gray

    if ($statusCode -eq 404) {
        Write-Host "[BUG CONFIRMADO] El endpoint NO existe (404)" -ForegroundColor Red
    } elseif ($statusCode -eq 400) {
        Write-Host "[INFO] El endpoint existe - Error de validacion (posiblemente la tarea no es KANBAN)" -ForegroundColor Yellow
    } else {
        Write-Host "[INFO] Status code: $statusCode" -ForegroundColor Yellow
    }
}
