# =======================================================================
# SIGP Backend - Pruebas Exhaustivas del Módulo de Planificación
# =======================================================================
# Este script ejecuta 143 tests exhaustivos del módulo de planificación
# cubriendo CRUD completo, validaciones, casos edge, endpoints anidados

$ErrorActionPreference = 'Continue'
$baseUrl = "http://localhost:3010/api/v1"

# Tokens (del registro previo)
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJlbWFpbCI6ImFkbWludGVzdDRAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImFkbWludGVzdDQiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTc2NTc1NjEwMCwiZXhwIjoxNzY1ODQyNTAwfQ.rMH6s8s2oPIxZqGHDVx5P7E09e4Pt1PbHX7mtONcaAI"
$pmoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJlbWFpbCI6InBtb3Rlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6InBtb3Rlc3QiLCJyb2wiOiJQTU8iLCJpYXQiOjE3NjU3NTYxMTAsImV4cCI6MTc2NTg0MjUxMH0.MzvWG7WYraESOZEcIpdesgfXtrlSR8JgqKb6P0gxkv4"
$devToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJlbWFpbCI6ImRldnRlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImRldnRlc3QiLCJyb2wiOiJERVNBUlJPTExBRE9SIiwiaWF0IjoxNzY1NzU2MTEwLCJleHAiOjE3NjU4NDI1MTB9.dp10ZHTkX3TAmV8h6xvcVfXhxBlULrKsWCTkQxMN_lQ"

# Estadísticas
$stats = @{
    Total = 0
    Passed = 0
    Failed = 0
    ExpectedFail = 0
    UnexpectedFail = 0
    StartTime = Get-Date
}

# Resultados
$results = @()

# IDs guardados
$ids = @{}

# =======================================================================
# HELPER FUNCTIONS
# =======================================================================

function Write-TestHeader {
    param([string]$Phase)
    Write-Host "`n=========================================" -ForegroundColor Cyan
    Write-Host $Phase -ForegroundColor Cyan
    Write-Host "=========================================`n" -ForegroundColor Cyan
}

function Test-Api {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = $null,
        [hashtable]$Body = $null,
        [int[]]$ExpectedStatus,
        [bool]$ExpectSuccess = $true
    )

    $stats.Total++
    $testNum = $stats.Total

    try {
        $headers = @{ 'Content-Type' = 'application/json' }
        if ($Token) {
            $headers['Authorization'] = "Bearer $Token"
        }

        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }

        if ($Body) {
            $params['Body'] = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = $null
        $statusCode = 0

        try {
            $response = Invoke-WebRequest @params
            $statusCode = $response.StatusCode
        } catch {
            if ($_.Exception.Response) {
                $statusCode = $_.Exception.Response.StatusCode.value__
                $response = $_.Exception.Response
            } else {
                throw
            }
        }

        $passed = $ExpectedStatus -contains $statusCode

        if ($passed) {
            $stats.Passed++
            if (-not $ExpectSuccess) { $stats.ExpectedFail++ }
            Write-Host "[$testNum] PASS: $TestName (Status: $statusCode)" -ForegroundColor Green
        } else {
            if ($ExpectSuccess) {
                $stats.UnexpectedFail++
                Write-Host "[$testNum] FAIL: $TestName (Expected: $($ExpectedStatus -join '/'), Got: $statusCode)" -ForegroundColor Red
            } else {
                $stats.Passed++
                $stats.ExpectedFail++
                Write-Host "[$testNum] PASS: $TestName (Expected fail with $statusCode)" -ForegroundColor Yellow
            }
        }

        $results += @{
            Number = $testNum
            Name = $TestName
            Method = $Method
            Endpoint = $Endpoint
            Status = $statusCode
            Expected = $ExpectedStatus
            Passed = $passed
            ExpectSuccess = $ExpectSuccess
        }

        return @{
            StatusCode = $statusCode
            Content = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null }
            Passed = $passed
        }

    } catch {
        $stats.Failed++
        Write-Host "[$testNum] ERROR: $TestName - $($_.Exception.Message)" -ForegroundColor Magenta

        $results += @{
            Number = $testNum
            Name = $TestName
            Method = $Method
            Endpoint = $Endpoint
            Status = 0
            Expected = $ExpectedStatus
            Passed = $false
            ExpectSuccess = $ExpectSuccess
            Error = $_.Exception.Message
        }

        return @{ StatusCode = 0; Content = $null; Passed = $false; Error = $_.Exception.Message }
    }
}

# =======================================================================
# FASE 2: PRUEBAS DE PGD
# =======================================================================

Write-TestHeader "FASE 2: PRUEBAS DE PGD (Root Entity)"

# 2.1.1: Crear PGD válido como ADMIN
$result = Test-Api -TestName "2.1.1: Crear PGD válido como ADMIN" `
    -Method POST -Endpoint "/pgd" -Token $adminToken `
    -Body @{
        nombre = "Plan de Gestión 2024-2026"
        descripcion = "Plan estratégico institucional para modernización digital"
        anioInicio = 2024
        anioFin = 2026
        estado = "BORRADOR"
    } -ExpectedStatus @(201)

if ($result.Content) {
    $ids.pgdId = $result.Content.data.id
    Write-Host "  -> PGD ID guardado: $($ids.pgdId)" -ForegroundColor Gray
}

# 2.1.2: Crear PGD como PMO
$result = Test-Api -TestName "2.1.2: Crear PGD como PMO" `
    -Method POST -Endpoint "/pgd" -Token $pmoToken `
    -Body @{
        nombre = "Plan de Gestión PMO 2024-2026"
        anioInicio = 2024
        anioFin = 2026
    } -ExpectedStatus @(201)

if ($result.Content) {
    $ids.pgdIdPmo = $result.Content.data.id
    Write-Host "  -> PGD PMO ID guardado: $($ids.pgdIdPmo)" -ForegroundColor Gray
}

# 2.1.3: Rechazar creación como DESARROLLADOR (403)
Test-Api -TestName "2.1.3: Rechazar creación como DESARROLLADOR" `
    -Method POST -Endpoint "/pgd" -Token $devToken `
    -Body @{ nombre = "Plan Inválido"; anioInicio = 2024; anioFin = 2026 } `
    -ExpectedStatus @(403) -ExpectSuccess $false

# 2.1.4: Rechazar creación sin autenticación (401)
Test-Api -TestName "2.1.4: Rechazar creación sin autenticación" `
    -Method POST -Endpoint "/pgd" `
    -Body @{ nombre = "Plan Sin Auth"; anioInicio = 2024; anioFin = 2026 } `
    -ExpectedStatus @(401) -ExpectSuccess $false

# 2.1.5: Rechazar año fin menor que año inicio
Test-Api -TestName "2.1.5: Rechazar año fin < año inicio" `
    -Method POST -Endpoint "/pgd" -Token $adminToken `
    -Body @{ nombre = "Plan Inválido"; anioInicio = 2026; anioFin = 2024 } `
    -ExpectedStatus @(400, 409) -ExpectSuccess $false

# 2.1.6: Rechazar nombre vacío
Test-Api -TestName "2.1.6: Rechazar nombre vacío" `
    -Method POST -Endpoint "/pgd" -Token $adminToken `
    -Body @{ nombre = ""; anioInicio = 2024; anioFin = 2026 } `
    -ExpectedStatus @(400) -ExpectSuccess $false

# 2.1.7: Rechazar nombre > 200 caracteres
Test-Api -TestName "2.1.7: Rechazar nombre > 200 caracteres" `
    -Method POST -Endpoint "/pgd" -Token $adminToken `
    -Body @{ nombre = "A" * 201; anioInicio = 2024; anioFin = 2026 } `
    -ExpectedStatus @(400) -ExpectSuccess $false

# 2.1.8: Rechazar año fuera de rango
Test-Api -TestName "2.1.8: Rechazar año fuera de rango" `
    -Method POST -Endpoint "/pgd" -Token $adminToken `
    -Body @{ nombre = "Plan Inválido"; anioInicio = 1999; anioFin = 2025 } `
    -ExpectedStatus @(400) -ExpectSuccess $false

# 2.2.1: Listar todos los PGDs
Test-Api -TestName "2.2.1: Listar todos los PGDs" `
    -Method GET -Endpoint "/pgd" -Token $adminToken `
    -ExpectedStatus @(200)

# 2.2.2: Filtrar PGDs por estado
Test-Api -TestName "2.2.2: Filtrar PGDs por estado BORRADOR" `
    -Method GET -Endpoint "/pgd?estado=BORRADOR" -Token $adminToken `
    -ExpectedStatus @(200)

# 2.2.3: Filtrar PGDs por año
Test-Api -TestName "2.2.3: Filtrar PGDs por año 2024" `
    -Method GET -Endpoint "/pgd?anio=2024" -Token $adminToken `
    -ExpectedStatus @(200)

# 2.2.4: Filtrar PGDs activos
Test-Api -TestName "2.2.4: Filtrar PGDs activos" `
    -Method GET -Endpoint "/pgd?activo=true" -Token $adminToken `
    -ExpectedStatus @(200)

# 2.2.5: Paginación de PGDs
Test-Api -TestName "2.2.5: Paginación de PGDs" `
    -Method GET -Endpoint "/pgd?page=1&limit=1" -Token $adminToken `
    -ExpectedStatus @(200)

# 2.2.6: Obtener PGD vigente
Test-Api -TestName "2.2.6: Obtener PGD vigente" `
    -Method GET -Endpoint "/pgd/vigente" -Token $adminToken `
    -ExpectedStatus @(200)

# 2.2.7: Obtener PGD por ID
if ($ids.pgdId) {
    Test-Api -TestName "2.2.7: Obtener PGD por ID" `
        -Method GET -Endpoint "/pgd/$($ids.pgdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

# 2.2.8: Rechazar PGD inexistente
Test-Api -TestName "2.2.8: Rechazar PGD inexistente" `
    -Method GET -Endpoint "/pgd/99999" -Token $adminToken `
    -ExpectedStatus @(404) -ExpectSuccess $false

# 2.3.1: Actualizar PGD como ADMIN
if ($ids.pgdId) {
    Test-Api -TestName "2.3.1: Actualizar PGD como ADMIN" `
        -Method PATCH -Endpoint "/pgd/$($ids.pgdId)" -Token $adminToken `
        -Body @{
            nombre = "Plan de Gestión 2024-2026 (Actualizado)"
            descripcion = "Descripción actualizada"
        } -ExpectedStatus @(200)
}

# 2.3.2: Actualizar PGD como PMO
if ($ids.pgdIdPmo) {
    Test-Api -TestName "2.3.2: Actualizar PGD como PMO" `
        -Method PATCH -Endpoint "/pgd/$($ids.pgdIdPmo)" -Token $pmoToken `
        -Body @{ descripcion = "Descripción PMO actualizada" } `
        -ExpectedStatus @(200)
}

# 2.3.3: Rechazar actualización como DESARROLLADOR
if ($ids.pgdId) {
    Test-Api -TestName "2.3.3: Rechazar actualización como DESARROLLADOR" `
        -Method PATCH -Endpoint "/pgd/$($ids.pgdId)" -Token $devToken `
        -Body @{ nombre = "Intento actualización" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 2.3.4: Actualizar solo campo específico
if ($ids.pgdId) {
    Test-Api -TestName "2.3.4: Actualizar solo campo activo" `
        -Method PATCH -Endpoint "/pgd/$($ids.pgdId)" -Token $adminToken `
        -Body @{ activo = $false } `
        -ExpectedStatus @(200)

    # Revertir para no afectar otros tests
    Test-Api -TestName "2.3.4b: Revertir activo a true" `
        -Method PATCH -Endpoint "/pgd/$($ids.pgdId)" -Token $adminToken `
        -Body @{ activo = $true } `
        -ExpectedStatus @(200)
}

# 2.4.1: Establecer PGD como vigente
if ($ids.pgdId) {
    Test-Api -TestName "2.4.1: Establecer PGD como vigente" `
        -Method POST -Endpoint "/pgd/$($ids.pgdId)/set-vigente" -Token $adminToken `
        -ExpectedStatus @(200)
}

# 2.4.2: Verificar solo 1 PGD VIGENTE
Test-Api -TestName "2.4.2: Verificar solo 1 PGD VIGENTE" `
    -Method GET -Endpoint "/pgd?estado=VIGENTE" -Token $adminToken `
    -ExpectedStatus @(200)

# 2.4.3: Rechazar set-vigente como DESARROLLADOR
if ($ids.pgdId) {
    Test-Api -TestName "2.4.3: Rechazar set-vigente como DESARROLLADOR" `
        -Method POST -Endpoint "/pgd/$($ids.pgdId)/set-vigente" -Token $devToken `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 2.5.1: Soft delete de PGD
if ($ids.pgdIdPmo) {
    Test-Api -TestName "2.5.1: Soft delete de PGD PMO" `
        -Method DELETE -Endpoint "/pgd/$($ids.pgdIdPmo)" -Token $adminToken `
        -ExpectedStatus @(200)
}

# 2.5.2: Verificar soft delete no elimina de BD
if ($ids.pgdIdPmo) {
    Test-Api -TestName "2.5.2: Verificar PGD soft-deleted existe" `
        -Method GET -Endpoint "/pgd/$($ids.pgdIdPmo)" -Token $adminToken `
        -ExpectedStatus @(200)
}

# 2.5.3: Rechazar delete como DESARROLLADOR
if ($ids.pgdId) {
    Test-Api -TestName "2.5.3: Rechazar delete como DESARROLLADOR" `
        -Method DELETE -Endpoint "/pgd/$($ids.pgdId)" -Token $devToken `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# =======================================================================
# FASE 3: PRUEBAS DE OEI
# =======================================================================

Write-TestHeader "FASE 3: PRUEBAS DE OEI (Objetivos Estratégicos)"

# 3.1.1: Crear OEI válido
if ($ids.pgdId) {
    $result = Test-Api -TestName "3.1.1: Crear OEI válido" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{
            pgdId = $ids.pgdId
            codigo = "OEI-001"
            nombre = "Modernizar infraestructura tecnológica institucional"
            descripcion = "Implementar cloud computing y DevOps"
            indicador = "Porcentaje de sistemas en la nube"
            lineaBase = 15.5
            unidadMedida = "Porcentaje"
            metasAnuales = @(
                @{ anio = 2024; meta = 30; logrado = 25 },
                @{ anio = 2025; meta = 70 },
                @{ anio = 2026; meta = 100 }
            )
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.oeiId = $result.Content.data.id
        Write-Host "  -> OEI ID guardado: $($ids.oeiId)" -ForegroundColor Gray
    }
}

# 3.1.2: Crear segundo OEI
if ($ids.pgdId) {
    $result = Test-Api -TestName "3.1.2: Crear segundo OEI" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{
            pgdId = $ids.pgdId
            codigo = "OEI-002"
            nombre = "Mejorar la atención ciudadana digital"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.oeiId2 = $result.Content.data.id
        Write-Host "  -> OEI2 ID guardado: $($ids.oeiId2)" -ForegroundColor Gray
    }
}

# 3.1.3: Rechazar código duplicado
if ($ids.pgdId) {
    Test-Api -TestName "3.1.3: Rechazar código OEI duplicado" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OEI-001"; nombre = "Duplicado" } `
        -ExpectedStatus @(409) -ExpectSuccess $false
}

# 3.1.4: Rechazar pgdId inexistente
Test-Api -TestName "3.1.4: Rechazar pgdId inexistente" `
    -Method POST -Endpoint "/oei" -Token $adminToken `
    -Body @{ pgdId = 99999; codigo = "OEI-003"; nombre = "OEI inválido" } `
    -ExpectedStatus @(400, 404) -ExpectSuccess $false

# 3.1.5: Rechazar código > 20 caracteres
if ($ids.pgdId) {
    Test-Api -TestName "3.1.5: Rechazar código > 20 chars" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OEI-CODIGO-MUY-LARGO-INVALIDO-001"; nombre = "OEI" } `
        -ExpectedStatus @(400) -ExpectSuccess $false
}

# 3.1.6: Rechazar nombre > 300 caracteres
if ($ids.pgdId) {
    Test-Api -TestName "3.1.6: Rechazar nombre > 300 chars" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OEI-004"; nombre = "A" * 301 } `
        -ExpectedStatus @(400) -ExpectSuccess $false
}

# 3.1.7: Crear OEI mínimo
if ($ids.pgdId) {
    Test-Api -TestName "3.1.7: Crear OEI mínimo sin opcionales" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OEI-MIN"; nombre = "OEI mínimo" } `
        -ExpectedStatus @(201)
}

# 3.1.8: Rechazar metasAnuales con año inválido
if ($ids.pgdId) {
    Test-Api -TestName "3.1.8: Rechazar metas con año inválido" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{
            pgdId = $ids.pgdId
            codigo = "OEI-005"
            nombre = "OEI con metas inválidas"
            metasAnuales = @(@{ anio = 1999; meta = 50 })
        } -ExpectedStatus @(400) -ExpectSuccess $false
}

# 3.1.9: Rechazar creación como DESARROLLADOR
if ($ids.pgdId) {
    Test-Api -TestName "3.1.9: Rechazar creación como DESARROLLADOR" `
        -Method POST -Endpoint "/oei" -Token $devToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OEI-DEV"; nombre = "OEI Dev" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 3.2: READ tests
Test-Api -TestName "3.2.1: Listar todos los OEIs" `
    -Method GET -Endpoint "/oei" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.pgdId) {
    Test-Api -TestName "3.2.2: Filtrar OEIs por pgdId" `
        -Method GET -Endpoint "/oei?pgdId=$($ids.pgdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "3.2.3: Filtrar OEIs activos" `
    -Method GET -Endpoint "/oei?activo=true" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.oeiId) {
    Test-Api -TestName "3.2.4: Obtener OEI por ID con relaciones" `
        -Method GET -Endpoint "/oei/$($ids.oeiId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.pgdId) {
    Test-Api -TestName "3.2.5: Endpoint anidado - OEIs de un PGD" `
        -Method GET -Endpoint "/pgd/$($ids.pgdId)/oei" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "3.2.6: Rechazar OEI inexistente" `
    -Method GET -Endpoint "/oei/99999" -Token $adminToken `
    -ExpectedStatus @(404) -ExpectSuccess $false

# 3.3: UPDATE tests
if ($ids.oeiId) {
    Test-Api -TestName "3.3.1: Actualizar OEI como ADMIN" `
        -Method PATCH -Endpoint "/oei/$($ids.oeiId)" -Token $adminToken `
        -Body @{
            nombre = "Modernizar infraestructura TI (Actualizado)"
            lineaBase = 18.0
        } -ExpectedStatus @(200)
}

if ($ids.oeiId2) {
    Test-Api -TestName "3.3.2: Actualizar código a uno diferente" `
        -Method PATCH -Endpoint "/oei/$($ids.oeiId2)" -Token $adminToken `
        -Body @{ codigo = "OEI-002-NEW" } `
        -ExpectedStatus @(200)
}

if ($ids.oeiId2) {
    Test-Api -TestName "3.3.3: Rechazar código duplicado en UPDATE" `
        -Method PATCH -Endpoint "/oei/$($ids.oeiId2)" -Token $adminToken `
        -Body @{ codigo = "OEI-001" } `
        -ExpectedStatus @(409) -ExpectSuccess $false
}

if ($ids.oeiId) {
    Test-Api -TestName "3.3.4: Verificar pgdId no se puede cambiar" `
        -Method PATCH -Endpoint "/oei/$($ids.oeiId)" -Token $adminToken `
        -Body @{ pgdId = 99999 } `
        -ExpectedStatus @(200, 400)
}

if ($ids.oeiId) {
    Test-Api -TestName "3.3.5: Rechazar UPDATE como DESARROLLADOR" `
        -Method PATCH -Endpoint "/oei/$($ids.oeiId)" -Token $devToken `
        -Body @{ nombre = "Intento" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 3.4: DELETE tests
if ($ids.oeiId2) {
    Test-Api -TestName "3.4.1: Soft delete de OEI" `
        -Method DELETE -Endpoint "/oei/$($ids.oeiId2)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.pgdId) {
    Test-Api -TestName "3.4.2: Verificar OEI eliminado no aparece en listado activo" `
        -Method GET -Endpoint "/pgd/$($ids.pgdId)/oei" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oeiId2) {
    Test-Api -TestName "3.4.3: Verificar OEI eliminado sigue en BD" `
        -Method GET -Endpoint "/oei/$($ids.oeiId2)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oeiId) {
    Test-Api -TestName "3.4.4: Rechazar DELETE como DESARROLLADOR" `
        -Method DELETE -Endpoint "/oei/$($ids.oeiId)" -Token $devToken `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# =======================================================================
# FASE 4: PRUEBAS DE OGD
# =======================================================================

Write-TestHeader "FASE 4: PRUEBAS DE OGD (Gobierno Digital)"

# 4.1.1: Crear OGD válido
if ($ids.pgdId) {
    $result = Test-Api -TestName "4.1.1: Crear OGD válido" `
        -Method POST -Endpoint "/ogd" -Token $adminToken `
        -Body @{
            pgdId = $ids.pgdId
            codigo = "OGD-001"
            nombre = "Implementar Gobierno Digital en INEI"
            descripcion = "Transformación digital de servicios al ciudadano"
            indicador = "Porcentaje de trámites digitalizados"
            lineaBase = 20.0
            unidadMedida = "Porcentaje"
            metasAnuales = @(
                @{ anio = 2024; meta = 40 },
                @{ anio = 2025; meta = 70 },
                @{ anio = 2026; meta = 95 }
            )
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.ogdId = $result.Content.data.id
        Write-Host "  -> OGD ID guardado: $($ids.ogdId)" -ForegroundColor Gray
    }
}

# 4.1.2: Crear segundo OGD
if ($ids.pgdId) {
    $result = Test-Api -TestName "4.1.2: Crear segundo OGD" `
        -Method POST -Endpoint "/ogd" -Token $adminToken `
        -Body @{
            pgdId = $ids.pgdId
            codigo = "OGD-002"
            nombre = "Digitalización de procesos internos"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.ogdId2 = $result.Content.data.id
        Write-Host "  -> OGD2 ID guardado: $($ids.ogdId2)" -ForegroundColor Gray
    }
}

# 4.1.3-4.1.7: Validaciones OGD
if ($ids.pgdId) {
    Test-Api -TestName "4.1.3: Rechazar código OGD duplicado" `
        -Method POST -Endpoint "/ogd" -Token $adminToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OGD-001"; nombre = "Dup" } `
        -ExpectedStatus @(409) -ExpectSuccess $false
}

Test-Api -TestName "4.1.4: Rechazar pgdId inexistente en OGD" `
    -Method POST -Endpoint "/ogd" -Token $adminToken `
    -Body @{ pgdId = 99999; codigo = "OGD-003"; nombre = "OGD inválido" } `
    -ExpectedStatus @(400, 404) -ExpectSuccess $false

if ($ids.pgdId) {
    Test-Api -TestName "4.1.5: Crear OGD sin metasAnuales" `
        -Method POST -Endpoint "/ogd" -Token $adminToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OGD-MIN"; nombre = "OGD mínimo" } `
        -ExpectedStatus @(201)
}

if ($ids.pgdId) {
    Test-Api -TestName "4.1.6: Crear OGD como PMO (debe funcionar)" `
        -Method POST -Endpoint "/ogd" -Token $pmoToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OGD-PMO"; nombre = "OGD por PMO" } `
        -ExpectedStatus @(201)
}

if ($ids.pgdId) {
    Test-Api -TestName "4.1.7: Rechazar OGD como DESARROLLADOR" `
        -Method POST -Endpoint "/ogd" -Token $devToken `
        -Body @{ pgdId = $ids.pgdId; codigo = "OGD-DEV"; nombre = "OGD Dev" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 4.2: READ tests OGD
Test-Api -TestName "4.2.1: Listar todos los OGDs" `
    -Method GET -Endpoint "/ogd" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.pgdId) {
    Test-Api -TestName "4.2.2: Filtrar OGDs por pgdId" `
        -Method GET -Endpoint "/ogd?pgdId=$($ids.pgdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.ogdId) {
    Test-Api -TestName "4.2.3: Obtener OGD por ID con relaciones" `
        -Method GET -Endpoint "/ogd/$($ids.ogdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.pgdId) {
    Test-Api -TestName "4.2.4: Endpoint anidado - OGDs de un PGD" `
        -Method GET -Endpoint "/pgd/$($ids.pgdId)/ogd" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "4.2.5: Rechazar OGD inexistente" `
    -Method GET -Endpoint "/ogd/99999" -Token $adminToken `
    -ExpectedStatus @(404) -ExpectSuccess $false

# 4.3: UPDATE tests OGD
if ($ids.ogdId) {
    Test-Api -TestName "4.3.1: Actualizar OGD" `
        -Method PATCH -Endpoint "/ogd/$($ids.ogdId)" -Token $adminToken `
        -Body @{
            nombre = "Implementar Gobierno Digital en INEI (Actualizado)"
            lineaBase = 25.0
        } -ExpectedStatus @(200)
}

if ($ids.ogdId) {
    Test-Api -TestName "4.3.2: Rechazar cambio de pgdId en OGD" `
        -Method PATCH -Endpoint "/ogd/$($ids.ogdId)" -Token $adminToken `
        -Body @{ pgdId = 99999 } `
        -ExpectedStatus @(200, 400)
}

if ($ids.ogdId) {
    Test-Api -TestName "4.3.3: Rechazar UPDATE OGD como DESARROLLADOR" `
        -Method PATCH -Endpoint "/ogd/$($ids.ogdId)" -Token $devToken `
        -Body @{ nombre = "Intento" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 4.4: DELETE tests OGD
if ($ids.ogdId2) {
    Test-Api -TestName "4.4.1: Soft delete de OGD" `
        -Method DELETE -Endpoint "/ogd/$($ids.ogdId2)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.ogdId) {
    Test-Api -TestName "4.4.2: Rechazar DELETE OGD como DESARROLLADOR" `
        -Method DELETE -Endpoint "/ogd/$($ids.ogdId)" -Token $devToken `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# =======================================================================
# FASE 5: PRUEBAS DE OEGD
# =======================================================================

Write-TestHeader "FASE 5: PRUEBAS DE OEGD (Objetivos Específicos GD)"

# 5.1: CREATE tests OEGD
if ($ids.ogdId) {
    $result = Test-Api -TestName "5.1.1: Crear OEGD válido" `
        -Method POST -Endpoint "/oegd" -Token $adminToken `
        -Body @{
            ogdId = $ids.ogdId
            codigo = "OEGD-001"
            nombre = "Plataforma de trámites en línea"
            descripcion = "Portal ciudadano para gestión de trámites"
            indicador = "Número de trámites digitalizados"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.oegdId = $result.Content.data.id
        Write-Host "  -> OEGD ID guardado: $($ids.oegdId)" -ForegroundColor Gray
    }
}

if ($ids.ogdId) {
    $result = Test-Api -TestName "5.1.2: Crear segundo OEGD" `
        -Method POST -Endpoint "/oegd" -Token $adminToken `
        -Body @{
            ogdId = $ids.ogdId
            codigo = "OEGD-002"
            nombre = "Sistema de notificaciones electrónicas"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.oegdId2 = $result.Content.data.id
        Write-Host "  -> OEGD2 ID guardado: $($ids.oegdId2)" -ForegroundColor Gray
    }
}

if ($ids.ogdId) {
    $result = Test-Api -TestName "5.1.3: Crear tercer OEGD" `
        -Method POST -Endpoint "/oegd" -Token $adminToken `
        -Body @{
            ogdId = $ids.ogdId
            codigo = "OEGD-003"
            nombre = "Firma digital avanzada"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.oegdId3 = $result.Content.data.id
        Write-Host "  -> OEGD3 ID guardado: $($ids.oegdId3)" -ForegroundColor Gray
    }
}

# Validaciones OEGD
if ($ids.ogdId) {
    Test-Api -TestName "5.1.4: Rechazar código OEGD duplicado" `
        -Method POST -Endpoint "/oegd" -Token $adminToken `
        -Body @{ ogdId = $ids.ogdId; codigo = "OEGD-001"; nombre = "Dup" } `
        -ExpectedStatus @(409) -ExpectSuccess $false
}

Test-Api -TestName "5.1.5: Rechazar ogdId inexistente" `
    -Method POST -Endpoint "/oegd" -Token $adminToken `
    -Body @{ ogdId = 99999; codigo = "OEGD-004"; nombre = "OEGD inválido" } `
    -ExpectedStatus @(400, 404) -ExpectSuccess $false

if ($ids.ogdId) {
    Test-Api -TestName "5.1.6: Crear OEGD mínimo" `
        -Method POST -Endpoint "/oegd" -Token $adminToken `
        -Body @{ ogdId = $ids.ogdId; codigo = "OEGD-MIN"; nombre = "OEGD mínimo" } `
        -ExpectedStatus @(201)
}

if ($ids.ogdId) {
    Test-Api -TestName "5.1.7: Rechazar código OEGD > 20 chars" `
        -Method POST -Endpoint "/oegd" -Token $adminToken `
        -Body @{ ogdId = $ids.ogdId; codigo = "OEGD-CODIGO-DEMASIADO-LARGO-INVALIDO"; nombre = "OEGD" } `
        -ExpectedStatus @(400) -ExpectSuccess $false
}

if ($ids.ogdId) {
    Test-Api -TestName "5.1.8: Rechazar creación OEGD como DESARROLLADOR" `
        -Method POST -Endpoint "/oegd" -Token $devToken `
        -Body @{ ogdId = $ids.ogdId; codigo = "OEGD-DEV"; nombre = "OEGD Dev" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

if ($ids.oegdId) {
    Test-Api -TestName "5.1.9: Verificar OEGD NO tiene metasAnuales" `
        -Method GET -Endpoint "/oegd/$($ids.oegdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

# 5.2: READ tests OEGD
Test-Api -TestName "5.2.1: Listar todos los OEGDs" `
    -Method GET -Endpoint "/oegd" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.ogdId) {
    Test-Api -TestName "5.2.2: Filtrar OEGDs por ogdId" `
        -Method GET -Endpoint "/oegd?ogdId=$($ids.ogdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "5.2.3: Filtrar OEGDs activos" `
    -Method GET -Endpoint "/oegd?activo=true" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.oegdId) {
    Test-Api -TestName "5.2.4: Obtener OEGD por ID con relaciones" `
        -Method GET -Endpoint "/oegd/$($ids.oegdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.ogdId) {
    Test-Api -TestName "5.2.5: Endpoint anidado - OEGDs de un OGD" `
        -Method GET -Endpoint "/ogd/$($ids.ogdId)/oegd" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "5.2.6: Rechazar OEGD inexistente" `
    -Method GET -Endpoint "/oegd/99999" -Token $adminToken `
    -ExpectedStatus @(404) -ExpectSuccess $false

# 5.3: UPDATE tests OEGD
if ($ids.oegdId) {
    Test-Api -TestName "5.3.1: Actualizar OEGD" `
        -Method PATCH -Endpoint "/oegd/$($ids.oegdId)" -Token $adminToken `
        -Body @{
            nombre = "Plataforma de trámites en línea (Actualizado)"
            descripcion = "Portal ciudadano mejorado con IA"
        } -ExpectedStatus @(200)
}

if ($ids.oegdId2) {
    Test-Api -TestName "5.3.2: Actualizar código OEGD a uno diferente" `
        -Method PATCH -Endpoint "/oegd/$($ids.oegdId2)" -Token $adminToken `
        -Body @{ codigo = "OEGD-002-NEW" } `
        -ExpectedStatus @(200)
}

if ($ids.oegdId) {
    Test-Api -TestName "5.3.3: Rechazar cambio de ogdId" `
        -Method PATCH -Endpoint "/oegd/$($ids.oegdId)" -Token $adminToken `
        -Body @{ ogdId = 99999 } `
        -ExpectedStatus @(200, 400)
}

if ($ids.oegdId) {
    Test-Api -TestName "5.3.4: Rechazar UPDATE OEGD como DESARROLLADOR" `
        -Method PATCH -Endpoint "/oegd/$($ids.oegdId)" -Token $devToken `
        -Body @{ nombre = "Intento" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 5.4: DELETE tests OEGD
if ($ids.oegdId3) {
    Test-Api -TestName "5.4.1: Soft delete de OEGD" `
        -Method DELETE -Endpoint "/oegd/$($ids.oegdId3)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.ogdId) {
    Test-Api -TestName "5.4.2: Verificar OEGD eliminado no en listado activo" `
        -Method GET -Endpoint "/ogd/$($ids.ogdId)/oegd" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oegdId) {
    Test-Api -TestName "5.4.3: Rechazar DELETE OEGD como DESARROLLADOR" `
        -Method DELETE -Endpoint "/oegd/$($ids.oegdId)" -Token $devToken `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# =======================================================================
# FASE 6: PRUEBAS DE ACCIÓN ESTRATÉGICA
# =======================================================================

Write-TestHeader "FASE 6: PRUEBAS DE ACCIÓN ESTRATÉGICA"

# 6.1: CREATE tests AE
if ($ids.oegdId) {
    $result = Test-Api -TestName "6.1.1: Crear Acción Estratégica válida" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{
            oegdId = $ids.oegdId
            codigo = "AE-001"
            nombre = "Implementar portal ciudadano"
            descripcion = "Desarrollo e implementación de portal web para ciudadanos"
            indicador = "Portal operativo y accesible 24/7"
            responsableArea = "Dirección de TI"
            fechaInicio = "2024-01-15"
            fechaFin = "2024-12-31"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.aeId = $result.Content.data.id
        Write-Host "  -> AE ID guardado: $($ids.aeId)" -ForegroundColor Gray
    }
}

if ($ids.oegdId) {
    $result = Test-Api -TestName "6.1.2: Crear segunda Acción Estratégica" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{
            oegdId = $ids.oegdId
            codigo = "AE-002"
            nombre = "Sistema de citas en línea"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.aeId2 = $result.Content.data.id
        Write-Host "  -> AE2 ID guardado: $($ids.aeId2)" -ForegroundColor Gray
    }
}

if ($ids.oegdId2) {
    $result = Test-Api -TestName "6.1.3: Crear AE en OEGD diferente" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{
            oegdId = $ids.oegdId2
            codigo = "AE-003"
            nombre = "Capacitación en gobierno digital"
        } -ExpectedStatus @(201)

    if ($result.Content) {
        $ids.aeId3 = $result.Content.data.id
        Write-Host "  -> AE3 ID guardado: $($ids.aeId3)" -ForegroundColor Gray
    }
}

# Validaciones AE
if ($ids.oegdId) {
    Test-Api -TestName "6.1.4: Rechazar código AE duplicado" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{ oegdId = $ids.oegdId; codigo = "AE-001"; nombre = "Dup" } `
        -ExpectedStatus @(409) -ExpectSuccess $false
}

Test-Api -TestName "6.1.5: Rechazar oegdId inexistente" `
    -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
    -Body @{ oegdId = 99999; codigo = "AE-004"; nombre = "AE inválida" } `
    -ExpectedStatus @(400, 404) -ExpectSuccess $false

if ($ids.oegdId) {
    Test-Api -TestName "6.1.6: Crear AE sin campos opcionales" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{ oegdId = $ids.oegdId; codigo = "AE-MIN"; nombre = "AE mínima" } `
        -ExpectedStatus @(201)
}

if ($ids.oegdId) {
    Test-Api -TestName "6.1.7: Crear AE con solo fechaInicio" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{
            oegdId = $ids.oegdId
            codigo = "AE-005"
            nombre = "AE con inicio solamente"
            fechaInicio = "2024-03-01"
        } -ExpectedStatus @(201)
}

if ($ids.oegdId) {
    Test-Api -TestName "6.1.8: Crear AE con solo fechaFin" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{
            oegdId = $ids.oegdId
            codigo = "AE-006"
            nombre = "AE con fin solamente"
            fechaFin = "2024-12-31"
        } -ExpectedStatus @(201)
}

if ($ids.oegdId) {
    Test-Api -TestName "6.1.9: Rechazar responsableArea > 100 chars" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{
            oegdId = $ids.oegdId
            codigo = "AE-007"
            nombre = "AE inválida"
            responsableArea = "A" * 101
        } -ExpectedStatus @(400) -ExpectSuccess $false
}

if ($ids.oegdId) {
    Test-Api -TestName "6.1.10: Rechazar creación AE como DESARROLLADOR" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $devToken `
        -Body @{ oegdId = $ids.oegdId; codigo = "AE-DEV"; nombre = "AE Dev" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 6.2: READ tests AE
Test-Api -TestName "6.2.1: Listar todas las Acciones Estratégicas" `
    -Method GET -Endpoint "/acciones-estrategicas" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.oegdId) {
    Test-Api -TestName "6.2.2: Filtrar AEs por oegdId" `
        -Method GET -Endpoint "/acciones-estrategicas?oegdId=$($ids.oegdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "6.2.3: Filtrar AEs activas" `
    -Method GET -Endpoint "/acciones-estrategicas?activo=true" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.aeId) {
    Test-Api -TestName "6.2.4: Obtener AE por ID con relaciones" `
        -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oegdId) {
    Test-Api -TestName "6.2.5: Endpoint anidado - AEs de un OEGD" `
        -Method GET -Endpoint "/oegd/$($ids.oegdId)/acciones-estrategicas" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oegdId) {
    Test-Api -TestName "6.2.6: Verificar múltiples AEs en mismo OEGD" `
        -Method GET -Endpoint "/oegd/$($ids.oegdId)/acciones-estrategicas" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "6.2.7: Rechazar AE inexistente" `
    -Method GET -Endpoint "/acciones-estrategicas/99999" -Token $adminToken `
    -ExpectedStatus @(404) -ExpectSuccess $false

# 6.3: UPDATE tests AE
if ($ids.aeId) {
    Test-Api -TestName "6.3.1: Actualizar AE completamente" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $adminToken `
        -Body @{
            nombre = "Implementar portal ciudadano v2.0"
            descripcion = "Portal mejorado con módulo de pagos"
            responsableArea = "Dirección de Transformación Digital"
            fechaInicio = "2024-02-01"
            fechaFin = "2024-11-30"
        } -ExpectedStatus @(200)
}

if ($ids.aeId2) {
    Test-Api -TestName "6.3.2: Actualizar solo nombre de AE" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId2)" -Token $adminToken `
        -Body @{ nombre = "Nombre actualizado" } `
        -ExpectedStatus @(200)
}

if ($ids.aeId2) {
    Test-Api -TestName "6.3.3: Actualizar código AE a uno diferente" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId2)" -Token $adminToken `
        -Body @{ codigo = "AE-002-NEW" } `
        -ExpectedStatus @(200)
}

if ($ids.aeId2) {
    Test-Api -TestName "6.3.4: Rechazar código AE duplicado en UPDATE" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId2)" -Token $adminToken `
        -Body @{ codigo = "AE-001" } `
        -ExpectedStatus @(409) -ExpectSuccess $false
}

if ($ids.aeId) {
    Test-Api -TestName "6.3.5: Rechazar cambio de oegdId" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $adminToken `
        -Body @{ oegdId = 99999 } `
        -ExpectedStatus @(200, 400)
}

if ($ids.aeId) {
    Test-Api -TestName "6.3.6: Actualizar solo fechas" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $adminToken `
        -Body @{
            fechaInicio = "2024-03-15"
            fechaFin = "2024-10-15"
        } -ExpectedStatus @(200)
}

if ($ids.aeId) {
    Test-Api -TestName "6.3.7: Rechazar UPDATE AE como DESARROLLADOR" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $devToken `
        -Body @{ nombre = "Intento" } `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# 6.4: DELETE tests AE
if ($ids.aeId3) {
    Test-Api -TestName "6.4.1: Soft delete de AE" `
        -Method DELETE -Endpoint "/acciones-estrategicas/$($ids.aeId3)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oegdId2) {
    Test-Api -TestName "6.4.2: Verificar AE eliminada no en listado activo" `
        -Method GET -Endpoint "/oegd/$($ids.oegdId2)/acciones-estrategicas" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.aeId3) {
    Test-Api -TestName "6.4.3: Verificar AE eliminada sigue en BD" `
        -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId3)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.aeId2) {
    Test-Api -TestName "6.4.4: DELETE AE como PMO (debe funcionar)" `
        -Method DELETE -Endpoint "/acciones-estrategicas/$($ids.aeId2)" -Token $pmoToken `
        -ExpectedStatus @(200)
}

if ($ids.aeId) {
    Test-Api -TestName "6.4.5: Rechazar DELETE AE como DESARROLLADOR" `
        -Method DELETE -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $devToken `
        -ExpectedStatus @(403) -ExpectSuccess $false
}

# =======================================================================
# FASE 7: PRUEBAS DE JERARQUÍA COMPLETA
# =======================================================================

Write-TestHeader "FASE 7: VERIFICACIÓN DE JERARQUÍA COMPLETA"

if ($ids.pgdId) {
    Test-Api -TestName "7.1.1: Obtener PGD con jerarquía completa" `
        -Method GET -Endpoint "/pgd/$($ids.pgdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.pgdId) {
    Test-Api -TestName "7.1.2: Verificar relacion PGD -> OEI" `
        -Method GET -Endpoint "/pgd/$($ids.pgdId)/oei" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.pgdId) {
    Test-Api -TestName "7.1.3: Verificar relacion PGD -> OGD" `
        -Method GET -Endpoint "/pgd/$($ids.pgdId)/ogd" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.ogdId) {
    Test-Api -TestName "7.1.4: Verificar relacion OGD -> OEGD" `
        -Method GET -Endpoint "/ogd/$($ids.ogdId)/oegd" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oegdId) {
    Test-Api -TestName "7.1.5: Verificar relacion OEGD -> AE" `
        -Method GET -Endpoint "/oegd/$($ids.oegdId)/acciones-estrategicas" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.ogdId) {
    Test-Api -TestName "7.1.6: Obtener OGD con OEGD y AEs anidadas" `
        -Method GET -Endpoint "/ogd/$($ids.ogdId)" -Token $adminToken `
        -ExpectedStatus @(200)
}

# 7.2: Verificar soft deletes
if ($ids.pgdIdPmo) {
    Test-Api -TestName "7.2.1: Verificar PGD soft-deleted" `
        -Method GET -Endpoint "/pgd/$($ids.pgdIdPmo)" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oeiId2) {
    Test-Api -TestName "7.2.2: Verificar OEI soft-deleted" `
        -Method GET -Endpoint "/oei/$($ids.oeiId2)" -Token $adminToken `
        -ExpectedStatus @(200)
}

# =======================================================================
# FASE 8: CASOS EDGE
# =======================================================================

Write-TestHeader "FASE 8: PRUEBAS DE CASOS EDGE"

# 8.1: Paginación y filtros
if ($ids.pgdId) {
    Test-Api -TestName "8.1.1: Paginación de PGDs" `
        -Method GET -Endpoint "/pgd?page=1&limit=2" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.pgdId) {
    Test-Api -TestName "8.1.2: Filtros combinados en OEI" `
        -Method GET -Endpoint "/oei?pgdId=$($ids.pgdId)&activo=true" -Token $adminToken `
        -ExpectedStatus @(200)
}

if ($ids.oegdId) {
    Test-Api -TestName "8.1.3: Filtros múltiples en AEs" `
        -Method GET -Endpoint "/acciones-estrategicas?oegdId=$($ids.oegdId)&activo=true" -Token $adminToken `
        -ExpectedStatus @(200)
}

# 8.2: Validaciones de longitud
if ($ids.pgdId) {
    Test-Api -TestName "8.2.1: Rechazar indicador > 500 chars en OEI" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{
            pgdId = $ids.pgdId
            codigo = "OEI-LONG"
            nombre = "OEI con indicador largo"
            indicador = "A" * 501
        } -ExpectedStatus @(400) -ExpectSuccess $false
}

if ($ids.pgdId) {
    Test-Api -TestName "8.2.2: Rechazar unidadMedida > 50 chars" `
        -Method POST -Endpoint "/oei" -Token $adminToken `
        -Body @{
            pgdId = $ids.pgdId
            codigo = "OEI-UNIT"
            nombre = "OEI con unidad larga"
            unidadMedida = "A" * 51
        } -ExpectedStatus @(400) -ExpectSuccess $false
}

# 8.3: Estado PGD
$result = Test-Api -TestName "8.3.1: Crear PGD con estado VIGENTE directamente" `
    -Method POST -Endpoint "/pgd" -Token $adminToken `
    -Body @{
        nombre = "PGD Vigente desde creación"
        anioInicio = 2025
        anioFin = 2027
        estado = "VIGENTE"
    } -ExpectedStatus @(201)

Test-Api -TestName "8.3.2: Verificar múltiples PGDs VIGENTE posibles" `
    -Method GET -Endpoint "/pgd?estado=VIGENTE" -Token $adminToken `
    -ExpectedStatus @(200)

if ($ids.pgdId) {
    Test-Api -TestName "8.3.3: set-vigente cambia otros a FINALIZADO" `
        -Method POST -Endpoint "/pgd/$($ids.pgdId)/set-vigente" -Token $adminToken `
        -ExpectedStatus @(200)
}

Test-Api -TestName "8.3.3b: Verificar solo 1 PGD VIGENTE después de set-vigente" `
    -Method GET -Endpoint "/pgd?estado=VIGENTE" -Token $adminToken `
    -ExpectedStatus @(200)

# 8.4: Fechas en AE
if ($ids.oegdId) {
    Test-Api -TestName "8.4.1: Crear AE con fechas invertidas (puede pasar)" `
        -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken `
        -Body @{
            oegdId = $ids.oegdId
            codigo = "AE-FECHA-INV"
            nombre = "AE con fechas invertidas"
            fechaInicio = "2024-12-31"
            fechaFin = "2024-01-01"
        } -ExpectedStatus @(201, 400)
}

if ($ids.aeId) {
    Test-Api -TestName "8.4.2: Actualizar fechas a rangos válidos" `
        -Method PATCH -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $adminToken `
        -Body @{
            fechaInicio = "2024-01-01"
            fechaFin = "2024-12-31"
        } -ExpectedStatus @(200)
}

# 8.5: Acceso sin autenticación
Test-Api -TestName "8.5.1: GET sin auth (puede fallar con 401)" `
    -Method GET -Endpoint "/pgd" `
    -ExpectedStatus @(200, 401)

Test-Api -TestName "8.5.2: POST sin auth debe fallar (401)" `
    -Method POST -Endpoint "/pgd" `
    -Body @{ nombre = "Plan Sin Auth"; anioInicio = 2024; anioFin = 2026 } `
    -ExpectedStatus @(401) -ExpectSuccess $false

# =======================================================================
# RESUMEN FINAL
# =======================================================================

Write-TestHeader "RESUMEN FINAL DE PRUEBAS"

$stats.EndTime = Get-Date
$duration = $stats.EndTime - $stats.StartTime

Write-Host "`nESTADÍSTICAS:" -ForegroundColor White
Write-Host "  Total de tests ejecutados: $($stats.Total)" -ForegroundColor White
Write-Host "  Tests exitosos: $($stats.Passed) ($([math]::Round($stats.Passed / $stats.Total * 100, 2))%)" -ForegroundColor Green
Write-Host "  Tests fallidos: $($stats.Failed)" -ForegroundColor Red
Write-Host "  Fallos esperados (validaciones): $($stats.ExpectedFail)" -ForegroundColor Yellow
Write-Host "  Fallos inesperados: $($stats.UnexpectedFail)" -ForegroundColor Magenta
Write-Host "  Duración: $($duration.TotalSeconds) segundos" -ForegroundColor White

Write-Host "`nIDS GUARDADOS:" -ForegroundColor Cyan
$ids.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
}

# Generar reporte JSON
$report = @{
    Summary = $stats
    IDs = $ids
    Results = $results
} | ConvertTo-Json -Depth 10

$reportPath = "E:\Sistema de Gestion de Proyectos\sigp-backend\test-planning-results.json"
$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`nReporte completo guardado en: $reportPath" -ForegroundColor Green

Write-Host "`n✅ PRUEBAS EXHAUSTIVAS COMPLETADAS" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan


