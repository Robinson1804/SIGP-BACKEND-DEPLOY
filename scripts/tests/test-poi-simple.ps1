# SIGP Backend - Pruebas Modulo POI
# Script simplificado para evitar problemas de parsing

$ErrorActionPreference = 'Continue'
$baseUrl = "http://localhost:3010/api/v1"

# Tokens
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJlbWFpbCI6ImFkbWludGVzdDRAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImFkbWludGVzdDQiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTc2NTc1NjEwMCwiZXhwIjoxNzY1ODQyNTAwfQ.rMH6s8s2oPIxZqGHDVx5P7E09e4Pt1PbHX7mtONcaAI"
$pmoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJlbWFpbCI6InBtb3Rlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6InBtb3Rlc3QiLCJyb2wiOiJQTU8iLCJpYXQiOjE3NjU3NTYxMTAsImV4cCI6MTc2NTg0MjUxMH0.MzvWG7WYraESOZEcIpdesgfXtrlSR8JgqKb6P0gxkv4"
$devToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJlbWFpbCI6ImRldnRlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImRldnRlc3QiLCJyb2wiOiJERVNBUlJPTExBRE9SIiwiaWF0IjoxNzY1NzU2MTEwLCJleHAiOjE3NjU4NDI1MTB9.dp10ZHTkX3TAmV8h6xvcVfXhxBlULrKsWCTkQxMN_lQ"

# Estadisticas
$stats = @{
    Total = 0
    Passed = 0
    Failed = 0
    ExpectedFail = 0
    UnexpectedFail = 0
    StartTime = Get-Date
}

# IDs guardados
$ids = @{
    aeId = $null
    proyectoId = $null
    proyectoId2 = $null
    subproyectoId = $null
    subproyectoId2 = $null
    actividadId = $null
    actividadId2 = $null
    requerimientoId = $null
    cronogramaId = $null
    tareaId = $null
    tareaId2 = $null
    documentoId = $null
    actaReunionId = $null
}

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
                Write-Host "[UNEXPECTED FAIL] $Name - Expected $ExpectedStatus got $actualStatus" -ForegroundColor Red
            }
        }
        else {
            if ($passed) {
                $stats.Passed++
                Write-Host "[PASS] $Name" -ForegroundColor Green

                if ($SaveIdAs -and $response) {
                    if ($response.id) {
                        $ids[$SaveIdAs] = $response.id
                        Write-Host "  Saved ID: $SaveIdAs = $($response.id)" -ForegroundColor Cyan
                    }
                    elseif ($response.data.id) {
                        $ids[$SaveIdAs] = $response.data.id
                        Write-Host "  Saved ID: $SaveIdAs = $($response.data.id)" -ForegroundColor Cyan
                    }
                }
            }
            else {
                $stats.Failed++
                Write-Host "[FAIL] $Name - Expected $ExpectedStatus got $actualStatus" -ForegroundColor Red
            }
        }

        return $response
    }
    catch {
        $stats.Failed++
        Write-Host "[ERROR] $Name - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`nPRUEBAS EXHAUSTIVAS - MODULO POI`n" -ForegroundColor Cyan

# Timestamp para codigos unicos
$timestamp = (Get-Date -Format "HHmmss")

# FASE 0: SETUP
Write-Host "=== FASE 0: SETUP ===" -ForegroundColor Magenta

Test-Api -Name "0.1 - Crear Accion Estrategica prerequisito" -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken -Body @{codigo="AE-POI-$timestamp";nombre="AE para Pruebas POI";descripcion="AE de prueba";oegdId=1;fechaInicio="2024-01-01";fechaFin="2026-12-31"} -ExpectedStatus 200 -SaveIdAs "aeId"

Test-Api -Name "0.2 - Verificar AE creada" -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId)" -Token $adminToken -ExpectedStatus 200

# FASE 1: PROYECTOS
Write-Host "`n=== FASE 1: PROYECTOS ===" -ForegroundColor Magenta

Test-Api -Name "1.1 - Crear proyecto como ADMIN" -Method POST -Endpoint "/proyectos" -Token $adminToken -Body @{codigo="PROY-$timestamp-1";nombre="Proyecto Test 1";descripcion="Proyecto para testing";fechaInicio="2024-01-01";fechaFin="2024-12-31";clasificacion="Al ciudadano";accionEstrategicaId=$ids.aeId;coordinadorId=13} -ExpectedStatus 200 -SaveIdAs "proyectoId"

Test-Api -Name "1.2 - Crear segundo proyecto como PMO" -Method POST -Endpoint "/proyectos" -Token $pmoToken -Body @{codigo="PROY-$timestamp-2";nombre="Proyecto Test 2";fechaInicio="2024-02-01";fechaFin="2024-11-30";accionEstrategicaId=$ids.aeId} -ExpectedStatus 200 -SaveIdAs "proyectoId2"

Test-Api -Name "1.3 - Rechazar creacion como DESARROLLADOR" -Method POST -Endpoint "/proyectos" -Token $devToken -Body @{codigo="PROY-TEST-003";nombre="Proyecto No Autorizado";fechaInicio="2024-01-01";fechaFin="2024-12-31"} -ExpectedStatus 403 -ShouldFail $true

Test-Api -Name "1.4 - Rechazar sin autenticacion" -Method POST -Endpoint "/proyectos" -Body @{codigo="PROY-TEST-004";nombre="Proyecto Sin Auth";fechaInicio="2024-01-01";fechaFin="2024-12-31"} -ExpectedStatus 401 -ShouldFail $true

Test-Api -Name "1.5 - Rechazar codigo duplicado" -Method POST -Endpoint "/proyectos" -Token $adminToken -Body @{codigo="PROY-TEST-001";nombre="Proyecto Duplicado";fechaInicio="2024-01-01";fechaFin="2024-12-31"} -ExpectedStatus 409 -ShouldFail $true

Test-Api -Name "1.6 - Listar todos los proyectos" -Method GET -Endpoint "/proyectos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.7 - Filtrar por estado Pendiente" -Method GET -Endpoint "/proyectos?estado=Pendiente" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.8 - Filtrar por accionEstrategicaId" -Method GET -Endpoint "/proyectos?accionEstrategicaId=$($ids.aeId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.9 - Obtener proyecto por ID" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.10 - Obtener proyecto por codigo" -Method GET -Endpoint "/proyectos/codigo/PROY-TEST-001" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.11 - Endpoint anidado AE proyectos" -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId)/proyectos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.12 - Actualizar proyecto como ADMIN" -Method PATCH -Endpoint "/proyectos/$($ids.proyectoId)" -Token $adminToken -Body @{nombre="Proyecto Test 1 - Actualizado"} -ExpectedStatus 200

Test-Api -Name "1.13 - Cambiar estado a En planificacion" -Method POST -Endpoint "/proyectos/$($ids.proyectoId)/cambiar-estado" -Token $adminToken -Body @{estado="En planificacion"} -ExpectedStatus 200

Test-Api -Name "1.14 - Soft delete proyecto" -Method DELETE -Endpoint "/proyectos/$($ids.proyectoId2)" -Token $adminToken -ExpectedStatus 200

# FASE 2: SUBPROYECTOS
Write-Host "`n=== FASE 2: SUBPROYECTOS ===" -ForegroundColor Magenta

Test-Api -Name "2.1 - Crear subproyecto" -Method POST -Endpoint "/subproyectos" -Token $adminToken -Body @{codigo="SUB-$timestamp-1";nombre="Subproyecto 1";proyectoPadreId=$ids.proyectoId;fechaInicio="2024-01-01";fechaFin="2024-06-30"} -ExpectedStatus 200 -SaveIdAs "subproyectoId"

Test-Api -Name "2.2 - Crear segundo subproyecto" -Method POST -Endpoint "/subproyectos" -Token $adminToken -Body @{codigo="SUB-$timestamp-2";nombre="Subproyecto 2";proyectoPadreId=$ids.proyectoId;fechaInicio="2024-07-01";fechaFin="2024-12-31"} -ExpectedStatus 200 -SaveIdAs "subproyectoId2"

Test-Api -Name "2.3 - Rechazar sin proyectoPadreId" -Method POST -Endpoint "/subproyectos" -Token $adminToken -Body @{codigo="SUBPROY-003";nombre="Subproyecto Sin Padre";fechaInicio="2024-01-01";fechaFin="2024-12-31"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "2.4 - Listar subproyectos" -Method GET -Endpoint "/subproyectos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.5 - Filtrar por proyectoPadreId" -Method GET -Endpoint "/subproyectos?proyectoPadreId=$($ids.proyectoId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.6 - Obtener subproyecto por ID" -Method GET -Endpoint "/subproyectos/$($ids.subproyectoId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.7 - Endpoint anidado proyecto subproyectos" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/subproyectos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.8 - Actualizar subproyecto" -Method PATCH -Endpoint "/subproyectos/$($ids.subproyectoId)" -Token $adminToken -Body @{nombre="Subproyecto 1 - Actualizado"} -ExpectedStatus 200

Test-Api -Name "2.9 - Eliminar subproyecto" -Method DELETE -Endpoint "/subproyectos/$($ids.subproyectoId2)" -Token $adminToken -ExpectedStatus 200

# FASE 3: ACTIVIDADES
Write-Host "`n=== FASE 3: ACTIVIDADES ===" -ForegroundColor Magenta

Test-Api -Name "3.1 - Crear actividad como ADMIN" -Method POST -Endpoint "/actividades" -Token $adminToken -Body @{codigo="ACT-$timestamp-1";nombre="Actividad Test 1";descripcion="Actividad de prueba";fechaInicio="2024-01-01";fechaFin="2024-12-31";periodicidadInforme="MENSUAL";accionEstrategicaId=$ids.aeId;coordinadorId=13} -ExpectedStatus 200 -SaveIdAs "actividadId"

Test-Api -Name "3.2 - Crear segunda actividad como PMO" -Method POST -Endpoint "/actividades" -Token $pmoToken -Body @{codigo="ACT-$timestamp-2";nombre="Actividad Test 2";fechaInicio="2024-02-01";fechaFin="2024-11-30";periodicidadInforme="TRIMESTRAL";accionEstrategicaId=$ids.aeId} -ExpectedStatus 200 -SaveIdAs "actividadId2"

Test-Api -Name "3.3 - Rechazar como DESARROLLADOR" -Method POST -Endpoint "/actividades" -Token $devToken -Body @{codigo="ACT-TEST-003";nombre="Actividad No Autorizada";fechaInicio="2024-01-01";fechaFin="2024-12-31"} -ExpectedStatus 403 -ShouldFail $true

Test-Api -Name "3.4 - Listar actividades" -Method GET -Endpoint "/actividades" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "3.5 - Filtrar por accionEstrategicaId" -Method GET -Endpoint "/actividades?accionEstrategicaId=$($ids.aeId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "3.6 - Obtener actividad por ID" -Method GET -Endpoint "/actividades/$($ids.actividadId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "3.7 - Endpoint anidado AE actividades" -Method GET -Endpoint "/acciones-estrategicas/$($ids.aeId)/actividades" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "3.8 - Actualizar actividad" -Method PATCH -Endpoint "/actividades/$($ids.actividadId)" -Token $adminToken -Body @{nombre="Actividad Test 1 - Actualizada"} -ExpectedStatus 200

Test-Api -Name "3.9 - Eliminar actividad" -Method DELETE -Endpoint "/actividades/$($ids.actividadId2)" -Token $adminToken -ExpectedStatus 200

# FASE 4: REQUERIMIENTOS
Write-Host "`n=== FASE 4: REQUERIMIENTOS ===" -ForegroundColor Magenta

Test-Api -Name "4.1 - Crear requerimiento funcional" -Method POST -Endpoint "/requerimientos" -Token $adminToken -Body @{codigo="REQ-$timestamp-1";nombre="Requerimiento Funcional 1";descripcion="Descripcion del requerimiento";tipo="Funcional";prioridad="Alta";proyectoId=$ids.proyectoId;criteriosAceptacion=@(@{descripcion="Criterio 1"},@{descripcion="Criterio 2"})} -ExpectedStatus 200 -SaveIdAs "requerimientoId"

Test-Api -Name "4.2 - Crear requerimiento no funcional" -Method POST -Endpoint "/requerimientos" -Token $adminToken -Body @{codigo="REQ-$timestamp-2";nombre="Requerimiento No Funcional";tipo="No Funcional";prioridad="Media";proyectoId=$ids.proyectoId} -ExpectedStatus 200

Test-Api -Name "4.3 - Rechazar sin proyectoId" -Method POST -Endpoint "/requerimientos" -Token $adminToken -Body @{codigo="REQ-003";nombre="Req Sin Proyecto";tipo="Funcional"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "4.4 - Listar requerimientos" -Method GET -Endpoint "/requerimientos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "4.5 - Filtrar por proyectoId" -Method GET -Endpoint "/requerimientos?proyectoId=$($ids.proyectoId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "4.6 - Filtrar por tipo Funcional" -Method GET -Endpoint "/requerimientos?tipo=Funcional" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "4.7 - Endpoint anidado proyecto requerimientos" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/requerimientos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "4.8 - Actualizar requerimiento" -Method PATCH -Endpoint "/requerimientos/$($ids.requerimientoId)" -Token $adminToken -Body @{nombre="Requerimiento Funcional 1 - Actualizado"} -ExpectedStatus 200

Test-Api -Name "4.9 - Aprobar requerimiento" -Method POST -Endpoint "/requerimientos/$($ids.requerimientoId)/aprobar" -Token $adminToken -Body @{estado="Aprobado"} -ExpectedStatus 200

# FASE 5: CRONOGRAMAS Y TAREAS
Write-Host "`n=== FASE 5: CRONOGRAMAS Y TAREAS ===" -ForegroundColor Magenta

Test-Api -Name "5.1 - Crear cronograma" -Method POST -Endpoint "/cronogramas" -Token $adminToken -Body @{codigo="CRON-$timestamp-1";nombre="Cronograma Principal";descripcion="Cronograma de prueba";proyectoId=$ids.proyectoId;fechaInicio="2024-01-01";fechaFin="2024-12-31";version=1} -ExpectedStatus 200 -SaveIdAs "cronogramaId"

Test-Api -Name "5.2 - Rechazar sin proyectoId" -Method POST -Endpoint "/cronogramas" -Token $adminToken -Body @{nombre="Cronograma Sin Proyecto";fechaInicio="2024-01-01";fechaFin="2024-12-31"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "5.3 - Listar cronogramas" -Method GET -Endpoint "/cronogramas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "5.4 - Filtrar por proyectoId" -Method GET -Endpoint "/cronogramas?proyectoId=$($ids.proyectoId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "5.5 - Endpoint anidado proyecto cronogramas" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/cronogramas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "5.6 - Actualizar cronograma" -Method PATCH -Endpoint "/cronogramas/$($ids.cronogramaId)" -Token $adminToken -Body @{nombre="Cronograma Principal - Actualizado"} -ExpectedStatus 200

Test-Api -Name "5.7 - Crear tarea en cronograma" -Method POST -Endpoint "/tareas-cronograma" -Token $adminToken -Body @{codigo="TAREA-$timestamp-1";nombre="Tarea Principal 1";descripcion="Tarea de prueba";cronogramaId=$ids.cronogramaId;fechaInicio="2024-01-15";fechaFin="2024-02-15";prioridad="Alta";responsableId=13} -ExpectedStatus 200 -SaveIdAs "tareaId"

Test-Api -Name "5.8 - Crear segunda tarea" -Method POST -Endpoint "/tareas-cronograma" -Token $adminToken -Body @{codigo="TAREA-$timestamp-2";nombre="Tarea Principal 2";cronogramaId=$ids.cronogramaId;fechaInicio="2024-02-16";fechaFin="2024-03-16";prioridad="Media"} -ExpectedStatus 200 -SaveIdAs "tareaId2"

Test-Api -Name "5.9 - Crear sub-tarea con tareaPadreId" -Method POST -Endpoint "/tareas-cronograma" -Token $adminToken -Body @{codigo="TAREA-$timestamp-3";nombre="Sub-tarea 1.1";cronogramaId=$ids.cronogramaId;tareaPadreId=$ids.tareaId;fechaInicio="2024-01-15";fechaFin="2024-01-25"} -ExpectedStatus 200

Test-Api -Name "5.10 - Obtener tarea por ID" -Method GET -Endpoint "/tareas-cronograma/$($ids.tareaId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "5.11 - Endpoint anidado cronograma tareas" -Method GET -Endpoint "/cronogramas/$($ids.cronogramaId)/tareas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "5.12 - Actualizar tarea" -Method PATCH -Endpoint "/tareas-cronograma/$($ids.tareaId)" -Token $adminToken -Body @{nombre="Tarea Principal 1 - Actualizada";porcentajeAvance=50} -ExpectedStatus 200

# FASE 6: DOCUMENTOS
Write-Host "`n=== FASE 6: DOCUMENTOS ===" -ForegroundColor Magenta

Test-Api -Name "6.1 - Crear documento de PROYECTO" -Method POST -Endpoint "/documentos" -Token $adminToken -Body @{nombre="Acta de Constitucion";descripcion="Documento de prueba";tipoContenedor="PROYECTO";proyectoId=$ids.proyectoId;fase="Analisis y Planificacion";esObligatorio=$true} -ExpectedStatus 200 -SaveIdAs "documentoId"

Test-Api -Name "6.2 - Rechazar sin tipoContenedor" -Method POST -Endpoint "/documentos" -Token $adminToken -Body @{nombre="Documento Sin Tipo";proyectoId=$ids.proyectoId} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "6.3 - Rechazar PROYECTO sin proyectoId" -Method POST -Endpoint "/documentos" -Token $adminToken -Body @{nombre="Doc Sin ProyectoId";tipoContenedor="PROYECTO"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "6.4 - Listar documentos" -Method GET -Endpoint "/documentos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "6.5 - Filtrar por proyectoId" -Method GET -Endpoint "/documentos?proyectoId=$($ids.proyectoId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "6.6 - Endpoint anidado proyecto documentos" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/documentos" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "6.7 - Aprobar documento" -Method POST -Endpoint "/documentos/$($ids.documentoId)/aprobar" -Token $adminToken -Body @{estado="Aprobado"} -ExpectedStatus 200

Test-Api -Name "6.8 - Crear documento de SUBPROYECTO" -Method POST -Endpoint "/documentos" -Token $adminToken -Body @{nombre="Doc Subproyecto";tipoContenedor="SUBPROYECTO";subproyectoId=$ids.subproyectoId;fase="Desarrollo"} -ExpectedStatus 200

Test-Api -Name "6.9 - Endpoint anidado subproyecto documentos" -Method GET -Endpoint "/subproyectos/$($ids.subproyectoId)/documentos" -Token $adminToken -ExpectedStatus 200

# FASE 7: ACTAS
Write-Host "`n=== FASE 7: ACTAS ===" -ForegroundColor Magenta

Test-Api -Name "7.1 - Crear acta de reunion INICIAL" -Method POST -Endpoint "/actas/reunion" -Token $adminToken -Body @{codigo="ACTA-$timestamp-1";nombre="Reunion Inicial Proyecto";proyectoId=$ids.proyectoId;tipoReunion="Reunion inicial";fecha="2024-01-10";horaInicio="09:00";horaFin="11:00";asistentes=@(@{nombre="Juan Perez";cargo="Coordinador"},@{nombre="Maria Lopez";cargo="Desarrollador"});agenda=@(@{numero=1;tema="Presentacion del proyecto"})} -ExpectedStatus 200 -SaveIdAs "actaReunionId"

Test-Api -Name "7.2 - Crear acta tipo SEGUIMIENTO" -Method POST -Endpoint "/actas/reunion" -Token $adminToken -Body @{codigo="ACTA-$timestamp-2";nombre="Reunion Seguimiento";proyectoId=$ids.proyectoId;tipoReunion="Reunion de seguimiento";fecha="2024-02-10";horaInicio="10:00";horaFin="11:00"} -ExpectedStatus 200

Test-Api -Name "7.3 - Rechazar sin proyectoId" -Method POST -Endpoint "/actas/reunion" -Token $adminToken -Body @{tipoReunion="Inicial";fecha="2024-01-10"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "7.4 - Listar actas" -Method GET -Endpoint "/actas?tipo=Acta de Reunion" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.5 - Endpoint anidado proyecto actas" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/actas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.6 - Aprobar acta" -Method POST -Endpoint "/actas/$($ids.actaReunionId)/aprobar" -Token $pmoToken -Body @{estado="Aprobado"} -ExpectedStatus 200

# RESUMEN FINAL
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE PRUEBAS - MODULO POI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$stats.EndTime = Get-Date
$duration = ($stats.EndTime - $stats.StartTime).TotalSeconds

Write-Host "`nEstadisticas:" -ForegroundColor White
Write-Host "  Total:              $($stats.Total)" -ForegroundColor White
Write-Host "  Pasadas:            $($stats.Passed)" -ForegroundColor Green
Write-Host "  Fallidas:           $($stats.Failed)" -ForegroundColor Red
Write-Host "  Fallos esperados:   $($stats.ExpectedFail)" -ForegroundColor Yellow
Write-Host "  Fallos inesperados: $($stats.UnexpectedFail)" -ForegroundColor Magenta
Write-Host "  Duracion:           $([math]::Round($duration, 2)) segundos" -ForegroundColor White

$successRate = if ($stats.Total -gt 0) { [math]::Round(($stats.Passed / $stats.Total) * 100, 2) } else { 0 }
Write-Host "`n  Tasa de exito: $successRate%" -ForegroundColor Cyan

Write-Host "`nIDs Guardados:" -ForegroundColor White
foreach ($key in $ids.Keys) {
    Write-Host "  $key = $($ids[$key])" -ForegroundColor Gray
}

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
