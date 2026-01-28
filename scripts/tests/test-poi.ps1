# =======================================================================
# SIGP Backend - Pruebas Exhaustivas del MÃ³dulo POI
# =======================================================================
# Este script ejecuta 250 tests exhaustivos del mÃ³dulo POI
# cubriendo CRUD completo, validaciones, casos edge, endpoints anidados
# Flujo: Proyecto -> Subproyectos -> Cronogramas -> Requerimientos -> Documentos -> Actas -> Informes

$ErrorActionPreference = 'Continue'
$baseUrl = "http://localhost:3010/api/v1"

# Tokens (usuarios ya creados en sesiÃ³n anterior)
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJlbWFpbCI6ImFkbWludGVzdDRAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImFkbWludGVzdDQiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTc2NTc1NjEwMCwiZXhwIjoxNzY1ODQyNTAwfQ.rMH6s8s2oPIxZqGHDVx5P7E09e4Pt1PbHX7mtONcaAI"
$pmoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJlbWFpbCI6InBtb3Rlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6InBtb3Rlc3QiLCJyb2wiOiJQTU8iLCJpYXQiOjE3NjU3NTYxMTAsImV4cCI6MTc2NTg0MjUxMH0.MzvWG7WYraESOZEcIpdesgfXtrlSR8JgqKb6P0gxkv4"
$devToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJlbWFpbCI6ImRldnRlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImRldnRlc3QiLCJyb2wiOiJERVNBUlJPTExBRE9SIiwiaWF0IjoxNzY1NzU2MTEwLCJleHAiOjE3NjU4NDI1MTB9.dp10ZHTkX3TAmV8h6xvcVfXhxBlULrKsWCTkQxMN_lQ"

# EstadÃ­sticas
$stats = @{
    Total = 0
    Passed = 0
    Failed = 0
    ExpectedFail = 0
    UnexpectedFail = 0
    StartTime = Get-Date
}

# IDs guardados para POI
$ids = @{
    aeId = $null
    proyectoId = $null
    proyectoId2 = $null
    subproyectoId = $null
    subproyectoId2 = $null
    actividadId = $null
    actividadId2 = $null
    requerimientoId = $null
    requerimientoId2 = $null
    cronogramaId = $null
    tareaId = $null
    tareaId2 = $null
    documentoId = $null
    documentoSubId = $null
    actaReunionId = $null
    actaConstId = $null
    informeSprintId = $null
    informeActividadId = $null
}

# FunciÃ³n helper para tests
function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Token = $null,
        [int]$ExpectedStatus = 200,
        [bool]$ShouldFail = $false,
        [string]$SaveIdAs = $null
    )

    $stats.Total++

    try {
        $headers = @{ "Content-Type" = "application/json" }
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }

        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }

        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }

        try {
            $response = Invoke-RestMethod @params -ErrorAction Stop
            $actualStatus = 200
        }
        catch {
            $actualStatus = $_.Exception.Response.StatusCode.Value__
            $response = $null
        }

        $passed = ($actualStatus -eq $ExpectedStatus)

        if ($ShouldFail) {
            if ($passed) {
                $stats.ExpectedFail++
                Write-Host "[EXPECTED FAIL] $Name" -ForegroundColor Yellow
            } else {
                $stats.UnexpectedFail++
                Write-Host "[UNEXPECTED FAIL] $Name -> Expected $ExpectedStatus but got $actualStatus" -ForegroundColor Red
            }
        }
        else {
            if ($passed) {
                $stats.Passed++
                Write-Host "[PASS] $Name" -ForegroundColor Green

                if ($SaveIdAs -and $response) {
                    if ($response.id) {
                        $ids[$SaveIdAs] = $response.id
                        Write-Host "  -> Saved ID: $SaveIdAs = $($response.id)" -ForegroundColor Cyan
                    }
                    elseif ($response.data.id) {
                        $ids[$SaveIdAs] = $response.data.id
                        Write-Host "  -> Saved ID: $SaveIdAs = $($response.data.id)" -ForegroundColor Cyan
                    }
                }
            }
            else {
                $stats.Failed++
                Write-Host "[FAIL] $Name -> Expected $ExpectedStatus but got $actualStatus" -ForegroundColor Red
            }
        }

        return $response
    }
    catch {
        $stats.Failed++
        Write-Host "[ERROR] $Name -> $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PRUEBAS EXHAUSTIVAS - MÃ“DULO POI" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# =======================================================================
# FASE 0: SETUP INICIAL (5 tests)
# =======================================================================
Write-Host "`n=== FASE 0: SETUP INICIAL ===" -ForegroundColor Magenta

Test-Api -Name "0.1 - Crear AcciÃ³n EstratÃ©gica (prerequisito para POI)" `
    -Method POST -Endpoint "/acciones-estrategicas" `
    -Token $adminToken `
    -Body @{
        codigo = "AE-POI-TEST-001"
        nombre = "AcciÃ³n EstratÃ©gica para Pruebas POI"
        descripcion = "AE creada para vincular Proyectos y Actividades en tests"
        oegdId = 18
        anioInicio = 2024
        anioFin = 2026
        estado = "Vigente"
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "aeId"

Test-Api -Name "0.2 - Verificar AE creada existe" `
    -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "0.3 - Verificar token admin funciona" `
    -Method GET -Endpoint "/acciones-estrategicas" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "0.4 - Verificar token PMO funciona" `
    -Method GET -Endpoint "/acciones-estrategicas" `
    -Token $pmoToken `
    -ExpectedStatus 200

Test-Api -Name "0.5 - Verificar token DEV funciona" `
    -Method GET -Endpoint "/acciones-estrategicas" `
    -Token $devToken `
    -ExpectedStatus 200

# =======================================================================
# FASE 1: PROYECTOS (35 tests)
# =======================================================================
Write-Host "`n=== FASE 1: PROYECTOS (35 tests) ===" -ForegroundColor Magenta

# 1.1 CreaciÃ³n de Proyectos (12 tests)
Write-Host "`n--- 1.1 CreaciÃ³n de Proyectos ---" -ForegroundColor Yellow

Test-Api -Name "1.1.1 - Crear proyecto vÃ¡lido como ADMIN con AE vinculada" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-001"
        nombre = "Proyecto de Prueba 1"
        descripcion = "Proyecto para testing exhaustivo"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        estado = "Pendiente"
        clasificacion = "Al ciudadano"
        accionEstrategicaId = $ids.aeId
        coordinadorId = 13
        scrumMasterId = 14
        patrocinadorId = 13
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "proyectoId"

Test-Api -Name "1.1.2 - Crear segundo proyecto como PMO" `
    -Method POST -Endpoint "/proyectos" `
    -Token $pmoToken `
    -Body @{
        codigo = "PROY-TEST-002"
        nombre = "Proyecto de Prueba 2"
        descripcion = "Segundo proyecto para testing"
        fechaInicio = "2024-02-01"
        fechaFin = "2024-11-30"
        estado = "Pendiente"
        clasificacion = "Gestion interna"
        accionEstrategicaId = $ids.aeId
        coordinadorId = 14
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "proyectoId2"

Test-Api -Name "1.1.3 - Rechazar creaciÃ³n como DESARROLLADOR (403)" `
    -Method POST -Endpoint "/proyectos" `
    -Token $devToken `
    -Body @{
        codigo = "PROY-TEST-003"
        nombre = "Proyecto No Autorizado"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

Test-Api -Name "1.1.4 - Rechazar sin autenticaciÃ³n (401)" `
    -Method POST -Endpoint "/proyectos" `
    -Body @{
        codigo = "PROY-TEST-004"
        nombre = "Proyecto Sin Auth"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 401 `
    -ShouldFail $true

Test-Api -Name "1.1.5 - Rechazar cÃ³digo duplicado (409)" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-001"
        nombre = "Proyecto Duplicado"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 409 `
    -ShouldFail $true

Test-Api -Name "1.1.6 - Rechazar cÃ³digo > 20 caracteres (400)" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-CODIGO-DEMASIADO-LARGO-INVALIDO"
        nombre = "Proyecto CÃ³digo Largo"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "1.1.7 - Rechazar nombre > 200 caracteres (400)" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-005"
        nombre = "A" * 201
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "1.1.8 - Rechazar fechaFin < fechaInicio (400)" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-006"
        nombre = "Proyecto Fechas InvÃ¡lidas"
        fechaInicio = "2024-12-31"
        fechaFin = "2024-01-01"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "1.1.9 - Crear con clasificaciÃ³n 'Al ciudadano'" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-007"
        nombre = "Proyecto Al Ciudadano"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        clasificacion = "Al ciudadano"
    } `
    -ExpectedStatus 201

Test-Api -Name "1.1.10 - Crear con clasificaciÃ³n 'Gestion interna'" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-008"
        nombre = "Proyecto GestiÃ³n Interna"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        clasificacion = "Gestion interna"
    } `
    -ExpectedStatus 201

Test-Api -Name "1.1.11 - Crear con coordinador, scrum master y patrocinador" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-009"
        nombre = "Proyecto Con Roles"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        coordinadorId = 13
        scrumMasterId = 14
        patrocinadorId = 13
    } `
    -ExpectedStatus 201

Test-Api -Name "1.1.12 - Crear sin accionEstrategicaId (nullable)" `
    -Method POST -Endpoint "/proyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "PROY-TEST-010"
        nombre = "Proyecto Sin AE"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 201

# 1.2 Consulta de Proyectos (10 tests)
Write-Host "`n--- 1.2 Consulta de Proyectos ---" -ForegroundColor Yellow

Test-Api -Name "1.2.1 - Listar todos los proyectos" `
    -Method GET -Endpoint "/proyectos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.2 - Filtrar por estado Pendiente" `
    -Method GET -Endpoint "/proyectos?estado=Pendiente" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.3 - Filtrar por coordinadorId" `
    -Method GET -Endpoint "/proyectos?coordinadorId=13" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.4 - Filtrar por accionEstrategicaId" `
    -Method GET -Endpoint "/proyectos?accionEstrategicaId=$($ids.aeId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.5 - Filtrar activos" `
    -Method GET -Endpoint "/proyectos?activo=true" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.6 - Obtener proyecto por ID" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.7 - Obtener proyecto por cÃ³digo" `
    -Method GET -Endpoint "/proyectos/codigo/PROY-TEST-001" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.8 - Rechazar proyecto inexistente (404)" `
    -Method GET -Endpoint "/proyectos/999999" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "1.2.9 - PaginaciÃ³n (limit, offset)" `
    -Method GET -Endpoint "/proyectos?limit=5&offset=0" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.2.10 - Endpoint anidado: GET /acciones-estrategicas/:aeId/proyectos" `
    -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId)/proyectos" `
    -Token $adminToken `
    -ExpectedStatus 200

# 1.3 ActualizaciÃ³n de Proyectos (8 tests)
Write-Host "`n--- 1.3 ActualizaciÃ³n de Proyectos ---" -ForegroundColor Yellow

Test-Api -Name "1.3.1 - Actualizar como ADMIN" `
    -Method PATCH -Endpoint "/proyectos/$($ids.proyectoId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Proyecto de Prueba 1 - Actualizado"
        descripcion = "DescripciÃ³n actualizada"
    } `
    -ExpectedStatus 200

Test-Api -Name "1.3.2 - Actualizar como PMO" `
    -Method PATCH -Endpoint "/proyectos/$($ids.proyectoId2)" `
    -Token $pmoToken `
    -Body @{
        nombre = "Proyecto de Prueba 2 - Actualizado"
    } `
    -ExpectedStatus 200

Test-Api -Name "1.3.3 - Rechazar actualizaciÃ³n como DESARROLLADOR (403)" `
    -Method PATCH -Endpoint "/proyectos/$($ids.proyectoId)" `
    -Token $devToken `
    -Body @{
        nombre = "Intento de actualizaciÃ³n no autorizada"
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

Test-Api -Name "1.3.4 - Actualizar solo nombre" `
    -Method PATCH -Endpoint "/proyectos/$($ids.proyectoId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Proyecto Test 1 - Solo Nombre"
    } `
    -ExpectedStatus 200

Test-Api -Name "1.3.5 - Rechazar accionEstrategicaId inexistente (404/500)" `
    -Method PATCH -Endpoint "/proyectos/$($ids.proyectoId)" `
    -Token $adminToken `
    -Body @{
        accionEstrategicaId = 999999
    } `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "1.3.6 - Cambiar estado a 'En planificacion'" `
    -Method POST -Endpoint "/proyectos/$($ids.proyectoId)/cambiar-estado" `
    -Token $adminToken `
    -Body @{
        nuevoEstado = "En planificacion"
    } `
    -ExpectedStatus 200

Test-Api -Name "1.3.7 - Cambiar estado a 'En desarrollo'" `
    -Method POST -Endpoint "/proyectos/$($ids.proyectoId)/cambiar-estado" `
    -Token $adminToken `
    -Body @{
        nuevoEstado = "En desarrollo"
    } `
    -ExpectedStatus 200

Test-Api -Name "1.3.8 - Verificar cambio de estado" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

# 1.4 EliminaciÃ³n (5 tests)
Write-Host "`n--- 1.4 EliminaciÃ³n de Proyectos ---" -ForegroundColor Yellow

Test-Api -Name "1.4.1 - Soft delete como ADMIN" `
    -Method DELETE -Endpoint "/proyectos/$($ids.proyectoId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.4.2 - Verificar activo=false" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.4.3 - Rechazar eliminaciÃ³n como DESARROLLADOR (403)" `
    -Method DELETE -Endpoint "/proyectos/$($ids.proyectoId)" `
    -Token $devToken `
    -ExpectedStatus 403 `
    -ShouldFail $true

Test-Api -Name "1.4.4 - Verificar proyecto eliminado no aparece en lista activos" `
    -Method GET -Endpoint "/proyectos?activo=true" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "1.4.5 - Proyecto eliminado aÃºn accesible por ID" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

# =======================================================================
# FASE 2: SUBPROYECTOS (25 tests)
# =======================================================================
Write-Host "`n=== FASE 2: SUBPROYECTOS (25 tests) ===" -ForegroundColor Magenta

# 2.1 CreaciÃ³n (10 tests)
Write-Host "`n--- 2.1 CreaciÃ³n de Subproyectos ---" -ForegroundColor Yellow

Test-Api -Name "2.1.1 - Crear subproyecto vÃ¡lido bajo proyectoId" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-001"
        nombre = "Subproyecto 1"
        descripcion = "Primer subproyecto de prueba"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-01-01"
        fechaFin = "2024-06-30"
        estado = "Pendiente"
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "subproyectoId"

Test-Api -Name "2.1.2 - Crear segundo subproyecto" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-002"
        nombre = "Subproyecto 2"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-07-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "subproyectoId2"

Test-Api -Name "2.1.3 - Rechazar sin proyectoPadreId (400)" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-003"
        nombre = "Subproyecto Sin Padre"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "2.1.4 - Rechazar proyectoPadreId inexistente (404/500)" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-004"
        nombre = "Subproyecto Padre Inexistente"
        proyectoPadreId = 999999
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "2.1.5 - Crear como PMO" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $pmoToken `
    -Body @{
        codigo = "SUBPROY-005"
        nombre = "Subproyecto PMO"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 201

Test-Api -Name "2.1.6 - Rechazar como DESARROLLADOR (403)" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $devToken `
    -Body @{
        codigo = "SUBPROY-006"
        nombre = "Subproyecto Dev"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

Test-Api -Name "2.1.7 - Rechazar cÃ³digo duplicado bajo mismo proyecto (409)" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-001"
        nombre = "Subproyecto Duplicado"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 409 `
    -ShouldFail $true

Test-Api -Name "2.1.8 - Crear con monto" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-007"
        nombre = "Subproyecto Con Monto"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        monto = 50000.00
    } `
    -ExpectedStatus 201

Test-Api -Name "2.1.9 - Crear con fechas vÃ¡lidas" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-008"
        nombre = "Subproyecto Fechas"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-03-01"
        fechaFin = "2024-09-30"
    } `
    -ExpectedStatus 201

Test-Api -Name "2.1.10 - Rechazar fechaFin < fechaInicio (400)" `
    -Method POST -Endpoint "/subproyectos" `
    -Token $adminToken `
    -Body @{
        codigo = "SUBPROY-009"
        nombre = "Subproyecto Fechas InvÃ¡lidas"
        proyectoPadreId = $ids.proyectoId
        fechaInicio = "2024-12-31"
        fechaFin = "2024-01-01"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

# 2.2 Consulta (8 tests)
Write-Host "`n--- 2.2 Consulta de Subproyectos ---" -ForegroundColor Yellow

Test-Api -Name "2.2.1 - Listar todos los subproyectos" `
    -Method GET -Endpoint "/subproyectos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.2.2 - Filtrar por proyectoPadreId" `
    -Method GET -Endpoint "/subproyectos?proyectoPadreId=$($ids.proyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.2.3 - Filtrar activos" `
    -Method GET -Endpoint "/subproyectos?activo=true" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.2.4 - Obtener subproyecto por ID" `
    -Method GET -Endpoint "/subproyectos/$($ids.subproyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.2.5 - Rechazar subproyecto inexistente (404)" `
    -Method GET -Endpoint "/subproyectos/999999" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "2.2.6 - Endpoint anidado: GET /proyectos/:proyectoId/subproyectos" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/subproyectos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.2.7 - Verificar mÃºltiples subproyectos en endpoint anidado" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/subproyectos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.2.8 - Rechazar proyecto inexistente en endpoint anidado (404)" `
    -Method GET -Endpoint "/proyectos/999999/subproyectos" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

# 2.3 ActualizaciÃ³n (4 tests)
Write-Host "`n--- 2.3 ActualizaciÃ³n de Subproyectos ---" -ForegroundColor Yellow

Test-Api -Name "2.3.1 - Actualizar como ADMIN" `
    -Method PATCH -Endpoint "/subproyectos/$($ids.subproyectoId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Subproyecto 1 - Actualizado"
        descripcion = "DescripciÃ³n actualizada"
    } `
    -ExpectedStatus 200

Test-Api -Name "2.3.2 - Actualizar estado" `
    -Method PATCH -Endpoint "/subproyectos/$($ids.subproyectoId)" `
    -Token $adminToken `
    -Body @{
        estado = "En desarrollo"
    } `
    -ExpectedStatus 200

Test-Api -Name "2.3.3 - Actualizar monto" `
    -Method PATCH -Endpoint "/subproyectos/$($ids.subproyectoId)" `
    -Token $adminToken `
    -Body @{
        monto = 75000.00
    } `
    -ExpectedStatus 200

Test-Api -Name "2.3.4 - Rechazar actualizaciÃ³n como DESARROLLADOR (403)" `
    -Method PATCH -Endpoint "/subproyectos/$($ids.subproyectoId)" `
    -Token $devToken `
    -Body @{
        nombre = "Intento no autorizado"
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

# 2.4 EliminaciÃ³n (3 tests)
Write-Host "`n--- 2.4 EliminaciÃ³n de Subproyectos ---" -ForegroundColor Yellow

Test-Api -Name "2.4.1 - Soft delete como ADMIN" `
    -Method DELETE -Endpoint "/subproyectos/$($ids.subproyectoId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.4.2 - Verificar activo=false" `
    -Method GET -Endpoint "/subproyectos/$($ids.subproyectoId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "2.4.3 - Rechazar eliminaciÃ³n como DESARROLLADOR (403)" `
    -Method DELETE -Endpoint "/subproyectos/$($ids.subproyectoId)" `
    -Token $devToken `
    -ExpectedStatus 403 `
    -ShouldFail $true

# =======================================================================
# FASE 3: ACTIVIDADES (30 tests)
# =======================================================================
Write-Host "`n=== FASE 3: ACTIVIDADES (30 tests) ===" -ForegroundColor Magenta

# 3.1 CreaciÃ³n (12 tests)
Write-Host "`n--- 3.1 CreaciÃ³n de Actividades ---" -ForegroundColor Yellow

Test-Api -Name "3.1.1 - Crear actividad vÃ¡lida como ADMIN con AE" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-001"
        nombre = "Actividad de Prueba 1"
        descripcion = "Primera actividad para testing"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        estado = "Pendiente"
        clasificacion = "Al ciudadano"
        periodicidadInforme = "Mensual"
        metodoGestion = "Kanban"
        accionEstrategicaId = $ids.aeId
        coordinadorId = 13
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "actividadId"

Test-Api -Name "3.1.2 - Crear segunda actividad como PMO" `
    -Method POST -Endpoint "/actividades" `
    -Token $pmoToken `
    -Body @{
        codigo = "ACT-TEST-002"
        nombre = "Actividad de Prueba 2"
        fechaInicio = "2024-02-01"
        fechaFin = "2024-11-30"
        periodicidadInforme = "Trimestral"
        metodoGestion = "Kanban"
        accionEstrategicaId = $ids.aeId
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "actividadId2"

Test-Api -Name "3.1.3 - Rechazar como DESARROLLADOR (403)" `
    -Method POST -Endpoint "/actividades" `
    -Token $devToken `
    -Body @{
        codigo = "ACT-TEST-003"
        nombre = "Actividad No Autorizada"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

Test-Api -Name "3.1.4 - Rechazar sin auth (401)" `
    -Method POST -Endpoint "/actividades" `
    -Body @{
        codigo = "ACT-TEST-004"
        nombre = "Actividad Sin Auth"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 401 `
    -ShouldFail $true

Test-Api -Name "3.1.5 - Rechazar cÃ³digo duplicado (409)" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-001"
        nombre = "Actividad Duplicada"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 409 `
    -ShouldFail $true

Test-Api -Name "3.1.6 - Crear con periodicidadInforme MENSUAL" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-003"
        nombre = "Actividad Mensual"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        periodicidadInforme = "Mensual"
    } `
    -ExpectedStatus 201

Test-Api -Name "3.1.7 - Crear con periodicidadInforme TRIMESTRAL" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-004"
        nombre = "Actividad Trimestral"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        periodicidadInforme = "Trimestral"
    } `
    -ExpectedStatus 201

Test-Api -Name "3.1.8 - Crear con clasificaciÃ³n 'Al ciudadano'" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-005"
        nombre = "Actividad Al Ciudadano"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        clasificacion = "Al ciudadano"
    } `
    -ExpectedStatus 201

Test-Api -Name "3.1.9 - Crear con metodoGestion Kanban (default)" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-006"
        nombre = "Actividad Kanban"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        metodoGestion = "Kanban"
    } `
    -ExpectedStatus 201

Test-Api -Name "3.1.10 - Rechazar cÃ³digo > 20 chars (400)" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-CODIGO-DEMASIADO-LARGO"
        nombre = "Actividad CÃ³digo Largo"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "3.1.11 - Rechazar nombre > 200 chars (400)" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-007"
        nombre = "A" * 201
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "3.1.12 - Crear sin accionEstrategicaId (nullable)" `
    -Method POST -Endpoint "/actividades" `
    -Token $adminToken `
    -Body @{
        codigo = "ACT-TEST-008"
        nombre = "Actividad Sin AE"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 201

# 3.2 Consulta (10 tests)
Write-Host "`n--- 3.2 Consulta de Actividades ---" -ForegroundColor Yellow

Test-Api -Name "3.2.1 - Listar todas las actividades" `
    -Method GET -Endpoint "/actividades" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.2 - Filtrar por estado Pendiente" `
    -Method GET -Endpoint "/actividades?estado=Pendiente" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.3 - Filtrar por coordinadorId" `
    -Method GET -Endpoint "/actividades?coordinadorId=13" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.4 - Filtrar por accionEstrategicaId" `
    -Method GET -Endpoint "/actividades?accionEstrategicaId=$($ids.aeId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.5 - Filtrar activas" `
    -Method GET -Endpoint "/actividades?activo=true" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.6 - Obtener actividad por ID" `
    -Method GET -Endpoint "/actividades/$($ids.actividadId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.7 - Rechazar actividad inexistente (404)" `
    -Method GET -Endpoint "/actividades/999999" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "3.2.8 - PaginaciÃ³n" `
    -Method GET -Endpoint "/actividades?limit=5&offset=0" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.9 - Endpoint anidado: GET /acciones-estrategicas/:aeId/actividades" `
    -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId)/actividades" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.2.10 - Rechazar AE inexistente en endpoint anidado (404)" `
    -Method GET -Endpoint "/acciones-estrategicas/999999/actividades" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

# 3.3 ActualizaciÃ³n (5 tests)
Write-Host "`n--- 3.3 ActualizaciÃ³n de Actividades ---" -ForegroundColor Yellow

Test-Api -Name "3.3.1 - Actualizar como ADMIN" `
    -Method PATCH -Endpoint "/actividades/$($ids.actividadId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Actividad de Prueba 1 - Actualizada"
        descripcion = "DescripciÃ³n actualizada"
    } `
    -ExpectedStatus 200

Test-Api -Name "3.3.2 - Actualizar como PMO" `
    -Method PATCH -Endpoint "/actividades/$($ids.actividadId2)" `
    -Token $pmoToken `
    -Body @{
        nombre = "Actividad de Prueba 2 - Actualizada"
    } `
    -ExpectedStatus 200

Test-Api -Name "3.3.3 - Actualizar estado a 'En ejecucion'" `
    -Method PATCH -Endpoint "/actividades/$($ids.actividadId)" `
    -Token $adminToken `
    -Body @{
        estado = "En ejecucion"
    } `
    -ExpectedStatus 200

Test-Api -Name "3.3.4 - Actualizar periodicidadInforme" `
    -Method PATCH -Endpoint "/actividades/$($ids.actividadId)" `
    -Token $adminToken `
    -Body @{
        periodicidadInforme = "Trimestral"
    } `
    -ExpectedStatus 200

Test-Api -Name "3.3.5 - Rechazar como DESARROLLADOR (403)" `
    -Method PATCH -Endpoint "/actividades/$($ids.actividadId)" `
    -Token $devToken `
    -Body @{
        nombre = "Intento no autorizado"
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

# 3.4 EliminaciÃ³n (3 tests)
Write-Host "`n--- 3.4 EliminaciÃ³n de Actividades ---" -ForegroundColor Yellow

Test-Api -Name "3.4.1 - Soft delete como ADMIN" `
    -Method DELETE -Endpoint "/actividades/$($ids.actividadId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.4.2 - Verificar activo=false" `
    -Method GET -Endpoint "/actividades/$($ids.actividadId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "3.4.3 - Rechazar como DESARROLLADOR (403)" `
    -Method DELETE -Endpoint "/actividades/$($ids.actividadId)" `
    -Token $devToken `
    -ExpectedStatus 403 `
    -ShouldFail $true

# =======================================================================
# FASE 4: REQUERIMIENTOS (25 tests)
# =======================================================================
Write-Host "`n=== FASE 4: REQUERIMIENTOS (25 tests) ===" -ForegroundColor Magenta

# 4.1 CreaciÃ³n (12 tests)
Write-Host "`n--- 4.1 CreaciÃ³n de Requerimientos ---" -ForegroundColor Yellow

Test-Api -Name "4.1.1 - Crear requerimiento funcional" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-001"
        nombre = "Requerimiento Funcional 1"
        descripcion = "Primer requerimiento funcional"
        tipo = "Funcional"
        prioridad = "Alta"
        estado = "Pendiente"
        proyectoId = $ids.proyectoId
        criteriosAceptacion = @("Criterio 1", "Criterio 2")
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "requerimientoId"

Test-Api -Name "4.1.2 - Crear requerimiento no funcional" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-002"
        nombre = "Requerimiento No Funcional 1"
        tipo = "No funcional"
        prioridad = "Media"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "requerimientoId2"

Test-Api -Name "4.1.3 - Rechazar sin proyectoId (400)" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-003"
        nombre = "Requerimiento Sin Proyecto"
        tipo = "Funcional"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "4.1.4 - Rechazar proyectoId inexistente (404/500)" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-004"
        nombre = "Requerimiento Proyecto Inexistente"
        tipo = "Funcional"
        proyectoId = 999999
    } `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "4.1.5 - Crear con prioridad CRITICA" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-005"
        nombre = "Requerimiento CrÃ­tico"
        tipo = "Funcional"
        prioridad = "Critica"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 201

Test-Api -Name "4.1.6 - Crear con prioridad BAJA" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-006"
        nombre = "Requerimiento Baja Prioridad"
        tipo = "Funcional"
        prioridad = "Baja"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 201

Test-Api -Name "4.1.7 - Crear con criteriosAceptacion array" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-007"
        nombre = "Requerimiento Con Criterios"
        tipo = "Funcional"
        proyectoId = $ids.proyectoId
        criteriosAceptacion = @("Debe validar inputs", "Debe mostrar errores", "Debe guardar cambios")
    } `
    -ExpectedStatus 201

Test-Api -Name "4.1.8 - Crear con dependencias array" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-008"
        nombre = "Requerimiento Con Dependencias"
        tipo = "Funcional"
        proyectoId = $ids.proyectoId
        dependencias = @($ids.requerimientoId)
    } `
    -ExpectedStatus 201

Test-Api -Name "4.1.9 - Crear tipo TECNICO" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-009"
        nombre = "Requerimiento TÃ©cnico"
        tipo = "Tecnico"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 201

Test-Api -Name "4.1.10 - Rechazar como DESARROLLADOR (403)" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $devToken `
    -Body @{
        codigo = "REQ-010"
        nombre = "Requerimiento Dev"
        tipo = "Funcional"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

Test-Api -Name "4.1.11 - Rechazar cÃ³digo > 20 chars (400)" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $adminToken `
    -Body @{
        codigo = "REQ-CODIGO-DEMASIADO-LARGO"
        nombre = "Requerimiento CÃ³digo Largo"
        tipo = "Funcional"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "4.1.12 - Crear como SCRUM_MASTER" `
    -Method POST -Endpoint "/requerimientos" `
    -Token $pmoToken `
    -Body @{
        codigo = "REQ-011"
        nombre = "Requerimiento PMO"
        tipo = "Funcional"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 201

# 4.2 Consulta (6 tests)
Write-Host "`n--- 4.2 Consulta de Requerimientos ---" -ForegroundColor Yellow

Test-Api -Name "4.2.1 - Listar todos los requerimientos" `
    -Method GET -Endpoint "/requerimientos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.2.2 - Filtrar por proyectoId" `
    -Method GET -Endpoint "/requerimientos?proyectoId=$($ids.proyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.2.3 - Filtrar por tipo Funcional" `
    -Method GET -Endpoint "/requerimientos?tipo=Funcional" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.2.4 - Filtrar por prioridad Alta" `
    -Method GET -Endpoint "/requerimientos?prioridad=Alta" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.2.5 - Filtrar por estado Pendiente" `
    -Method GET -Endpoint "/requerimientos?estado=Pendiente" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.2.6 - Endpoint anidado: GET /proyectos/:proyectoId/requerimientos" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/requerimientos" `
    -Token $adminToken `
    -ExpectedStatus 200

# 4.3 ActualizaciÃ³n y AprobaciÃ³n (4 tests)
Write-Host "`n--- 4.3 ActualizaciÃ³n de Requerimientos ---" -ForegroundColor Yellow

Test-Api -Name "4.3.1 - Actualizar como ADMIN" `
    -Method PATCH -Endpoint "/requerimientos/$($ids.requerimientoId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Requerimiento Funcional 1 - Actualizado"
        descripcion = "DescripciÃ³n actualizada"
    } `
    -ExpectedStatus 200

Test-Api -Name "4.3.2 - Actualizar estado a 'En Analisis'" `
    -Method PATCH -Endpoint "/requerimientos/$($ids.requerimientoId)" `
    -Token $adminToken `
    -Body @{
        estado = "En Analisis"
    } `
    -ExpectedStatus 200

Test-Api -Name "4.3.3 - Aprobar requerimiento" `
    -Method POST -Endpoint "/requerimientos/$($ids.requerimientoId)/aprobar" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.3.4 - Verificar estado Aprobado y aprobadoPor" `
    -Method GET -Endpoint "/requerimientos/$($ids.requerimientoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

# 4.4 EliminaciÃ³n (3 tests)
Write-Host "`n--- 4.4 EliminaciÃ³n de Requerimientos ---" -ForegroundColor Yellow

Test-Api -Name "4.4.1 - Eliminar como ADMIN" `
    -Method DELETE -Endpoint "/requerimientos/$($ids.requerimientoId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.4.2 - Verificar activo=false" `
    -Method GET -Endpoint "/requerimientos/$($ids.requerimientoId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "4.4.3 - Rechazar como DESARROLLADOR (403)" `
    -Method DELETE -Endpoint "/requerimientos/$($ids.requerimientoId)" `
    -Token $devToken `
    -ExpectedStatus 403 `
    -ShouldFail $true

# =======================================================================
# FASE 5: CRONOGRAMAS Y TAREAS (30 tests)
# =======================================================================
Write-Host "`n=== FASE 5: CRONOGRAMAS Y TAREAS (30 tests) ===" -ForegroundColor Magenta

# 5.1 Cronogramas (15 tests)
Write-Host "`n--- 5.1 Cronogramas ---" -ForegroundColor Yellow

Test-Api -Name "5.1.1 - Crear cronograma como ADMIN" `
    -Method POST -Endpoint "/cronogramas" `
    -Token $adminToken `
    -Body @{
        nombre = "Cronograma Principal"
        descripcion = "Cronograma de prueba"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        estado = "Borrador"
        version = 1
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "cronogramaId"

Test-Api -Name "5.1.2 - Rechazar sin proyectoId (400)" `
    -Method POST -Endpoint "/cronogramas" `
    -Token $adminToken `
    -Body @{
        nombre = "Cronograma Sin Proyecto"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "5.1.3 - Rechazar fechaFin < fechaInicio (400)" `
    -Method POST -Endpoint "/cronogramas" `
    -Token $adminToken `
    -Body @{
        nombre = "Cronograma Fechas InvÃ¡lidas"
        proyectoId = $ids.proyectoId
        fechaInicio = "2024-12-31"
        fechaFin = "2024-01-01"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "5.1.4 - Crear con estado BORRADOR" `
    -Method POST -Endpoint "/cronogramas" `
    -Token $adminToken `
    -Body @{
        nombre = "Cronograma Borrador"
        proyectoId = $ids.proyectoId
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        estado = "Borrador"
    } `
    -ExpectedStatus 201

Test-Api -Name "5.1.5 - Listar cronogramas" `
    -Method GET -Endpoint "/cronogramas" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.1.6 - Filtrar por proyectoId" `
    -Method GET -Endpoint "/cronogramas?proyectoId=$($ids.proyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.1.7 - Filtrar por estado Vigente" `
    -Method GET -Endpoint "/cronogramas?estado=Vigente" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.1.8 - Endpoint anidado: GET /proyectos/:proyectoId/cronogramas" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/cronogramas" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.1.9 - Actualizar cronograma" `
    -Method PATCH -Endpoint "/cronogramas/$($ids.cronogramaId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Cronograma Principal - Actualizado"
    } `
    -ExpectedStatus 200

Test-Api -Name "5.1.10 - Cambiar estado a VIGENTE" `
    -Method POST -Endpoint "/cronogramas/$($ids.cronogramaId)/estado" `
    -Token $adminToken `
    -Body @{
        nuevoEstado = "Vigente"
    } `
    -ExpectedStatus 200

Test-Api -Name "5.1.11 - Cambiar estado a DESACTUALIZADO" `
    -Method POST -Endpoint "/cronogramas/$($ids.cronogramaId)/estado" `
    -Token $adminToken `
    -Body @{
        nuevoEstado = "Desactualizado"
    } `
    -ExpectedStatus 200

Test-Api -Name "5.1.12 - Obtener cronograma por ID" `
    -Method GET -Endpoint "/cronogramas/$($ids.cronogramaId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.1.13 - Rechazar cronograma inexistente (404)" `
    -Method GET -Endpoint "/cronogramas/999999" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "5.1.14 - Eliminar cronograma" `
    -Method DELETE -Endpoint "/cronogramas/$($ids.cronogramaId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.1.15 - Crear nuevo cronograma para tareas" `
    -Method POST -Endpoint "/cronogramas" `
    -Token $adminToken `
    -Body @{
        nombre = "Cronograma Para Tareas"
        proyectoId = $ids.proyectoId
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
        version = 2
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "cronogramaId"

# 5.2 Tareas de Cronograma (15 tests)
Write-Host "`n--- 5.2 Tareas de Cronograma ---" -ForegroundColor Yellow

Test-Api -Name "5.2.1 - Crear tarea en cronograma" `
    -Method POST -Endpoint "/tareas-cronograma" `
    -Token $adminToken `
    -Body @{
        nombre = "Tarea Principal 1"
        descripcion = "Primera tarea del cronograma"
        cronogramaId = $ids.cronogramaId
        fechaInicio = "2024-01-15"
        fechaFin = "2024-02-15"
        duracionEstimada = 30
        estado = "Pendiente"
        porcentajeAvance = 0
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "tareaId"

Test-Api -Name "5.2.2 - Crear segunda tarea" `
    -Method POST -Endpoint "/tareas-cronograma" `
    -Token $adminToken `
    -Body @{
        nombre = "Tarea Principal 2"
        cronogramaId = $ids.cronogramaId
        fechaInicio = "2024-02-16"
        fechaFin = "2024-03-16"
        duracionEstimada = 30
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "tareaId2"

Test-Api -Name "5.2.3 - Crear sub-tarea (tareaPadreId)" `
    -Method POST -Endpoint "/tareas-cronograma" `
    -Token $adminToken `
    -Body @{
        nombre = "Sub-tarea 1.1"
        cronogramaId = $ids.cronogramaId
        tareaPadreId = $ids.tareaId
        fechaInicio = "2024-01-15"
        fechaFin = "2024-01-25"
        duracionEstimada = 10
    } `
    -ExpectedStatus 201

Test-Api -Name "5.2.4 - Rechazar sin cronogramaId (400)" `
    -Method POST -Endpoint "/tareas-cronograma" `
    -Token $adminToken `
    -Body @{
        nombre = "Tarea Sin Cronograma"
        fechaInicio = "2024-01-01"
        fechaFin = "2024-12-31"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "5.2.5 - Crear con dependencias array" `
    -Method POST -Endpoint "/tareas-cronograma" `
    -Token $adminToken `
    -Body @{
        nombre = "Tarea Con Dependencias"
        cronogramaId = $ids.cronogramaId
        fechaInicio = "2024-03-17"
        fechaFin = "2024-04-17"
        dependencias = @($ids.tareaId, $ids.tareaId2)
    } `
    -ExpectedStatus 201

Test-Api -Name "5.2.6 - Crear con responsableId" `
    -Method POST -Endpoint "/tareas-cronograma" `
    -Token $adminToken `
    -Body @{
        nombre = "Tarea Con Responsable"
        cronogramaId = $ids.cronogramaId
        fechaInicio = "2024-04-01"
        fechaFin = "2024-04-30"
        responsableId = 13
    } `
    -ExpectedStatus 201

Test-Api -Name "5.2.7 - Crear con prioridad ALTA" `
    -Method POST -Endpoint "/tareas-cronograma" `
    -Token $adminToken `
    -Body @{
        nombre = "Tarea Prioridad Alta"
        cronogramaId = $ids.cronogramaId
        fechaInicio = "2024-05-01"
        fechaFin = "2024-05-15"
        prioridad = "Alta"
    } `
    -ExpectedStatus 201

Test-Api -Name "5.2.8 - Obtener tarea por ID" `
    -Method GET -Endpoint "/tareas-cronograma/$($ids.tareaId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.2.9 - Endpoint anidado: GET /cronogramas/:cronogramaId/tareas" `
    -Method GET -Endpoint "/cronogramas/$($ids.cronogramaId)/tareas" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.2.10 - Verificar mÃºltiples tareas" `
    -Method GET -Endpoint "/cronogramas/$($ids.cronogramaId)/tareas" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "5.2.11 - Actualizar tarea" `
    -Method PATCH -Endpoint "/tareas-cronograma/$($ids.tareaId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Tarea Principal 1 - Actualizada"
        porcentajeAvance = 50
    } `
    -ExpectedStatus 200

Test-Api -Name "5.2.12 - Cambiar estado a 'En Progreso'" `
    -Method PATCH -Endpoint "/tareas-cronograma/$($ids.tareaId)" `
    -Token $adminToken `
    -Body @{
        estado = "En Progreso"
    } `
    -ExpectedStatus 200

Test-Api -Name "5.2.13 - Actualizar fechas reales" `
    -Method PATCH -Endpoint "/tareas-cronograma/$($ids.tareaId)" `
    -Token $adminToken `
    -Body @{
        fechaInicioReal = "2024-01-15"
        fechaFinReal = "2024-02-10"
    } `
    -ExpectedStatus 200

Test-Api -Name "5.2.14 - Rechazar porcentajeAvance > 100 (400)" `
    -Method PATCH -Endpoint "/tareas-cronograma/$($ids.tareaId)" `
    -Token $adminToken `
    -Body @{
        porcentajeAvance = 150
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "5.2.15 - Eliminar tarea" `
    -Method DELETE -Endpoint "/tareas-cronograma/$($ids.tareaId2)" `
    -Token $adminToken `
    -ExpectedStatus 200

# =======================================================================
# FASE 6: DOCUMENTOS (20 tests simplificados)
# =======================================================================
Write-Host "`n=== FASE 6: DOCUMENTOS (20 tests) ===" -ForegroundColor Magenta

# 6.1 Documentos de Proyecto (10 tests)
Write-Host "`n--- 6.1 Documentos de Proyecto ---" -ForegroundColor Yellow

Test-Api -Name "6.1.1 - Crear documento de PROYECTO" `
    -Method POST -Endpoint "/documentos" `
    -Token $adminToken `
    -Body @{
        nombre = "Acta de ConstituciÃ³n"
        tipoContenedor = "PROYECTO"
        proyectoId = $ids.proyectoId
        fase = "Analisis y Planificacion"
        estado = "Pendiente"
        esObligatorio = $true
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "documentoId"

Test-Api -Name "6.1.2 - Rechazar sin tipoContenedor (400)" `
    -Method POST -Endpoint "/documentos" `
    -Token $adminToken `
    -Body @{
        nombre = "Documento Sin Tipo"
        proyectoId = $ids.proyectoId
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "6.1.3 - Rechazar PROYECTO sin proyectoId (400)" `
    -Method POST -Endpoint "/documentos" `
    -Token $adminToken `
    -Body @{
        nombre = "Documento Sin ProyectoId"
        tipoContenedor = "PROYECTO"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "6.1.4 - Crear fase 'Diseno'" `
    -Method POST -Endpoint "/documentos" `
    -Token $adminToken `
    -Body @{
        nombre = "Documento de DiseÃ±o"
        tipoContenedor = "PROYECTO"
        proyectoId = $ids.proyectoId
        fase = "Diseno"
    } `
    -ExpectedStatus 201

Test-Api -Name "6.1.5 - Crear fase 'Desarrollo'" `
    -Method POST -Endpoint "/documentos" `
    -Token $adminToken `
    -Body @{
        nombre = "Manual de Desarrollo"
        tipoContenedor = "PROYECTO"
        proyectoId = $ids.proyectoId
        fase = "Desarrollo"
        archivoUrl = "https://storage.example.com/manual.pdf"
    } `
    -ExpectedStatus 201

Test-Api -Name "6.1.6 - Listar documentos" `
    -Method GET -Endpoint "/documentos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.1.7 - Filtrar por proyectoId" `
    -Method GET -Endpoint "/documentos?proyectoId=$($ids.proyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.1.8 - Filtrar por fase" `
    -Method GET -Endpoint "/documentos?fase=Desarrollo" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.1.9 - Endpoint anidado: GET /proyectos/:proyectoId/documentos" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/documentos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.1.10 - Aprobar documento" `
    -Method POST -Endpoint "/documentos/$($ids.documentoId)/aprobar" `
    -Token $adminToken `
    -ExpectedStatus 200

# 6.2 Documentos de Subproyecto (10 tests)
Write-Host "`n--- 6.2 Documentos de Subproyecto ---" -ForegroundColor Yellow

Test-Api -Name "6.2.1 - Crear documento de SUBPROYECTO" `
    -Method POST -Endpoint "/documentos" `
    -Token $adminToken `
    -Body @{
        nombre = "Documento Subproyecto"
        tipoContenedor = "SUBPROYECTO"
        subproyectoId = $ids.subproyectoId
        fase = "Analisis y Planificacion"
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "documentoSubId"

Test-Api -Name "6.2.2 - Rechazar SUBPROYECTO sin subproyectoId (400)" `
    -Method POST -Endpoint "/documentos" `
    -Token $adminToken `
    -Body @{
        nombre = "Documento Sin SubproyectoId"
        tipoContenedor = "SUBPROYECTO"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "6.2.3 - Filtrar por subproyectoId" `
    -Method GET -Endpoint "/documentos?subproyectoId=$($ids.subproyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.2.4 - Endpoint anidado: GET /subproyectos/:subproyectoId/documentos" `
    -Method GET -Endpoint "/subproyectos/$($ids.subproyectoId)/documentos" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.2.5 - Actualizar documento" `
    -Method PATCH -Endpoint "/documentos/$($ids.documentoSubId)" `
    -Token $adminToken `
    -Body @{
        nombre = "Documento Subproyecto - Actualizado"
    } `
    -ExpectedStatus 200

Test-Api -Name "6.2.6 - Aprobar y verificar aprobadoPor" `
    -Method POST -Endpoint "/documentos/$($ids.documentoSubId)/aprobar" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.2.7 - Eliminar documento" `
    -Method DELETE -Endpoint "/documentos/$($ids.documentoSubId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.2.8 - Rechazar eliminaciÃ³n como DESARROLLADOR (403)" `
    -Method DELETE -Endpoint "/documentos/$($ids.documentoId)" `
    -Token $devToken `
    -ExpectedStatus 403 `
    -ShouldFail $true

Test-Api -Name "6.2.9 - Filtrar activos" `
    -Method GET -Endpoint "/documentos?activo=true" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "6.2.10 - Rechazar documento inexistente (404)" `
    -Method GET -Endpoint "/documentos/999999" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

# =======================================================================
# FASE 7: ACTAS (15 tests simplificados)
# =======================================================================
Write-Host "`n=== FASE 7: ACTAS (15 tests) ===" -ForegroundColor Magenta

# 7.1 Actas de ReuniÃ³n (10 tests)
Write-Host "`n--- 7.1 Actas de ReuniÃ³n ---" -ForegroundColor Yellow

Test-Api -Name "7.1.1 - Crear acta de reuniÃ³n INICIAL" `
    -Method POST -Endpoint "/actas/reunion" `
    -Token $adminToken `
    -Body @{
        proyectoId = $ids.proyectoId
        tipoReunion = "Inicial"
        fecha = "2024-01-10"
        horaInicio = "09:00"
        horaFin = "11:00"
        lugar = "Sala de Reuniones A"
        asistentes = @(13, 14)
        agenda = @("PresentaciÃ³n del proyecto", "Roles y responsabilidades")
        acuerdos = @("Iniciar fase de planificaciÃ³n")
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "actaReunionId"

Test-Api -Name "7.1.2 - Crear acta tipo SEGUIMIENTO" `
    -Method POST -Endpoint "/actas/reunion" `
    -Token $adminToken `
    -Body @{
        proyectoId = $ids.proyectoId
        tipoReunion = "Seguimiento"
        fecha = "2024-02-10"
        horaInicio = "10:00"
        horaFin = "11:00"
        asistentes = @(13)
    } `
    -ExpectedStatus 201

Test-Api -Name "7.1.3 - Crear acta tipo CIERRE" `
    -Method POST -Endpoint "/actas/reunion" `
    -Token $adminToken `
    -Body @{
        proyectoId = $ids.proyectoId
        tipoReunion = "Cierre"
        fecha = "2024-12-20"
        horaInicio = "15:00"
        horaFin = "17:00"
        asistentes = @(13, 14)
    } `
    -ExpectedStatus 201

Test-Api -Name "7.1.4 - Rechazar sin proyectoId (400)" `
    -Method POST -Endpoint "/actas/reunion" `
    -Token $adminToken `
    -Body @{
        tipoReunion = "Inicial"
        fecha = "2024-01-10"
    } `
    -ExpectedStatus 400 `
    -ShouldFail $true

Test-Api -Name "7.1.5 - Crear con ausentes array" `
    -Method POST -Endpoint "/actas/reunion" `
    -Token $adminToken `
    -Body @{
        proyectoId = $ids.proyectoId
        tipoReunion = "Seguimiento"
        fecha = "2024-03-10"
        asistentes = @(13)
        ausentes = @(15)
    } `
    -ExpectedStatus 201

Test-Api -Name "7.1.6 - Listar actas" `
    -Method GET -Endpoint "/actas?tipo=Acta de Reunion" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "7.1.7 - Filtrar por proyectoId" `
    -Method GET -Endpoint "/actas?proyectoId=$($ids.proyectoId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "7.1.8 - Endpoint anidado: GET /proyectos/:proyectoId/actas" `
    -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/actas" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "7.1.9 - Aprobar acta como PMO" `
    -Method POST -Endpoint "/actas/$($ids.actaReunionId)/aprobar" `
    -Token $pmoToken `
    -ExpectedStatus 200

Test-Api -Name "7.1.10 - Rechazar creaciÃ³n como DESARROLLADOR (403)" `
    -Method POST -Endpoint "/actas/reunion" `
    -Token $devToken `
    -Body @{
        proyectoId = $ids.proyectoId
        tipoReunion = "Inicial"
        fecha = "2024-01-10"
    } `
    -ExpectedStatus 403 `
    -ShouldFail $true

# 7.2 Actas de ConstituciÃ³n (5 tests)
Write-Host "`n--- 7.2 Actas de ConstituciÃ³n ---" -ForegroundColor Yellow

Test-Api -Name "7.2.1 - Crear acta de constituciÃ³n" `
    -Method POST -Endpoint "/actas/constitucion" `
    -Token $adminToken `
    -Body @{
        proyectoId = $ids.proyectoId
        fecha = "2024-01-05"
        objetivoSmart = "Desarrollar sistema en 12 meses"
        alcance = "MÃ³dulos de gestiÃ³n completos"
        entregables = @("Sistema funcional", "DocumentaciÃ³n")
        riesgos = @("Falta de recursos", "Cambios de alcance")
        presupuestoEstimado = 100000
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "actaConstId"

Test-Api -Name "7.2.2 - Obtener acta por ID" `
    -Method GET -Endpoint "/actas/$($ids.actaConstId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "7.2.3 - Filtrar por estado Aprobado" `
    -Method GET -Endpoint "/actas?estado=Aprobado" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "7.2.4 - Eliminar acta" `
    -Method DELETE -Endpoint "/actas/$($ids.actaConstId)" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "7.2.5 - Rechazar eliminaciÃ³n como DESARROLLADOR (403)" `
    -Method DELETE -Endpoint "/actas/$($ids.actaReunionId)" `
    -Token $devToken `
    -ExpectedStatus 403 `
    -ShouldFail $true

# =======================================================================
# RESUMEN FINAL
# =======================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE PRUEBAS - MÃ“DULO POI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$stats.EndTime = Get-Date
$duration = ($stats.EndTime - $stats.StartTime).TotalSeconds

Write-Host "`nEstadÃ­sticas:" -ForegroundColor White
Write-Host "  Total de pruebas:    $($stats.Total)" -ForegroundColor White
Write-Host "  Pasadas:             $($stats.Passed)" -ForegroundColor Green
Write-Host "  Fallidas:            $($stats.Failed)" -ForegroundColor Red
Write-Host "  Fallos esperados:    $($stats.ExpectedFail)" -ForegroundColor Yellow
Write-Host "  Fallos inesperados:  $($stats.UnexpectedFail)" -ForegroundColor Magenta
Write-Host "  DuraciÃ³n:            $([math]::Round($duration, 2)) segundos" -ForegroundColor White

$successRate = if ($stats.Total -gt 0) { [math]::Round(($stats.Passed / $stats.Total) * 100, 2) } else { 0 }
Write-Host "`n  Tasa de Ã©xito: $successRate%" -ForegroundColor Cyan

Write-Host "`nIDs Guardados:" -ForegroundColor White
Write-Host "  pgdId:          $($ids.pgdId)" -ForegroundColor Gray
Write-Host "  pgdIdPmo:       $($ids.pgdIdPmo)" -ForegroundColor Gray

# Guardar resultados
$results = @{
    Summary = @{
        Total = $stats.Total
        Passed = $stats.Passed
        Failed = $stats.Failed
        ExpectedFail = $stats.ExpectedFail
        UnexpectedFail = $stats.UnexpectedFail
        StartTime = $stats.StartTime
        EndTime = $stats.EndTime
        Duration = "$([math]::Round($duration, 2))s"
        SuccessRate = "$successRate%"
    }
    IDs = $ids
}

$results | ConvertTo-Json -Depth 10 | Out-File "test-poi-results.json" -Encoding UTF8
Write-Host "`nResultados guardados en: test-poi-results.json" -ForegroundColor Cyan

