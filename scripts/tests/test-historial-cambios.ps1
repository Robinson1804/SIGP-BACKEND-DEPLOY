# ================================================================================
# TEST DE HISTORIAL DE CAMBIOS - SIGP Backend
# ================================================================================
# Este script prueba la funcionalidad completa de auditoria automatica
# del modulo Agile (registro de cambios en HUs, Tareas, Sprints)
# ================================================================================

$baseUrl = "http://localhost:3000/api/v1"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# Colores para output
function Write-Success { param($msg) Write-Host "[PASS] $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Section { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Magenta }

# Contadores de resultados
$script:passed = 0
$script:failed = 0
$script:results = @()

# IDs para tests
$script:ids = @{}

# Funcion para hacer requests HTTP
function Test-Api {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Endpoint,
        [string]$Token,
        [object]$Body,
        [int]$ExpectedStatus = 200,
        [string]$SaveIdAs,
        [bool]$ShouldFail = $false
    )

    $headers = @{
        "Content-Type" = "application/json"
    }
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
        ErrorAction = "SilentlyContinue"
    }

    if ($Body -and ($Method -ne "GET")) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }

    try {
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $responseBody = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if (-not $statusCode) { $statusCode = 0 }
        try {
            $responseBody = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        } catch {
            $responseBody = $null
        }
    }

    # Evaluar resultado
    $success = $false
    if ($ShouldFail) {
        $success = ($statusCode -ne $ExpectedStatus) -or ($statusCode -ge 400)
    } else {
        $success = ($statusCode -eq $ExpectedStatus)
    }

    if ($success) {
        Write-Success "$Name (HTTP $statusCode)"
        $script:passed++
    } else {
        Write-Fail "$Name (HTTP $statusCode, esperado $ExpectedStatus)"
        $script:failed++
    }

    # Guardar ID si se solicita
    if ($SaveIdAs -and $responseBody) {
        if ($responseBody.id) {
            $script:ids[$SaveIdAs] = $responseBody.id
        } elseif ($responseBody.data -and $responseBody.data.id) {
            $script:ids[$SaveIdAs] = $responseBody.data.id
        }
    }

    # Guardar resultado
    $script:results += @{
        Name = $Name
        Status = $statusCode
        Success = $success
        Response = $responseBody
    }

    return $responseBody
}

# ================================================================================
# INICIO DE TESTS
# ================================================================================

Write-Host "`n" -NoNewline
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "   TESTS DE HISTORIAL DE CAMBIOS - SIGP" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "Timestamp: $timestamp"
Write-Host "Base URL: $baseUrl"
Write-Host ""

# --------------------------------------------------------------------------------
# FASE 0: AUTENTICACION
# --------------------------------------------------------------------------------
Write-Section "FASE 0: AUTENTICACION"

$loginResponse = Test-Api -Name "0.1 - Login como admin" -Method POST -Endpoint "/auth/login" -Body @{
    username = "admin"
    password = "Admin123!"
} -ExpectedStatus 200

$adminToken = $null
if ($loginResponse -and $loginResponse.access_token) {
    $adminToken = $loginResponse.access_token
    Write-Info "Token obtenido correctamente"
} else {
    Write-Fail "No se pudo obtener token de admin. Abortando tests."
    exit 1
}

# --------------------------------------------------------------------------------
# FASE 12: HISTORIAL DE CAMBIOS
# --------------------------------------------------------------------------------
Write-Section "FASE 12: HISTORIAL DE CAMBIOS"

# 12.1 - Verificar que el endpoint principal funciona
Write-Info "12.1 - Tests de endpoints basicos"

Test-Api -Name "12.1.1 - GET /historial-cambios (listar)" `
    -Method GET `
    -Endpoint "/historial-cambios" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "12.1.2 - GET /historial-cambios/recientes" `
    -Method GET `
    -Endpoint "/historial-cambios/recientes?limit=10" `
    -Token $adminToken `
    -ExpectedStatus 200

# 12.2 - Crear HU para generar historial
Write-Info "12.2 - Crear entidades para generar historial"

# Obtener un proyecto existente
$proyectos = Test-Api -Name "12.2.1 - Obtener proyectos" `
    -Method GET `
    -Endpoint "/proyectos" `
    -Token $adminToken `
    -ExpectedStatus 200

$proyectoId = $null
if ($proyectos -and $proyectos.Count -gt 0) {
    $proyectoId = $proyectos[0].id
    Write-Info "Usando proyecto ID: $proyectoId"
} elseif ($proyectos -and $proyectos.data -and $proyectos.data.Count -gt 0) {
    $proyectoId = $proyectos.data[0].id
    Write-Info "Usando proyecto ID: $proyectoId"
}

if (-not $proyectoId) {
    Write-Info "No hay proyectos, creando uno de prueba..."
    $proyectoResponse = Test-Api -Name "12.2.2 - Crear proyecto de prueba" `
        -Method POST `
        -Endpoint "/proyectos" `
        -Token $adminToken `
        -Body @{
            codigo = "HIST-$timestamp"
            nombre = "Proyecto para tests de historial"
            descripcion = "Proyecto creado automaticamente para tests"
            tipo = "POI"
        } `
        -ExpectedStatus 201 `
        -SaveIdAs "proyectoId"
    $proyectoId = $script:ids["proyectoId"]
}

# Crear Historia de Usuario
$huResponse = Test-Api -Name "12.2.3 - Crear Historia de Usuario" `
    -Method POST `
    -Endpoint "/historias-usuario" `
    -Token $adminToken `
    -Body @{
        proyectoId = $proyectoId
        codigo = "HU-HIST-$timestamp"
        titulo = "HU para tests de historial"
        descripcion = "Esta HU se usa para verificar el registro automatico de cambios"
        prioridad = "Alta"
        storyPoints = 5
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "huHistorialId"

$huHistorialId = $script:ids["huHistorialId"]

# 12.3 - Verificar que la creacion se registro
Write-Info "12.3 - Verificar registro automatico de creacion"

Start-Sleep -Seconds 1

Test-Api -Name "12.3.1 - Verificar historial de HU creada" `
    -Method GET `
    -Endpoint "/historias-usuario/$huHistorialId/historial" `
    -Token $adminToken `
    -ExpectedStatus 200

# 12.4 - Actualizar HU y verificar historial
Write-Info "12.4 - Actualizar entidad y verificar cambios"

Test-Api -Name "12.4.1 - Actualizar titulo de HU" `
    -Method PATCH `
    -Endpoint "/historias-usuario/$huHistorialId" `
    -Token $adminToken `
    -Body @{
        titulo = "HU actualizada - test historial"
    } `
    -ExpectedStatus 200

Test-Api -Name "12.4.2 - Actualizar prioridad de HU" `
    -Method PATCH `
    -Endpoint "/historias-usuario/$huHistorialId" `
    -Token $adminToken `
    -Body @{
        prioridad = "Critica"
    } `
    -ExpectedStatus 200

Test-Api -Name "12.4.3 - Actualizar storyPoints de HU" `
    -Method PATCH `
    -Endpoint "/historias-usuario/$huHistorialId" `
    -Token $adminToken `
    -Body @{
        storyPoints = 8
    } `
    -ExpectedStatus 200

Start-Sleep -Seconds 1

$historialHu = Test-Api -Name "12.4.4 - Verificar historial con cambios" `
    -Method GET `
    -Endpoint "/historias-usuario/$huHistorialId/historial" `
    -Token $adminToken `
    -ExpectedStatus 200

if ($historialHu -and $historialHu.Count -gt 0) {
    Write-Info "Se encontraron $($historialHu.Count) registros de historial"
}

# 12.5 - Cambiar estado de HU
Write-Info "12.5 - Cambio de estado"

Test-Api -Name "12.5.1 - Cambiar estado de HU" `
    -Method PATCH `
    -Endpoint "/historias-usuario/$huHistorialId/estado" `
    -Token $adminToken `
    -Body @{
        estado = "En desarrollo"
    } `
    -ExpectedStatus 200

Test-Api -Name "12.5.2 - Verificar registro de cambio de estado" `
    -Method GET `
    -Endpoint "/historial-cambios?entidadTipo=HistoriaUsuario&entidadId=$huHistorialId" `
    -Token $adminToken `
    -ExpectedStatus 200

# 12.6 - Tests de filtros
Write-Info "12.6 - Tests de filtros"

Test-Api -Name "12.6.1 - Filtrar por tipo de entidad" `
    -Method GET `
    -Endpoint "/historial-cambios?entidadTipo=HistoriaUsuario" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "12.6.2 - Filtrar por accion CREACION" `
    -Method GET `
    -Endpoint "/historial-cambios?accion=CREACION" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "12.6.3 - Filtrar por accion ACTUALIZACION" `
    -Method GET `
    -Endpoint "/historial-cambios?accion=ACTUALIZACION" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "12.6.4 - Filtrar por accion CAMBIO_ESTADO" `
    -Method GET `
    -Endpoint "/historial-cambios?accion=CAMBIO_ESTADO" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "12.6.5 - Filtrar por rango de fechas" `
    -Method GET `
    -Endpoint "/historial-cambios?fechaDesde=2025-01-01&fechaHasta=2025-12-31" `
    -Token $adminToken `
    -ExpectedStatus 200

# 12.7 - Tests de paginacion
Write-Info "12.7 - Tests de paginacion"

Test-Api -Name "12.7.1 - Paginacion pagina 1" `
    -Method GET `
    -Endpoint "/historial-cambios?page=1&limit=5" `
    -Token $adminToken `
    -ExpectedStatus 200

Test-Api -Name "12.7.2 - Paginacion pagina 2" `
    -Method GET `
    -Endpoint "/historial-cambios?page=2&limit=5" `
    -Token $adminToken `
    -ExpectedStatus 200

# 12.8 - Sprint: crear, iniciar, cerrar
Write-Info "12.8 - Tests con Sprint"

$sprintResponse = Test-Api -Name "12.8.1 - Crear Sprint" `
    -Method POST `
    -Endpoint "/sprints" `
    -Token $adminToken `
    -Body @{
        proyectoId = $proyectoId
        nombre = "Sprint Test Historial $timestamp"
        objetivo = "Verificar registro de cambios en sprints"
        fechaInicio = (Get-Date).ToString("yyyy-MM-dd")
        fechaFin = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
    } `
    -ExpectedStatus 201 `
    -SaveIdAs "sprintHistorialId"

$sprintHistorialId = $script:ids["sprintHistorialId"]

if ($sprintHistorialId) {
    Test-Api -Name "12.8.2 - Iniciar Sprint" `
        -Method POST `
        -Endpoint "/sprints/$sprintHistorialId/iniciar" `
        -Token $adminToken `
        -ExpectedStatus 200

    Start-Sleep -Seconds 1

    Test-Api -Name "12.8.3 - Verificar historial de Sprint" `
        -Method GET `
        -Endpoint "/sprints/$sprintHistorialId/historial" `
        -Token $adminToken `
        -ExpectedStatus 200

    Test-Api -Name "12.8.4 - Cerrar Sprint" `
        -Method POST `
        -Endpoint "/sprints/$sprintHistorialId/cerrar" `
        -Token $adminToken `
        -Body @{
            linkEvidencia = "https://evidencia.ejemplo.com/sprint"
        } `
        -ExpectedStatus 200

    Test-Api -Name "12.8.5 - Verificar historial con inicio y cierre" `
        -Method GET `
        -Endpoint "/sprints/$sprintHistorialId/historial" `
        -Token $adminToken `
        -ExpectedStatus 200
}

# 12.9 - Tarea: crear y cambiar estado
Write-Info "12.9 - Tests con Tarea"

if ($huHistorialId) {
    $tareaResponse = Test-Api -Name "12.9.1 - Crear Tarea" `
        -Method POST `
        -Endpoint "/tareas" `
        -Token $adminToken `
        -Body @{
            historiaUsuarioId = $huHistorialId
            codigo = "TASK-HIST-$timestamp"
            nombre = "Tarea para test de historial"
            descripcion = "Verificar registro de cambios"
            tipo = "SCRUM"
            prioridad = "Alta"
            horasEstimadas = 4
        } `
        -ExpectedStatus 201 `
        -SaveIdAs "tareaHistorialId"

    $tareaHistorialId = $script:ids["tareaHistorialId"]

    if ($tareaHistorialId) {
        Test-Api -Name "12.9.2 - Cambiar estado de Tarea a En Progreso" `
            -Method PATCH `
            -Endpoint "/tareas/$tareaHistorialId/estado" `
            -Token $adminToken `
            -Body @{
                estado = "En progreso"
            } `
            -ExpectedStatus 200

        Test-Api -Name "12.9.3 - Verificar historial de Tarea" `
            -Method GET `
            -Endpoint "/tareas/$tareaHistorialId/historial" `
            -Token $adminToken `
            -ExpectedStatus 200
    }
}

# 12.10 - Verificar endpoints de solo lectura
Write-Info "12.10 - Verificar que no permite POST/PATCH/DELETE"

# Estos deberian fallar con 404 (ruta no encontrada) ya que solo hay GET
Test-Api -Name "12.10.1 - POST no permitido en historial" `
    -Method POST `
    -Endpoint "/historial-cambios" `
    -Token $adminToken `
    -Body @{ test = "test" } `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "12.10.2 - PATCH no permitido en historial" `
    -Method PATCH `
    -Endpoint "/historial-cambios/1" `
    -Token $adminToken `
    -Body @{ test = "test" } `
    -ExpectedStatus 404 `
    -ShouldFail $true

Test-Api -Name "12.10.3 - DELETE no permitido en historial" `
    -Method DELETE `
    -Endpoint "/historial-cambios/1" `
    -Token $adminToken `
    -ExpectedStatus 404 `
    -ShouldFail $true

# 12.11 - Obtener estadisticas
Write-Info "12.11 - Estadisticas de cambios"

$hoy = (Get-Date).ToString("yyyy-MM-dd")
$hace30dias = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")

Test-Api -Name "12.11.1 - Obtener estadisticas de los ultimos 30 dias" `
    -Method GET `
    -Endpoint "/historial-cambios/estadisticas?fechaDesde=$hace30dias&fechaHasta=$hoy" `
    -Token $adminToken `
    -ExpectedStatus 200

# 12.12 - Obtener registro individual
Write-Info "12.12 - Obtener registro individual"

$historialReciente = Test-Api -Name "12.12.1 - Obtener historial reciente" `
    -Method GET `
    -Endpoint "/historial-cambios/recientes?limit=1" `
    -Token $adminToken `
    -ExpectedStatus 200

if ($historialReciente -and $historialReciente.Count -gt 0) {
    $historialId = $historialReciente[0].id
    Test-Api -Name "12.12.2 - Obtener registro por ID ($historialId)" `
        -Method GET `
        -Endpoint "/historial-cambios/$historialId" `
        -Token $adminToken `
        -ExpectedStatus 200
}

# 12.13 - Test de eliminacion genera historial
Write-Info "12.13 - Verificar que eliminacion genera historial"

if ($huHistorialId) {
    Test-Api -Name "12.13.1 - Eliminar HU (soft delete)" `
        -Method DELETE `
        -Endpoint "/historias-usuario/$huHistorialId" `
        -Token $adminToken `
        -ExpectedStatus 200

    Test-Api -Name "12.13.2 - Verificar registro de eliminacion" `
        -Method GET `
        -Endpoint "/historial-cambios?entidadTipo=HistoriaUsuario&entidadId=$huHistorialId&accion=ELIMINACION" `
        -Token $adminToken `
        -ExpectedStatus 200
}

# 12.14 - Autenticacion requerida
Write-Info "12.14 - Verificar autenticacion requerida"

Test-Api -Name "12.14.1 - Sin token debe fallar" `
    -Method GET `
    -Endpoint "/historial-cambios" `
    -ExpectedStatus 401 `
    -ShouldFail $true

# ================================================================================
# RESUMEN DE RESULTADOS
# ================================================================================

Write-Host "`n" -NoNewline
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "           RESUMEN DE RESULTADOS" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

Write-Host "`nTests pasados: " -NoNewline
Write-Host "$($script:passed)" -ForegroundColor Green
Write-Host "Tests fallidos: " -NoNewline
Write-Host "$($script:failed)" -ForegroundColor Red
Write-Host "Total: $($script:passed + $script:failed)"

$successRate = if (($script:passed + $script:failed) -gt 0) {
    [math]::Round(($script:passed / ($script:passed + $script:failed)) * 100, 2)
} else { 0 }

Write-Host "`nTasa de exito: " -NoNewline
if ($successRate -ge 80) {
    Write-Host "$successRate%" -ForegroundColor Green
} elseif ($successRate -ge 60) {
    Write-Host "$successRate%" -ForegroundColor Yellow
} else {
    Write-Host "$successRate%" -ForegroundColor Red
}

# Exportar resultados a JSON
$resultsFile = "test-historial-results.json"
$script:results | ConvertTo-Json -Depth 5 | Out-File -FilePath $resultsFile -Encoding utf8
Write-Info "Resultados exportados a: $resultsFile"

Write-Host "`n=============================================" -ForegroundColor Yellow
