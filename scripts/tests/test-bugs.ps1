# SIGP Backend - Test de correcciones de bugs
# Bug 1: HU-Requerimientos (Tests 3.14-3.16)
# Bug 2: Subtareas (Tests 4.12-4.16)

$ErrorActionPreference = 'Continue'
$baseUrl = "http://localhost:3010/api/v1"

# Tokens
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJlbWFpbCI6ImFkbWludGVzdDRAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImFkbWludGVzdDQiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTc2NTc1NjEwMCwiZXhwIjoxNzY1ODQyNTAwfQ.rMH6s8s2oPIxZqGHDVx5P7E09e4Pt1PbHX7mtONcaAI"
$pmoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJlbWFpbCI6InBtb3Rlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6InBtb3Rlc3QiLCJyb2wiOiJQTU8iLCJpYXQiOjE3NjU3NTYxMTAsImV4cCI6MTc2NTg0MjUxMH0.MzvWG7WYraESOZEcIpdesgfXtrlSR8JgqKb6P0gxkv4"

# Estadisticas
$stats = @{
    Total = 0
    Passed = 0
    Failed = 0
}

# IDs guardados
$ids = @{}

# Funcion helper
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
            $statusCode = 200
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $response = $null
        }

        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "[PASS] $Name (Status: $statusCode)" -ForegroundColor Green
            $stats.Passed++

            if ($SaveIdAs -and $response -and $response.id) {
                $ids[$SaveIdAs] = $response.id
                Write-Host "  -> Saved ID: $($response.id) as `$$SaveIdAs" -ForegroundColor Gray
            }
        } else {
            Write-Host "[FAIL] $Name (Expected: $ExpectedStatus, Got: $statusCode)" -ForegroundColor Red
            $stats.Failed++

            if ($response) {
                Write-Host "  Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "[ERROR] $Name - $($_.Exception.Message)" -ForegroundColor Red
        $stats.Failed++
    }
}

Write-Host "`n=== PREPARANDO DATOS DE PRUEBA ===" -ForegroundColor Cyan

# Necesitamos crear datos de prueba primero
$timestamp = [int](Get-Date -UFormat %s)

# 1. Crear Acción Estratégica (prerequisito)
Test-Api -Name "Setup: Crear AE" -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken -Body @{
    oegdId = 1
    codigo = "AE-BUG-$timestamp"
    nombre = "AE para bugs"
    descripcion = "AE de prueba"
    presupuesto = 10000
    responsableId = 13
} -SaveIdAs "aeId"

# 2. Crear Proyecto
Test-Api -Name "Setup: Crear Proyecto" -Method POST -Endpoint "/proyectos" -Token $adminToken -Body @{
    accionEstrategicaId = $ids.aeId
    codigo = "PROJ-BUG-$timestamp"
    nombre = "Proyecto para bugs"
    tipoMetodologia = "MIXTO"
    responsableId = 13
} -SaveIdAs "proyectoId"

# 3. Crear Actividad
Test-Api -Name "Setup: Crear Actividad" -Method POST -Endpoint "/actividades" -Token $adminToken -Body @{
    proyectoId = $ids.proyectoId
    codigo = "ACT-BUG-$timestamp"
    nombre = "Actividad de prueba"
    responsableId = 13
} -SaveIdAs "actividadId"

# 4. Crear Requerimientos
Test-Api -Name "Setup: Crear Requerimiento 1" -Method POST -Endpoint "/requerimientos" -Token $adminToken -Body @{
    actividadId = $ids.actividadId
    codigo = "REQ-BUG-$timestamp-1"
    nombre = "Requerimiento 1"
    tipo = "Funcional"
    prioridad = "Alta"
} -SaveIdAs "requerimientoId"

Test-Api -Name "Setup: Crear Requerimiento 2" -Method POST -Endpoint "/requerimientos" -Token $adminToken -Body @{
    actividadId = $ids.actividadId
    codigo = "REQ-BUG-$timestamp-2"
    nombre = "Requerimiento 2"
    tipo = "Funcional"
    prioridad = "Media"
} -SaveIdAs "requerimientoId2"

# 5. Crear Épica
Test-Api -Name "Setup: Crear Épica" -Method POST -Endpoint "/epicas" -Token $adminToken -Body @{
    proyectoId = $ids.proyectoId
    codigo = "EPIC-BUG-$timestamp"
    nombre = "Épica de prueba"
} -SaveIdAs "epicaId"

# 6. Crear Historia de Usuario
Test-Api -Name "Setup: Crear HU 1" -Method POST -Endpoint "/historias-usuario" -Token $adminToken -Body @{
    proyectoId = $ids.proyectoId
    epicaId = $ids.epicaId
    codigo = "HU-BUG-$timestamp-1"
    nombre = "Historia de usuario 1"
    prioridad = "Alta"
    storyPoints = 5
} -SaveIdAs "huId"

Test-Api -Name "Setup: Crear HU 2" -Method POST -Endpoint "/historias-usuario" -Token $adminToken -Body @{
    proyectoId = $ids.proyectoId
    epicaId = $ids.epicaId
    codigo = "HU-BUG-$timestamp-2"
    nombre = "Historia de usuario 2"
    prioridad = "Media"
    storyPoints = 3
} -SaveIdAs "huId2"

# 7. Crear Tareas SCRUM
Test-Api -Name "Setup: Crear Tarea SCRUM 1" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{
    tipo = "SCRUM"
    historiaUsuarioId = $ids.huId
    codigo = "TASK-SCRUM-$timestamp-1"
    nombre = "Tarea SCRUM 1"
    horasEstimadas = 8
} -SaveIdAs "tareaId"

Test-Api -Name "Setup: Crear Tarea SCRUM 2" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{
    tipo = "SCRUM"
    historiaUsuarioId = $ids.huId
    codigo = "TASK-SCRUM-$timestamp-2"
    nombre = "Tarea SCRUM 2"
    horasEstimadas = 4
} -SaveIdAs "tareaId2"

# 8. Crear Tareas KANBAN
Test-Api -Name "Setup: Crear Tarea KANBAN 1" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{
    tipo = "KANBAN"
    actividadId = $ids.actividadId
    codigo = "TASK-KAN-$timestamp-1"
    nombre = "Tarea KANBAN 1"
    horasEstimadas = 10
} -SaveIdAs "tareaKanbanId"

Write-Host "`n=== BUG 1: HU-REQUERIMIENTOS ===" -ForegroundColor Magenta

# Test 3.14 - Vincular requerimiento a HU
Test-Api -Name "3.14 - Vincular requerimiento a HU" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/requerimientos" -Token $adminToken -Body @{
    requerimientoId = $ids.requerimientoId
    notas = "Requerimiento funcional vinculado"
} -ExpectedStatus 200 -SaveIdAs "huRequerimientoId"

# Test 3.15 - Vincular segundo requerimiento
Test-Api -Name "3.15 - Vincular segundo requerimiento" -Method POST -Endpoint "/historias-usuario/$($ids.huId2)/requerimientos" -Token $adminToken -Body @{
    requerimientoId = $ids.requerimientoId2
} -ExpectedStatus 200 -SaveIdAs "huRequerimientoId2"

# Test 3.16 - Rechazar vinculación duplicada (debe fallar con 409)
Test-Api -Name "3.16 - Rechazar vinculación duplicada" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/requerimientos" -Token $adminToken -Body @{
    requerimientoId = $ids.requerimientoId
} -ExpectedStatus 409 -ShouldFail $true

Write-Host "`n=== BUG 2: SUBTAREAS ===" -ForegroundColor Magenta

# Test 4.12 - Cambiar estado a Finalizado
Test-Api -Name "4.12 - Cambiar estado a Finalizado" -Method PATCH -Endpoint "/tareas/$($ids.tareaId2)/estado" -Token $adminToken -Body @{
    estado = "Finalizado"
} -ExpectedStatus 200

# Test 4.13 - Crear subtarea (DEBE USAR TAREA KANBAN)
Test-Api -Name "4.13 - Crear subtarea" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{
    tareaId = $ids.tareaKanbanId
    codigo = "SUBTASK-$timestamp-1"
    nombre = "Implementar validación de email"
    descripcion = "Regex para validar formato email"
    estado = "Por hacer"
    horasEstimadas = 2
} -ExpectedStatus 200 -SaveIdAs "subtareaId"

# Test 4.14 - Crear segunda subtarea
Test-Api -Name "4.14 - Crear segunda subtarea" -Method POST -Endpoint "/subtareas" -Token $pmoToken -Body @{
    tareaId = $ids.tareaKanbanId
    codigo = "SUBTASK-$timestamp-2"
    nombre = "Hash de password con bcrypt"
    horasEstimadas = 1.5
} -ExpectedStatus 200 -SaveIdAs "subtareaId2"

# Test 4.15 - Listar subtareas de tarea
Test-Api -Name "4.15 - Listar subtareas de tarea" -Method GET -Endpoint "/tareas/$($ids.tareaKanbanId)/subtareas" -Token $adminToken -ExpectedStatus 200

# Test 4.16 - Actualizar subtarea
Test-Api -Name "4.16 - Actualizar subtarea" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId)" -Token $adminToken -Body @{
    estado = "Finalizado"
} -ExpectedStatus 200

# RESUMEN
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "RESUMEN - CORRECCIONES DE BUGS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Total:   $($stats.Total)" -ForegroundColor White
Write-Host "Pasadas: $($stats.Passed)" -ForegroundColor Green
Write-Host "Fallidas: $($stats.Failed)" -ForegroundColor Red

if ($stats.Failed -eq 0) {
    Write-Host "`n¡TODOS LOS TESTS PASARON!" -ForegroundColor Green
} else {
    Write-Host "`n¡ALGUNOS TESTS FALLARON!" -ForegroundColor Red
}
