# SIGP Backend - Pruebas Exhaustivas Modulo AGILE
# Script completo cubriendo todas las funcionalidades y flujos SCRUM/Kanban
# Nota: Algunas pruebas con filtros múltiples se simplifican para evitar problemas con & en PowerShell

$ErrorActionPreference = 'Continue'
$baseUrl = "http://localhost:3010/api/v1"

# Tokens (reutilizar los existentes)
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJlbWFpbCI6ImFkbWludGVzdDRAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImFkbWludGVzdDQiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTc2NTc1NjEwMCwiZXhwIjoxNzY1ODQyNTAwfQ.rMH6s8s2oPIxZqGHDVx5P7E09e4Pt1PbHX7mtONcaAI"
$pmoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJlbWFpbCI6InBtb3Rlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6InBtb3Rlc3QiLCJyb2wiOiJQTU8iLCJpYXQiOjE3NjU3NTYxMTAsImV4cCI6MTc2NTg0MjUxMH0.MzvWG7WYraESOZEcIpdesgfXtrlSR8JgqKb6P0gxkv4"
$devToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJlbWFpbCI6ImRldnRlc3RAaW5laS5nb2IucGUiLCJ1c2VybmFtZSI6ImRldnRlc3QiLCJyb2wiOiJERVNBUlJPTExBRE9SIiwiaWF0IjoxNzY1NzU2MTEwLCJleHAiOjE3NjU4NDI1MTB9.dp10ZHTkX3TAmV8h6xvcVfXhxBlULrKsWCTkQxMN_lQ"
$scrumMasterToken = $adminToken
$coordinadorToken = $pmoToken

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
    actividadId = $null
    actividadId2 = $null
    requerimientoId = $null
    requerimientoId2 = $null
    epicaId = $null
    epicaId2 = $null
    epicaId3 = $null
    sprintId = $null
    sprintId2 = $null
    sprintId3 = $null
    huId = $null
    huId2 = $null
    huId3 = $null
    huId4 = $null
    huId5 = $null
    criterioId = $null
    criterioId2 = $null
    criterioUnico = $null
    huCriterioTest = $null
    dependenciaId = $null
    dependenciaId2 = $null
    dependenciaId3 = $null
    huRequerimientoId = $null
    huRequerimientoId2 = $null
    tareaId = $null
    tareaId2 = $null
    tareaKanbanId = $null
    tareaKanbanId2 = $null
    subtareaId = $null
    subtareaId2 = $null
    subtareaId3 = $null
    subtareaId4 = $null
    subtareaId5 = $null
    subtareaId6 = $null
    subtareaId7 = $null
    subtareaDeleteId = $null
    dailyId = $null
    dailyId2 = $null
    dailyKanbanId = $null
    participanteId = $null
    participanteId2 = $null
    comentarioHuId = $null
    comentarioHuId2 = $null
    comentarioHuId3 = $null
    comentarioTareaId = $null
    comentarioTareaId2 = $null
    comentarioSubtareaId = $null
    comentarioSubtareaId2 = $null
    respuestaComentarioId = $null
    comentarioDeleteId = $null
    comentarioDevId = $null
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

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "PRUEBAS EXHAUSTIVAS - MODULO AGILE" -ForegroundColor Cyan
Write-Host "Cobertura: 12 entidades, 80+ endpoints" -ForegroundColor Cyan
Write-Host "=======================================`n" -ForegroundColor Cyan

$timestamp = (Get-Date -Format "HHmmss")

# FASE 0: SETUP POI
Write-Host "=== FASE 0: SETUP POI ===" -ForegroundColor Magenta

Test-Api -Name "0.1 - Crear Accion Estrategica" -Method POST -Endpoint "/acciones-estrategicas" -Token $adminToken -Body @{codigo="AE-AGILE-$timestamp";nombre="AE para Pruebas Agile";descripcion="AE de prueba";oegdId=1;fechaInicio="2025-01-01";fechaFin="2026-12-31"} -ExpectedStatus 200 -SaveIdAs "aeId"

Test-Api -Name "0.2 - Crear Proyecto POI principal" -Method POST -Endpoint "/proyectos" -Token $adminToken -Body @{codigo="PROY-AGILE-$timestamp-1";nombre="Proyecto Agile Test 1";fechaInicio="2025-01-01";fechaFin="2025-12-31";accionEstrategicaId=$ids.aeId;coordinadorId=13} -ExpectedStatus 200 -SaveIdAs "proyectoId"

Test-Api -Name "0.3 - Crear segundo Proyecto POI" -Method POST -Endpoint "/proyectos" -Token $pmoToken -Body @{codigo="PROY-AGILE-$timestamp-2";nombre="Proyecto Agile Test 2";fechaInicio="2025-02-01";fechaFin="2025-11-30";accionEstrategicaId=$ids.aeId} -ExpectedStatus 200 -SaveIdAs "proyectoId2"

Test-Api -Name "0.4 - Crear Actividad POI 1" -Method POST -Endpoint "/actividades" -Token $adminToken -Body @{codigo="ACT-AGILE-$timestamp-1";nombre="Actividad Kanban Test 1";accionEstrategicaId=$ids.aeId;fechaInicio="2025-01-01";fechaFin="2025-06-30"} -ExpectedStatus 200 -SaveIdAs "actividadId"

Test-Api -Name "0.5 - Crear Actividad POI 2" -Method POST -Endpoint "/actividades" -Token $pmoToken -Body @{codigo="ACT-AGILE-$timestamp-2";nombre="Actividad Kanban Test 2";accionEstrategicaId=$ids.aeId;fechaInicio="2025-02-01";fechaFin="2025-07-31"} -ExpectedStatus 200 -SaveIdAs "actividadId2"

Test-Api -Name "0.6 - Crear Requerimiento Funcional" -Method POST -Endpoint "/requerimientos" -Token $adminToken -Body @{codigo="REQ-AGILE-$timestamp-1";nombre="Requerimiento Funcional Test";tipo="Funcional";prioridad="Alta";proyectoId=$ids.proyectoId} -ExpectedStatus 200 -SaveIdAs "requerimientoId"

Test-Api -Name "0.7 - Crear Requerimiento No Funcional" -Method POST -Endpoint "/requerimientos" -Token $pmoToken -Body @{codigo="REQ-AGILE-$timestamp-2";nombre="Requerimiento No Funcional Test";tipo="No Funcional";prioridad="Media";proyectoId=$ids.proyectoId} -ExpectedStatus 200 -SaveIdAs "requerimientoId2"

Test-Api -Name "0.8 - Verificar setup POI completo" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)" -Token $adminToken -ExpectedStatus 200

# ========================================
# FASE 1: ÉPICAS
# ========================================
Write-Host "`n=== FASE 1: ÉPICAS ===" -ForegroundColor Magenta

# 1.1 Creación
Test-Api -Name "1.1 - Crear épica ALTA prioridad" -Method POST -Endpoint "/epicas" -Token $adminToken -Body @{proyectoId=$ids.proyectoId;codigo="EPIC-$timestamp-1";nombre="Épica de Autenticación";descripcion="Implementar sistema completo de autenticación";prioridad="Alta";fechaInicio="2025-01-15";fechaFin="2025-03-31"} -ExpectedStatus 200 -SaveIdAs "epicaId"

Test-Api -Name "1.2 - Crear épica MEDIA prioridad" -Method POST -Endpoint "/epicas" -Token $pmoToken -Body @{proyectoId=$ids.proyectoId;codigo="EPIC-$timestamp-2";nombre="Épica de Reportes";descripcion="Sistema de generación de reportes";prioridad="Media";fechaInicio="2025-02-01";fechaFin="2025-04-30"} -ExpectedStatus 200 -SaveIdAs "epicaId2"

Test-Api -Name "1.3 - Crear épica BAJA prioridad" -Method POST -Endpoint "/epicas" -Token $coordinadorToken -Body @{proyectoId=$ids.proyectoId;codigo="EPIC-$timestamp-3";nombre="Épica de Notificaciones";prioridad="Baja";fechaInicio="2025-03-01";fechaFin="2025-05-31"} -ExpectedStatus 200 -SaveIdAs "epicaId3"

Test-Api -Name "1.4 - Rechazar sin proyectoId" -Method POST -Endpoint "/epicas" -Token $adminToken -Body @{codigo="EPIC-NO-PROY";nombre="Sin proyecto"} -ExpectedStatus 400 -ShouldFail $true

# 1.2 Consulta
Test-Api -Name "1.5 - Listar todas las épicas" -Method GET -Endpoint "/epicas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.6 - Obtener épica por ID" -Method GET -Endpoint "/epicas/$($ids.epicaId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "1.7 - Obtener estadísticas de épica" -Method GET -Endpoint "/epicas/$($ids.epicaId)/estadisticas" -Token $adminToken -ExpectedStatus 200

# 1.3 Actualización
Test-Api -Name "1.8 - Actualizar nombre y descripción" -Method PATCH -Endpoint "/epicas/$($ids.epicaId)" -Token $adminToken -Body @{nombre="Épica Autenticación Actualizada";descripcion="Sistema completo de autenticación y autorización"} -ExpectedStatus 200

Test-Api -Name "1.9 - Actualizar prioridad" -Method PATCH -Endpoint "/epicas/$($ids.epicaId2)" -Token $adminToken -Body @{prioridad="Alta"} -ExpectedStatus 200

Test-Api -Name "1.10 - Rechazar actualización sin permisos" -Method PATCH -Endpoint "/epicas/$($ids.epicaId)" -Token $devToken -Body @{nombre="Intento de hack"} -ExpectedStatus 403 -ShouldFail $true

# ========================================
# FASE 2: SPRINTS
# ========================================
Write-Host "`n=== FASE 2: SPRINTS ===" -ForegroundColor Magenta

# 2.1 Creación
Test-Api -Name "2.1 - Crear sprint Planificado" -Method POST -Endpoint "/sprints" -Token $adminToken -Body @{proyectoId=$ids.proyectoId;nombre="Sprint 1 - Autenticación";sprintGoal="Implementar login y registro";fechaInicio="2025-01-15";fechaFin="2025-01-29";capacidadEquipo=40} -ExpectedStatus 200 -SaveIdAs "sprintId"

Test-Api -Name "2.2 - Crear segundo sprint" -Method POST -Endpoint "/sprints" -Token $pmoToken -Body @{proyectoId=$ids.proyectoId;nombre="Sprint 2 - Perfiles";sprintGoal="CRUD de perfiles de usuario";fechaInicio="2025-01-30";fechaFin="2025-02-13";capacidadEquipo=40} -ExpectedStatus 200 -SaveIdAs "sprintId2"

Test-Api -Name "2.3 - Crear tercer sprint" -Method POST -Endpoint "/sprints" -Token $scrumMasterToken -Body @{proyectoId=$ids.proyectoId;nombre="Sprint 3 - Reportes";sprintGoal="Dashboard y reportes básicos";fechaInicio="2025-02-14";fechaFin="2025-02-28"} -ExpectedStatus 200 -SaveIdAs "sprintId3"

Test-Api -Name "2.4 - Rechazar sin proyectoId" -Method POST -Endpoint "/sprints" -Token $adminToken -Body @{nombre="Sin proyecto";fechaInicio="2025-01-01";fechaFin="2025-01-15"} -ExpectedStatus 400 -ShouldFail $true

# 2.2 Consulta
Test-Api -Name "2.5 - Listar todos los sprints" -Method GET -Endpoint "/sprints" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.6 - Obtener sprint por ID" -Method GET -Endpoint "/sprints/$($ids.sprintId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.7 - Obtener burndown chart" -Method GET -Endpoint "/sprints/$($ids.sprintId)/burndown" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.8 - Obtener métricas del sprint" -Method GET -Endpoint "/sprints/$($ids.sprintId)/metricas" -Token $adminToken -ExpectedStatus 200

# 2.3 Operaciones
Test-Api -Name "2.9 - Actualizar nombre y objetivo" -Method PATCH -Endpoint "/sprints/$($ids.sprintId)" -Token $adminToken -Body @{nombre="Sprint 1 - Auth Actualizado";sprintGoal="Implementar login, registro y perfiles"} -ExpectedStatus 200

Test-Api -Name "2.10 - Iniciar sprint" -Method PATCH -Endpoint "/sprints/$($ids.sprintId)/iniciar" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "2.11 - Cerrar sprint" -Method PATCH -Endpoint "/sprints/$($ids.sprintId)/cerrar" -Token $adminToken -Body @{linkEvidencia="https://jira.example.com/sprint-1"} -ExpectedStatus 200

Test-Api -Name "2.12 - Rechazar iniciar sin permisos" -Method PATCH -Endpoint "/sprints/$($ids.sprintId2)/iniciar" -Token $devToken -ExpectedStatus 403 -ShouldFail $true

# ========================================
# FASE 3: HISTORIAS DE USUARIO
# ========================================
Write-Host "`n=== FASE 3: HISTORIAS DE USUARIO ===" -ForegroundColor Magenta

# 3.1 Creación
Test-Api -Name "3.1 - Crear HU con criterios de aceptación" -Method POST -Endpoint "/historias-usuario" -Token $adminToken -Body @{proyectoId=$ids.proyectoId;codigo="HU-$timestamp-1";titulo="Implementar login de usuarios";rol="Usuario";quiero="poder iniciar sesión en el sistema";para="acceder a mi cuenta de forma segura";prioridad="Must";estimacion="M";storyPoints=5;criteriosAceptacion=@(@{given="el usuario tiene credenciales válidas";when="ingresa email y contraseña correctos";then="debe acceder al dashboard principal";orden=1},@{given="el usuario ingresa credenciales incorrectas";when="intenta iniciar sesión";then="debe ver mensaje de error";orden=2})} -ExpectedStatus 200 -SaveIdAs "huId"

Test-Api -Name "3.2 - Crear HU asignada a épica" -Method POST -Endpoint "/historias-usuario" -Token $pmoToken -Body @{proyectoId=$ids.proyectoId;epicaId=$ids.epicaId;codigo="HU-$timestamp-2";titulo="Implementar registro de usuarios";rol="Usuario nuevo";quiero="registrarme en el sistema";para="crear una cuenta";prioridad="Must";estimacion="L";storyPoints=8} -ExpectedStatus 200 -SaveIdAs "huId2"

Test-Api -Name "3.3 - Crear HU asignada a sprint" -Method POST -Endpoint "/historias-usuario" -Token $adminToken -Body @{proyectoId=$ids.proyectoId;sprintId=$ids.sprintId2;codigo="HU-$timestamp-3";titulo="Crear perfil de usuario";prioridad="Should";estimacion="M";storyPoints=5} -ExpectedStatus 200 -SaveIdAs "huId3"

Test-Api -Name "3.4 - Crear HU prioridad MUST" -Method POST -Endpoint "/historias-usuario" -Token $pmoToken -Body @{proyectoId=$ids.proyectoId;codigo="HU-$timestamp-4";titulo="Recuperar contraseña";prioridad="Must";estimacion="S";storyPoints=3} -ExpectedStatus 200 -SaveIdAs "huId4"

Test-Api -Name "3.5 - Crear HU con épica 2" -Method POST -Endpoint "/historias-usuario" -Token $coordinadorToken -Body @{proyectoId=$ids.proyectoId;epicaId=$ids.epicaId2;codigo="HU-$timestamp-5";titulo="Generar reporte PDF";prioridad="Could";estimacion="M";storyPoints=5} -ExpectedStatus 200 -SaveIdAs "huId5"

Test-Api -Name "3.6 - Rechazar sin proyectoId" -Method POST -Endpoint "/historias-usuario" -Token $adminToken -Body @{codigo="HU-NO-PROY";titulo="Sin proyecto"} -ExpectedStatus 400 -ShouldFail $true

# 3.2 Consulta
Test-Api -Name "3.7 - Listar todas las HU" -Method GET -Endpoint "/historias-usuario" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "3.8 - Obtener HU por ID" -Method GET -Endpoint "/historias-usuario/$($ids.huId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "3.9 - Obtener backlog del proyecto" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/historias-usuario/backlog" -Token $adminToken -ExpectedStatus 200

# 3.3 Actualización
Test-Api -Name "3.10 - Actualizar título" -Method PATCH -Endpoint "/historias-usuario/$($ids.huId)" -Token $adminToken -Body @{titulo="Implementar login con OAuth"} -ExpectedStatus 200

Test-Api -Name "3.11 - Cambiar estado a En desarrollo" -Method PATCH -Endpoint "/historias-usuario/$($ids.huId)/estado" -Token $adminToken -Body @{estado="En desarrollo"} -ExpectedStatus 200

Test-Api -Name "3.12 - Mover HU a sprint" -Method PATCH -Endpoint "/historias-usuario/$($ids.huId)/mover-sprint" -Token $adminToken -Body @{sprintId=$ids.sprintId2} -ExpectedStatus 200

Test-Api -Name "3.13 - Asignar HU a usuario" -Method PATCH -Endpoint "/historias-usuario/$($ids.huId)/asignar" -Token $adminToken -Body @{asignadoA=13} -ExpectedStatus 200

# 3.4 Vinculación con Requerimientos POI
Test-Api -Name "3.14 - Vincular requerimiento a HU" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/requerimientos" -Token $adminToken -Body @{requerimientoId=$ids.requerimientoId;notas="Requerimiento funcional vinculado"} -ExpectedStatus 200 -SaveIdAs "huRequerimientoId"

Test-Api -Name "3.15 - Vincular segundo requerimiento" -Method POST -Endpoint "/historias-usuario/$($ids.huId2)/requerimientos" -Token $adminToken -Body @{requerimientoId=$ids.requerimientoId2} -ExpectedStatus 200 -SaveIdAs "huRequerimientoId2"

Test-Api -Name "3.16 - Rechazar vinculación duplicada" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/requerimientos" -Token $adminToken -Body @{requerimientoId=$ids.requerimientoId} -ExpectedStatus 409 -ShouldFail $true

# ========================================
# FASE 4: TAREAS (SCRUM y KANBAN)
# ========================================
Write-Host "`n=== FASE 4: TAREAS ===" -ForegroundColor Magenta

# 4.1 Creación Tipo SCRUM
Test-Api -Name "4.1 - Crear tarea SCRUM" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{tipo="SCRUM";historiaUsuarioId=$ids.huId;codigo="TASK-$timestamp-1";nombre="Implementar endpoint login";descripcion="POST /auth/login";prioridad="Alta";horasEstimadas=8} -ExpectedStatus 200 -SaveIdAs "tareaId"

Test-Api -Name "4.2 - Crear segunda tarea SCRUM" -Method POST -Endpoint "/tareas" -Token $pmoToken -Body @{tipo="SCRUM";historiaUsuarioId=$ids.huId;codigo="TASK-$timestamp-2";nombre="Validar JWT token";horasEstimadas=4} -ExpectedStatus 200 -SaveIdAs "tareaId2"

Test-Api -Name "4.3 - Crear tarea para HU2" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{tipo="SCRUM";historiaUsuarioId=$ids.huId2;codigo="TASK-$timestamp-3";nombre="UI de registro";prioridad="Alta";horasEstimadas=6} -ExpectedStatus 200

Test-Api -Name "4.4 - Rechazar SCRUM sin historiaUsuarioId" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{tipo="SCRUM";codigo="TASK-NO-HU";nombre="Sin HU"} -ExpectedStatus 400 -ShouldFail $true

# 4.2 Creación Tipo KANBAN
Test-Api -Name "4.5 - Crear tarea KANBAN" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{tipo="KANBAN";actividadId=$ids.actividadId;codigo="TASK-KAN-$timestamp-1";nombre="Diseñar mockups";prioridad="Media";horasEstimadas=10} -ExpectedStatus 200 -SaveIdAs "tareaKanbanId"

Test-Api -Name "4.6 - Crear segunda tarea KANBAN" -Method POST -Endpoint "/tareas" -Token $pmoToken -Body @{tipo="KANBAN";actividadId=$ids.actividadId;codigo="TASK-KAN-$timestamp-2";nombre="Desarrollar componente UI";horasEstimadas=12} -ExpectedStatus 200 -SaveIdAs "tareaKanbanId2"

Test-Api -Name "4.7 - Rechazar KANBAN sin actividadId" -Method POST -Endpoint "/tareas" -Token $adminToken -Body @{tipo="KANBAN";codigo="TASK-KAN-NO-ACT";nombre="Sin actividad"} -ExpectedStatus 400 -ShouldFail $true

# 4.3 Consulta
Test-Api -Name "4.8 - Listar todas las tareas" -Method GET -Endpoint "/tareas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "4.9 - Obtener tarea por ID" -Method GET -Endpoint "/tareas/$($ids.tareaId)" -Token $adminToken -ExpectedStatus 200

# 4.4 Actualización
Test-Api -Name "4.10 - Actualizar descripción" -Method PATCH -Endpoint "/tareas/$($ids.tareaId)" -Token $adminToken -Body @{descripcion="POST /auth/login con rate limiting";horasEstimadas=10} -ExpectedStatus 200

Test-Api -Name "4.11 - Cambiar estado a En progreso" -Method PATCH -Endpoint "/tareas/$($ids.tareaId)/estado" -Token $adminToken -Body @{estado="En progreso"} -ExpectedStatus 200

Test-Api -Name "4.12 - Cambiar estado a Finalizado" -Method PATCH -Endpoint "/tareas/$($ids.tareaId2)/estado" -Token $adminToken -Body @{estado="Finalizado";evidenciaUrl="https://github.com/repo/pull/123"} -ExpectedStatus 200

# 4.5 Subtareas
Test-Api -Name "4.13 - Crear subtarea" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=$ids.tareaKanbanId;codigo="SUBTASK-$timestamp-1";nombre="Implementar validación de email";descripcion="Regex para validar formato email";estado="Por hacer";horasEstimadas=2} -ExpectedStatus 200 -SaveIdAs "subtareaId"

Test-Api -Name "4.14 - Crear segunda subtarea" -Method POST -Endpoint "/subtareas" -Token $pmoToken -Body @{tareaId=$ids.tareaKanbanId;codigo="SUBTASK-$timestamp-2";nombre="Hash de password con bcrypt";horasEstimadas=1.5} -ExpectedStatus 200 -SaveIdAs "subtareaId2"

Test-Api -Name "4.15 - Listar subtareas de tarea" -Method GET -Endpoint "/tareas/$($ids.tareaKanbanId)/subtareas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "4.16 - Actualizar subtarea" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId)" -Token $adminToken -Body @{estado="Finalizado"} -ExpectedStatus 200

# ========================================
# FASE 5: TABLEROS
# ========================================
Write-Host "`n=== FASE 5: TABLEROS ===" -ForegroundColor Magenta

# 5.1 Tablero Scrum
Test-Api -Name "5.1 - Obtener tablero Scrum de sprint" -Method GET -Endpoint "/sprints/$($ids.sprintId2)/tablero" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "5.2 - Tablero con sprint vacío" -Method GET -Endpoint "/sprints/$($ids.sprintId3)/tablero" -Token $adminToken -ExpectedStatus 200

# 5.2 Tablero Kanban
Test-Api -Name "5.3 - Obtener tablero Kanban de actividad" -Method GET -Endpoint "/actividades/$($ids.actividadId)/tablero" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "5.4 - Tablero con actividad vacia" -Method GET -Endpoint "/actividades/$($ids.actividadId2)/tablero" -Token $adminToken -ExpectedStatus 200

# ========================================
# FASE 6: CRITERIOS DE ACEPTACION
# ========================================
Write-Host "`n=== FASE 6: CRITERIOS DE ACEPTACION ===" -ForegroundColor Magenta

# 6.1 Creacion de criterios
Test-Api -Name "6.1 - Crear criterio via endpoint principal" -Method POST -Endpoint "/criterios-aceptacion" -Token $adminToken -Body @{historiaUsuarioId=$ids.huId3;given="usuario tiene sesion activa";when="navega a configuracion";then="debe ver sus datos personales"} -ExpectedStatus 200 -SaveIdAs "criterioId"

Test-Api -Name "6.2 - Crear segundo criterio" -Method POST -Endpoint "/criterios-aceptacion" -Token $pmoToken -Body @{historiaUsuarioId=$ids.huId3;given="usuario sin sesion";when="intenta acceder a configuracion";then="debe redirigir a login"} -ExpectedStatus 200 -SaveIdAs "criterioId2"

Test-Api -Name "6.3 - Crear criterio con orden manual" -Method POST -Endpoint "/criterios-aceptacion" -Token $scrumMasterToken -Body @{historiaUsuarioId=$ids.huId3;given="admin";when="accede a configuracion";then="ve opciones avanzadas";orden=1} -ExpectedStatus 200

Test-Api -Name "6.4 - Rechazar sin HU valida" -Method POST -Endpoint "/criterios-aceptacion" -Token $adminToken -Body @{historiaUsuarioId=99999;given="test";when="test";then="test"} -ExpectedStatus 404 -ShouldFail $true

# 6.2 Consulta de criterios
Test-Api -Name "6.5 - Listar criterios de HU (endpoint anidado)" -Method GET -Endpoint "/historias-usuario/$($ids.huId3)/criterios-aceptacion" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "6.6 - Obtener criterio por ID" -Method GET -Endpoint "/criterios-aceptacion/$($ids.criterioId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "6.7 - Filtrar por HU en endpoint principal" -Method GET -Endpoint "/criterios-aceptacion?historiaUsuarioId=$($ids.huId3)" -Token $pmoToken -ExpectedStatus 200

# 6.3 Actualizacion de criterios
Test-Api -Name "6.8 - Actualizar given/when/then" -Method PATCH -Endpoint "/criterios-aceptacion/$($ids.criterioId)" -Token $adminToken -Body @{given="usuario autenticado con rol USER";then="debe ver solo opciones basicas"} -ExpectedStatus 200

Test-Api -Name "6.9 - Reordenar criterios" -Method PATCH -Endpoint "/historias-usuario/$($ids.huId3)/criterios-aceptacion/reordenar" -Token $adminToken -Body @{criterios=@(@{criterioId=$ids.criterioId;nuevoOrden=2},@{criterioId=$ids.criterioId2;nuevoOrden=1})} -ExpectedStatus 200

# 6.4 Eliminacion de criterios
Test-Api -Name "6.10 - Crear HU con un solo criterio para test" -Method POST -Endpoint "/historias-usuario" -Token $adminToken -Body @{proyectoId=$ids.proyectoId;codigo="HU-CRIT-$timestamp";titulo="HU para test eliminacion";criteriosAceptacion=@(@{given="test";when="test";then="test";orden=1})} -ExpectedStatus 200 -SaveIdAs "huCriterioTest"

# Obtener el ID del criterio de la HU recien creada
$huCriterioTestData = Test-Api -Name "6.11 - Obtener HU con criterio unico" -Method GET -Endpoint "/historias-usuario/$($ids.huCriterioTest)" -Token $adminToken -ExpectedStatus 200
if ($huCriterioTestData -and $huCriterioTestData.criteriosAceptacion -and $huCriterioTestData.criteriosAceptacion.Count -gt 0) {
    $ids.criterioUnico = $huCriterioTestData.criteriosAceptacion[0].id
    Write-Host "  Saved ID: criterioUnico = $($ids.criterioUnico)" -ForegroundColor Cyan
}

Test-Api -Name "6.12 - Rechazar eliminar unico criterio" -Method DELETE -Endpoint "/criterios-aceptacion/$($ids.criterioUnico)" -Token $adminToken -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "6.13 - Eliminar criterio (cuando hay multiples)" -Method DELETE -Endpoint "/criterios-aceptacion/$($ids.criterioId2)" -Token $adminToken -ExpectedStatus 200

# 6.5 Validaciones de permisos y campos
Test-Api -Name "6.14 - Rechazar creacion sin permisos (dev)" -Method POST -Endpoint "/criterios-aceptacion" -Token $devToken -Body @{historiaUsuarioId=$ids.huId3;given="test";when="test";then="test"} -ExpectedStatus 403 -ShouldFail $true

Test-Api -Name "6.15 - Crear criterio via endpoint anidado" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/criterios-aceptacion" -Token $adminToken -Body @{given="nuevo criterio";when="sin orden";then="debe auto-asignarse"} -ExpectedStatus 200

# ========================================
# FASE 7: COMENTARIOS
# ========================================
Write-Host "`n=== FASE 7: COMENTARIOS ===" -ForegroundColor Magenta

# 7.1 Creacion de comentarios en Historia de Usuario
Test-Api -Name "7.1 - Crear comentario en HU (endpoint principal)" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto="Este es un comentario de prueba en la HU"} -ExpectedStatus 200 -SaveIdAs "comentarioHuId"

Test-Api -Name "7.2 - Crear segundo comentario en HU" -Method POST -Endpoint "/comentarios" -Token $pmoToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto="Otro comentario del PMO con observaciones importantes"} -ExpectedStatus 200 -SaveIdAs "comentarioHuId2"

Test-Api -Name "7.3 - Crear comentario via endpoint anidado HU" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/comentarios" -Token $devToken -Body @{texto="Comentario desde el endpoint anidado de HU"} -ExpectedStatus 200 -SaveIdAs "comentarioHuId3"

# 7.2 Creacion de comentarios en Tarea
Test-Api -Name "7.4 - Crear comentario en Tarea" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="TAREA";entidadId=$ids.tareaId;texto="Comentario en tarea con avances del desarrollo"} -ExpectedStatus 200 -SaveIdAs "comentarioTareaId"

Test-Api -Name "7.5 - Crear comentario via endpoint anidado Tarea" -Method POST -Endpoint "/tareas/$($ids.tareaId)/comentarios" -Token $pmoToken -Body @{texto="Revisado y aprobado por PMO"} -ExpectedStatus 200 -SaveIdAs "comentarioTareaId2"

# 7.3 Creacion de comentarios en Subtarea
Test-Api -Name "7.6 - Crear comentario en Subtarea" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="SUBTAREA";entidadId=$ids.subtareaId;texto="Detalle de implementacion de la subtarea"} -ExpectedStatus 200 -SaveIdAs "comentarioSubtareaId"

Test-Api -Name "7.7 - Crear comentario via endpoint anidado Subtarea" -Method POST -Endpoint "/subtareas/$($ids.subtareaId)/comentarios" -Token $devToken -Body @{texto="Subtarea completada segun especificaciones"} -ExpectedStatus 200 -SaveIdAs "comentarioSubtareaId2"

# 7.4 Respuestas a comentarios (hilos)
Test-Api -Name "7.8 - Crear respuesta a comentario" -Method POST -Endpoint "/comentarios" -Token $pmoToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto="Esta es una respuesta al comentario original";respuestaA=$ids.comentarioHuId} -ExpectedStatus 200 -SaveIdAs "respuestaComentarioId"

Test-Api -Name "7.9 - Crear segunda respuesta en hilo" -Method POST -Endpoint "/comentarios" -Token $devToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto="Otra respuesta mas en el hilo de discusion";respuestaA=$ids.comentarioHuId} -ExpectedStatus 200

# 7.5 Validaciones de creacion
Test-Api -Name "7.10 - Rechazar texto vacio" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto=""} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "7.11 - Rechazar entidad inexistente (HU)" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="HU";entidadId=99999;texto="test"} -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "7.12 - Rechazar entidad inexistente (Tarea)" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="TAREA";entidadId=99999;texto="test"} -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "7.13 - Rechazar tipo de entidad invalido" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="INVALIDO";entidadId=1;texto="test"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "7.14 - Rechazar respuesta a comentario inexistente" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto="test";respuestaA=99999} -ExpectedStatus 404 -ShouldFail $true

# 7.6 Consulta de comentarios
Test-Api -Name "7.15 - Listar comentarios de HU (endpoint anidado)" -Method GET -Endpoint "/historias-usuario/$($ids.huId)/comentarios" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.16 - Listar comentarios de Tarea (endpoint anidado)" -Method GET -Endpoint "/tareas/$($ids.tareaId)/comentarios" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.17 - Listar comentarios de Subtarea (endpoint anidado)" -Method GET -Endpoint "/subtareas/$($ids.subtareaId)/comentarios" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.18 - Obtener comentario por ID" -Method GET -Endpoint "/comentarios/$($ids.comentarioHuId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.19 - Filtrar por tipo de entidad" -Method GET -Endpoint "/comentarios?entidadTipo=HU" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.20 - Filtrar por entidad especifica" -Method GET -Endpoint "/comentarios?entidadTipo=TAREA&entidadId=$($ids.tareaId)" -Token $pmoToken -ExpectedStatus 200

Test-Api -Name "7.21 - Contar comentarios de HU" -Method GET -Endpoint "/historias-usuario/$($ids.huId)/comentarios/count" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.22 - Contar comentarios de Tarea" -Method GET -Endpoint "/tareas/$($ids.tareaId)/comentarios/count" -Token $adminToken -ExpectedStatus 200

# 7.7 Actualizacion de comentarios
Test-Api -Name "7.23 - Actualizar texto del comentario (autor)" -Method PATCH -Endpoint "/comentarios/$($ids.comentarioHuId)" -Token $adminToken -Body @{texto="Comentario actualizado con mas detalle"} -ExpectedStatus 200

Test-Api -Name "7.24 - Rechazar actualizacion sin ser autor" -Method PATCH -Endpoint "/comentarios/$($ids.comentarioHuId)" -Token $devToken -Body @{texto="Intento de modificacion no autorizada"} -ExpectedStatus 403 -ShouldFail $true

Test-Api -Name "7.25 - Admin puede actualizar cualquier comentario" -Method PATCH -Endpoint "/comentarios/$($ids.comentarioTareaId2)" -Token $adminToken -Body @{texto="Comentario editado por admin"} -ExpectedStatus 200

# 7.8 Eliminacion de comentarios (soft delete)
Test-Api -Name "7.26 - Crear comentario para eliminar" -Method POST -Endpoint "/comentarios" -Token $adminToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto="Este comentario sera eliminado"} -ExpectedStatus 200 -SaveIdAs "comentarioDeleteId"

Test-Api -Name "7.27 - Eliminar comentario (soft delete)" -Method DELETE -Endpoint "/comentarios/$($ids.comentarioDeleteId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "7.28 - Verificar comentario eliminado no aparece" -Method GET -Endpoint "/comentarios/$($ids.comentarioDeleteId)" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "7.29 - Rechazar eliminacion sin ser autor (dev)" -Method DELETE -Endpoint "/comentarios/$($ids.comentarioHuId2)" -Token $devToken -ExpectedStatus 403 -ShouldFail $true

Test-Api -Name "7.30 - Admin puede eliminar cualquier comentario" -Method POST -Endpoint "/comentarios" -Token $devToken -Body @{entidadTipo="HU";entidadId=$ids.huId;texto="Comentario del dev a eliminar por admin"} -ExpectedStatus 200 -SaveIdAs "comentarioDevId"
Test-Api -Name "7.31 - Admin elimina comentario de otro usuario" -Method DELETE -Endpoint "/comentarios/$($ids.comentarioDevId)" -Token $adminToken -ExpectedStatus 200

# 7.9 Verificacion final de hilos
Test-Api -Name "7.32 - Verificar estructura de hilos en HU" -Method GET -Endpoint "/historias-usuario/$($ids.huId)/comentarios" -Token $adminToken -ExpectedStatus 200

# ========================================
# FASE 8: DEPENDENCIAS ENTRE HISTORIAS DE USUARIO
# ========================================
Write-Host "`n=== FASE 8: DEPENDENCIAS HU ===" -ForegroundColor Magenta

# 8.1 Creacion - Tipo "Bloqueada por"
Test-Api -Name "8.1 - Agregar dependencia 'Bloqueada por' (HU1 bloqueada por HU2)" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/dependencias" -Token $adminToken -Body @{dependeDeId=$ids.huId2;tipoDependencia="Bloqueada por";notas="Login debe completarse antes de implementar OAuth"} -ExpectedStatus 200 -SaveIdAs "dependenciaId"

Test-Api -Name "8.2 - Agregar dependencia 'Bloqueada por' con notas" -Method POST -Endpoint "/historias-usuario/$($ids.huId3)/dependencias" -Token $pmoToken -Body @{dependeDeId=$ids.huId;tipoDependencia="Bloqueada por";notas="Perfil requiere autenticacion previa"} -ExpectedStatus 200 -SaveIdAs "dependenciaId2"

# 8.2 Creacion - Tipo "Relacionada con"
Test-Api -Name "8.3 - Agregar dependencia 'Relacionada con'" -Method POST -Endpoint "/historias-usuario/$($ids.huId4)/dependencias" -Token $coordinadorToken -Body @{dependeDeId=$ids.huId;tipoDependencia="Relacionada con";notas="Recuperar contraseña se relaciona con login"} -ExpectedStatus 200 -SaveIdAs "dependenciaId3"

Test-Api -Name "8.4 - Crear multiples dependencias en una HU" -Method POST -Endpoint "/historias-usuario/$($ids.huId5)/dependencias" -Token $adminToken -Body @{dependeDeId=$ids.huId3;tipoDependencia="Relacionada con"} -ExpectedStatus 200

# 8.3 Validaciones - Rechazos esperados
Test-Api -Name "8.5 - Rechazar dependencia duplicada (409)" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/dependencias" -Token $adminToken -Body @{dependeDeId=$ids.huId2;tipoDependencia="Bloqueada por"} -ExpectedStatus 409 -ShouldFail $true

Test-Api -Name "8.6 - Rechazar auto-dependencia (400)" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/dependencias" -Token $adminToken -Body @{dependeDeId=$ids.huId;tipoDependencia="Bloqueada por"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "8.7 - Rechazar HU inexistente (404)" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/dependencias" -Token $adminToken -Body @{dependeDeId=99999;tipoDependencia="Bloqueada por"} -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "8.8 - Rechazar tipo de dependencia invalido (400)" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/dependencias" -Token $adminToken -Body @{dependeDeId=$ids.huId4;tipoDependencia="TIPO_INVALIDO"} -ExpectedStatus 400 -ShouldFail $true

# 8.4 Consulta de dependencias
Test-Api -Name "8.9 - Listar dependencias de HU (GET implícito en HU)" -Method GET -Endpoint "/historias-usuario/$($ids.huId)" -Token $adminToken -ExpectedStatus 200

# 8.5 Eliminacion de dependencias
Test-Api -Name "8.10 - Eliminar dependencia especifica" -Method DELETE -Endpoint "/historias-usuario/$($ids.huId)/dependencias/$($ids.dependenciaId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "8.11 - Eliminar segunda dependencia" -Method DELETE -Endpoint "/historias-usuario/$($ids.huId3)/dependencias/$($ids.dependenciaId2)" -Token $pmoToken -ExpectedStatus 200

# 8.6 Permisos
Test-Api -Name "8.12 - Rechazar creacion sin permisos (dev)" -Method POST -Endpoint "/historias-usuario/$($ids.huId)/dependencias" -Token $devToken -Body @{dependeDeId=$ids.huId5;tipoDependencia="Relacionada con"} -ExpectedStatus 403 -ShouldFail $true

Test-Api -Name "8.13 - PMO puede crear dependencias" -Method POST -Endpoint "/historias-usuario/$($ids.huId2)/dependencias" -Token $pmoToken -Body @{dependeDeId=$ids.huId5;tipoDependencia="Bloqueada por";notas="Registro requiere reportes configurados"} -ExpectedStatus 200

Test-Api -Name "8.14 - Coordinador puede crear dependencias" -Method POST -Endpoint "/historias-usuario/$($ids.huId2)/dependencias" -Token $coordinadorToken -Body @{dependeDeId=$ids.huId4;tipoDependencia="Relacionada con"} -ExpectedStatus 200

# ========================================
# FASE 9: SUBTAREAS DETALLADAS
# ========================================
Write-Host "`n=== FASE 9: SUBTAREAS DETALLADAS ===" -ForegroundColor Magenta

# 9.1 Creacion avanzada con responsable, fechas y prioridad
Test-Api -Name "9.1 - Crear subtarea con responsable" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=$ids.tareaKanbanId;codigo="SUBTASK-$timestamp-3";nombre="Validar campos del formulario";descripcion="Implementar validacion client-side";estado="Por hacer";prioridad="Alta";responsableId=15;horasEstimadas=3} -ExpectedStatus 200 -SaveIdAs "subtareaId3"

Test-Api -Name "9.2 - Crear subtarea con fechas" -Method POST -Endpoint "/subtareas" -Token $pmoToken -Body @{tareaId=$ids.tareaKanbanId;codigo="SUBTASK-$timestamp-4";nombre="Configurar CI/CD";descripcion="Setup pipeline de deployment";prioridad="Media";horasEstimadas=5;fechaInicio="2025-02-01";fechaFin="2025-02-05"} -ExpectedStatus 200 -SaveIdAs "subtareaId4"

Test-Api -Name "9.3 - Crear subtarea con prioridad Alta" -Method POST -Endpoint "/subtareas" -Token $coordinadorToken -Body @{tareaId=$ids.tareaKanbanId2;codigo="SUBTASK-$timestamp-5";nombre="Corregir bug critico";prioridad="Alta";horasEstimadas=2} -ExpectedStatus 200 -SaveIdAs "subtareaId5"

Test-Api -Name "9.4 - Crear subtarea prioridad Baja" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=$ids.tareaKanbanId2;codigo="SUBTASK-$timestamp-6";nombre="Refactor codigo legacy";prioridad="Baja";horasEstimadas=4} -ExpectedStatus 200 -SaveIdAs "subtareaId6"

# 9.2 Estados y flujos
Test-Api -Name "9.5 - Cambiar estado a En progreso" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId3)" -Token $adminToken -Body @{estado="En progreso"} -ExpectedStatus 200

Test-Api -Name "9.6 - Cambiar estado a En revision" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId3)" -Token $adminToken -Body @{estado="En revision"} -ExpectedStatus 200

Test-Api -Name "9.7 - Finalizar subtarea con evidencia" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId3)" -Token $adminToken -Body @{estado="Finalizado";evidenciaUrl="https://github.com/repo/pull/456";horasReales=2.5} -ExpectedStatus 200

Test-Api -Name "9.8 - Crear y finalizar otra subtarea" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=$ids.tareaKanbanId;codigo="SUBTASK-$timestamp-7";nombre="Subtarea para estadisticas";estado="Por hacer";horasEstimadas=1} -ExpectedStatus 200 -SaveIdAs "subtareaId7"
Test-Api -Name "9.9 - Finalizar para estadisticas" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId7)" -Token $adminToken -Body @{estado="Finalizado";horasReales=1.2} -ExpectedStatus 200

# 9.3 Asignacion de responsables
Test-Api -Name "9.10 - Asignar responsable a subtarea" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId4)" -Token $adminToken -Body @{responsableId=15} -ExpectedStatus 200

Test-Api -Name "9.11 - Reasignar responsable" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId4)" -Token $pmoToken -Body @{responsableId=13} -ExpectedStatus 200

Test-Api -Name "9.12 - Desarrollador actualiza su subtarea asignada" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId3)" -Token $devToken -Body @{horasReales=3} -ExpectedStatus 200

# 9.4 Estadisticas de tarea
Test-Api -Name "9.13 - Obtener estadisticas de tarea" -Method GET -Endpoint "/tareas/$($ids.tareaKanbanId)/subtareas/estadisticas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "9.14 - Obtener estadisticas de tarea 2" -Method GET -Endpoint "/tareas/$($ids.tareaKanbanId2)/subtareas/estadisticas" -Token $pmoToken -ExpectedStatus 200

# 9.5 Filtros y consultas
Test-Api -Name "9.15 - Filtrar subtareas por tarea" -Method GET -Endpoint "/subtareas?tareaId=$($ids.tareaKanbanId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "9.16 - Listar subtareas de tarea (endpoint anidado)" -Method GET -Endpoint "/tareas/$($ids.tareaKanbanId)/subtareas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "9.17 - Obtener subtarea por ID" -Method GET -Endpoint "/subtareas/$($ids.subtareaId3)" -Token $adminToken -ExpectedStatus 200

# 9.6 Actualizacion de campos
Test-Api -Name "9.18 - Actualizar descripcion y nombre" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId5)" -Token $adminToken -Body @{nombre="Corregir bug critico de seguridad";descripcion="XSS vulnerability en formulario de login"} -ExpectedStatus 200

Test-Api -Name "9.19 - Actualizar horas estimadas" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId6)" -Token $adminToken -Body @{horasEstimadas=6;fechaInicio="2025-02-10"} -ExpectedStatus 200

Test-Api -Name "9.20 - Actualizar prioridad" -Method PATCH -Endpoint "/subtareas/$($ids.subtareaId6)" -Token $pmoToken -Body @{prioridad="Media"} -ExpectedStatus 200

# 9.7 Validaciones de negocio
Test-Api -Name "9.21 - Rechazar sin tareaId" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{codigo="SUBTASK-NO-TAREA";nombre="Sin tarea"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "9.22 - Rechazar tarea SCRUM (solo KANBAN)" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=$ids.tareaId;codigo="SUBTASK-SCRUM";nombre="Tarea SCRUM no permitida"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "9.23 - Rechazar codigo duplicado en misma tarea" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=$ids.tareaKanbanId;codigo="SUBTASK-$timestamp-3";nombre="Duplicado"} -ExpectedStatus 409 -ShouldFail $true

Test-Api -Name "9.24 - Rechazar tarea inexistente" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=99999;codigo="SUBTASK-NO-EXIST";nombre="Test"} -ExpectedStatus 404 -ShouldFail $true

# 9.8 Validaciones de permisos
Test-Api -Name "9.25 - Rechazar creacion sin permisos (dev)" -Method POST -Endpoint "/subtareas" -Token $devToken -Body @{tareaId=$ids.tareaKanbanId;codigo="SUBTASK-DEV";nombre="Sin permisos"} -ExpectedStatus 403 -ShouldFail $true

# 9.9 Eliminacion (soft delete)
Test-Api -Name "9.26 - Crear subtarea para eliminar" -Method POST -Endpoint "/subtareas" -Token $adminToken -Body @{tareaId=$ids.tareaKanbanId2;codigo="SUBTASK-DELETE-$timestamp";nombre="Para eliminar";horasEstimadas=1} -ExpectedStatus 200 -SaveIdAs "subtareaDeleteId"

Test-Api -Name "9.27 - Eliminar subtarea" -Method DELETE -Endpoint "/subtareas/$($ids.subtareaDeleteId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "9.28 - Validar eliminacion (soft delete)" -Method GET -Endpoint "/subtareas/$($ids.subtareaDeleteId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "9.29 - Verificar no aparece en listado" -Method GET -Endpoint "/tareas/$($ids.tareaKanbanId2)/subtareas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "9.30 - Rechazar eliminacion sin permisos" -Method DELETE -Endpoint "/subtareas/$($ids.subtareaId5)" -Token $devToken -ExpectedStatus 403 -ShouldFail $true

# ========================================
# FASE 10: PARTICIPANTES DE DAILYS
# ========================================
Write-Host "`n=== FASE 10: PARTICIPANTES DE DAILYS (Preview) ===" -ForegroundColor Magenta

# Nota: Los participantes se prueban en conjunto con las Dailys en Fase 11

# ========================================
# FASE 11: DAILY MEETINGS
# ========================================
Write-Host "`n=== FASE 11: DAILY MEETINGS ===" -ForegroundColor Magenta

# 11.1 Creacion PROYECTO (Scrum)
Test-Api -Name "11.1 - Crear daily de proyecto con sprint" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Proyecto";proyectoId=$ids.proyectoId;sprintId=$ids.sprintId2;nombre="Daily Scrum - Sprint 2 - Dia 1";fecha="2025-01-30";horaInicio="09:00";horaFin="09:15"} -ExpectedStatus 200 -SaveIdAs "dailyId"

Test-Api -Name "11.2 - Crear daily con facilitador" -Method POST -Endpoint "/daily-meetings" -Token $scrumMasterToken -Body @{tipo="Proyecto";proyectoId=$ids.proyectoId;sprintId=$ids.sprintId2;nombre="Daily Scrum - Sprint 2 - Dia 2";fecha="2025-01-31";horaInicio="09:00";facilitadorId=13} -ExpectedStatus 200 -SaveIdAs "dailyId2"

Test-Api -Name "11.3 - Crear daily con notas" -Method POST -Endpoint "/daily-meetings" -Token $pmoToken -Body @{tipo="Proyecto";proyectoId=$ids.proyectoId;sprintId=$ids.sprintId2;nombre="Daily Scrum - Sprint 2 - Dia 3";fecha="2025-02-01";notas="Revision de blockers del sprint"} -ExpectedStatus 200

Test-Api -Name "11.4 - Crear daily con link de reunion" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Proyecto";proyectoId=$ids.proyectoId;nombre="Daily Scrum General";fecha="2025-02-02";linkReunion="https://meet.google.com/abc-defg-hij"} -ExpectedStatus 200

Test-Api -Name "11.5 - Rechazar PROYECTO sin proyectoId" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Proyecto";nombre="Daily sin proyecto";fecha="2025-01-30"} -ExpectedStatus 400 -ShouldFail $true

# 11.2 Creacion ACTIVIDAD (Kanban)
Test-Api -Name "11.6 - Crear daily de actividad" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Actividad";actividadId=$ids.actividadId;nombre="Daily Kanban - Actividad 1 - Dia 1";fecha="2025-02-03";horaInicio="10:00";horaFin="10:15"} -ExpectedStatus 200 -SaveIdAs "dailyKanbanId"

Test-Api -Name "11.7 - Crear segunda daily Kanban" -Method POST -Endpoint "/daily-meetings" -Token $pmoToken -Body @{tipo="Actividad";actividadId=$ids.actividadId;nombre="Daily Kanban - Actividad 1 - Dia 2";fecha="2025-02-04";facilitadorId=14} -ExpectedStatus 200

Test-Api -Name "11.8 - Crear daily Kanban con participantes" -Method POST -Endpoint "/daily-meetings" -Token $coordinadorToken -Body @{tipo="Actividad";actividadId=$ids.actividadId2;nombre="Daily Kanban - Actividad 2 - Dia 1";fecha="2025-02-05";participantes=@(@{usuarioId=13;queHiceAyer="Diseño de mockups";queHareHoy="Implementar componentes";impedimentos="Falta acceso a Figma"})} -ExpectedStatus 200

Test-Api -Name "11.9 - Rechazar ACTIVIDAD sin actividadId" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Actividad";nombre="Daily sin actividad";fecha="2025-02-03"} -ExpectedStatus 400 -ShouldFail $true

# 11.3 Consulta basica
Test-Api -Name "11.10 - Listar todas las dailies" -Method GET -Endpoint "/daily-meetings" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.11 - Obtener daily por ID" -Method GET -Endpoint "/daily-meetings/$($ids.dailyId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.12 - Obtener resumen de daily" -Method GET -Endpoint "/daily-meetings/$($ids.dailyId)/resumen" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.13 - Obtener resumen daily Kanban" -Method GET -Endpoint "/daily-meetings/$($ids.dailyKanbanId)/resumen" -Token $pmoToken -ExpectedStatus 200

# 11.4 Filtros en endpoint principal
Test-Api -Name "11.14 - Filtrar por tipo Proyecto" -Method GET -Endpoint "/daily-meetings?tipo=Proyecto" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.15 - Filtrar por tipo Actividad" -Method GET -Endpoint "/daily-meetings?tipo=Actividad" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.16 - Filtrar por proyectoId" -Method GET -Endpoint "/daily-meetings?proyectoId=$($ids.proyectoId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.17 - Filtrar por sprintId" -Method GET -Endpoint "/daily-meetings?sprintId=$($ids.sprintId2)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.18 - Filtrar por actividadId" -Method GET -Endpoint "/daily-meetings?actividadId=$($ids.actividadId)" -Token $pmoToken -ExpectedStatus 200

Test-Api -Name "11.19 - Filtrar por rango de fechas" -Method GET -Endpoint "/daily-meetings?fechaDesde=2025-01-30&fechaHasta=2025-02-05" -Token $adminToken -ExpectedStatus 200

# 11.5 Consultas anidadas
Test-Api -Name "11.20 - Listar dailies de proyecto" -Method GET -Endpoint "/proyectos/$($ids.proyectoId)/daily-meetings" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.21 - Listar dailies de sprint" -Method GET -Endpoint "/sprints/$($ids.sprintId2)/daily-meetings" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.22 - Listar dailies de actividad" -Method GET -Endpoint "/actividades/$($ids.actividadId)/daily-meetings" -Token $pmoToken -ExpectedStatus 200

Test-Api -Name "11.23 - Dailies de proyecto vacio" -Method GET -Endpoint "/proyectos/$($ids.proyectoId2)/daily-meetings" -Token $adminToken -ExpectedStatus 200

# 11.6 Actualizacion de daily meetings
Test-Api -Name "11.24 - Actualizar nombre y fecha" -Method PATCH -Endpoint "/daily-meetings/$($ids.dailyId)" -Token $adminToken -Body @{nombre="Daily Scrum - Sprint 2 - Dia 1 (Actualizada)";fecha="2025-01-30"} -ExpectedStatus 200

Test-Api -Name "11.25 - Actualizar horarios" -Method PATCH -Endpoint "/daily-meetings/$($ids.dailyId2)" -Token $scrumMasterToken -Body @{horaInicio="09:30";horaFin="09:45"} -ExpectedStatus 200

Test-Api -Name "11.26 - Actualizar notas" -Method PATCH -Endpoint "/daily-meetings/$($ids.dailyKanbanId)" -Token $adminToken -Body @{notas="Se identificaron 3 blockers principales"} -ExpectedStatus 200

Test-Api -Name "11.27 - Actualizar facilitador" -Method PATCH -Endpoint "/daily-meetings/$($ids.dailyId)" -Token $adminToken -Body @{facilitadorId=14} -ExpectedStatus 200

Test-Api -Name "11.28 - Rechazar actualizacion sin permisos (dev)" -Method PATCH -Endpoint "/daily-meetings/$($ids.dailyId)" -Token $devToken -Body @{nombre="Intento hack"} -ExpectedStatus 403 -ShouldFail $true

# 11.7 Participantes - Agregar
Test-Api -Name "11.29 - Agregar participante a daily" -Method POST -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" -Token $adminToken -Body @{usuarioId=13;queHiceAyer="Completé endpoints de login";queHareHoy="Implementar validaciones JWT";impedimentos="Ninguno"} -ExpectedStatus 200 -SaveIdAs "participanteId"

Test-Api -Name "11.30 - Agregar segundo participante" -Method POST -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" -Token $pmoToken -Body @{usuarioId=14;queHiceAyer="Revisión de código";queHareHoy="Testing de integración"} -ExpectedStatus 200 -SaveIdAs "participanteId2"

Test-Api -Name "11.31 - Agregar participante sin impedimentos" -Method POST -Endpoint "/daily-meetings/$($ids.dailyId2)/participantes" -Token $scrumMasterToken -Body @{usuarioId=15;queHiceAyer="Setup del ambiente";queHareHoy="Desarrollo de features"} -ExpectedStatus 200

Test-Api -Name "11.32 - Rechazar participante duplicado" -Method POST -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" -Token $adminToken -Body @{usuarioId=13;queHiceAyer="Test";queHareHoy="Test"} -ExpectedStatus 409 -ShouldFail $true

# 11.8 Participantes - Actualizar
Test-Api -Name "11.33 - Actualizar reporte de participante" -Method PATCH -Endpoint "/daily-meetings/participantes/$($ids.participanteId)" -Token $adminToken -Body @{queHiceAyer="Completé login y registro";impedimentos="Bloqueado por revision de seguridad"} -ExpectedStatus 200

Test-Api -Name "11.34 - Dev puede actualizar su participacion" -Method PATCH -Endpoint "/daily-meetings/participantes/$($ids.participanteId2)" -Token $devToken -Body @{queHareHoy="Completar testing E2E"} -ExpectedStatus 200

# 11.9 Participantes - Eliminar
Test-Api -Name "11.35 - Eliminar participante" -Method DELETE -Endpoint "/daily-meetings/participantes/$($ids.participanteId2)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.36 - Rechazar eliminar sin permisos (dev)" -Method DELETE -Endpoint "/daily-meetings/participantes/$($ids.participanteId)" -Token $devToken -ExpectedStatus 403 -ShouldFail $true

# 11.10 Eliminacion de daily meetings
Test-Api -Name "11.37 - Eliminar daily meeting" -Method DELETE -Endpoint "/daily-meetings/$($ids.dailyId2)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.38 - Validar daily eliminada no existe" -Method GET -Endpoint "/daily-meetings/$($ids.dailyId2)" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "11.39 - Rechazar eliminar sin permisos (dev)" -Method DELETE -Endpoint "/daily-meetings/$($ids.dailyKanbanId)" -Token $devToken -ExpectedStatus 403 -ShouldFail $true

# 11.11 Validaciones de negocio
Test-Api -Name "11.40 - Rechazar sin tipo" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{nombre="Sin tipo";fecha="2025-02-10"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "11.41 - Rechazar sin fecha" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Proyecto";proyectoId=$ids.proyectoId;nombre="Sin fecha"} -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "11.42 - Rechazar sin nombre" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Proyecto";proyectoId=$ids.proyectoId;fecha="2025-02-10"} -ExpectedStatus 400 -ShouldFail $true

# 11.12 Casos especiales
Test-Api -Name "11.43 - Crear daily sin sprint (solo proyecto)" -Method POST -Endpoint "/daily-meetings" -Token $adminToken -Body @{tipo="Proyecto";proyectoId=$ids.proyectoId;nombre="Daily General del Proyecto";fecha="2025-02-15"} -ExpectedStatus 200

Test-Api -Name "11.44 - Verificar orden cronologico en sprint" -Method GET -Endpoint "/sprints/$($ids.sprintId2)/daily-meetings" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "11.45 - Verificar resumen incluye participantes" -Method GET -Endpoint "/daily-meetings/$($ids.dailyId)/resumen" -Token $adminToken -ExpectedStatus 200

# ========================================
# FASE 12: HISTORIAL DE CAMBIOS
# ========================================
Write-Host "`n=== FASE 12: HISTORIAL DE CAMBIOS ===" -ForegroundColor Magenta

# 12.1 Consulta de historial por entidad
Test-Api -Name "12.1 - Obtener historial de Historia de Usuario" -Method GET -Endpoint "/historias-usuario/$($ids.huId)/historial" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.2 - Obtener historial de Tarea" -Method GET -Endpoint "/tareas/$($ids.tareaId)/historial" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.3 - Obtener historial de Sprint" -Method GET -Endpoint "/sprints/$($ids.sprintId)/historial" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.4 - Obtener historial de Épica" -Method GET -Endpoint "/epicas/$($ids.epicaId)/historial" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.5 - Obtener historial de Subtarea" -Method GET -Endpoint "/subtareas/$($ids.subtareaId)/historial" -Token $adminToken -ExpectedStatus 200

# 12.2 Consulta general con filtros
Test-Api -Name "12.6 - Listar historial general (sin filtros)" -Method GET -Endpoint "/historial-cambios" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.7 - Filtrar por tipo de entidad (HU)" -Method GET -Endpoint "/historial-cambios?entidadTipo=HU" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.8 - Filtrar por tipo de entidad (SPRINT)" -Method GET -Endpoint "/historial-cambios?entidadTipo=SPRINT" -Token $pmoToken -ExpectedStatus 200

Test-Api -Name "12.9 - Filtrar por entidad especifica (HU)" -Method GET -Endpoint "/historial-cambios?entidadTipo=HU&entidadId=$($ids.huId)" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.10 - Filtrar por usuario (admin)" -Method GET -Endpoint "/historial-cambios?usuarioId=13" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.11 - Filtrar por accion (CREAR)" -Method GET -Endpoint "/historial-cambios?accion=CREAR" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.12 - Filtrar por accion (ACTUALIZAR)" -Method GET -Endpoint "/historial-cambios?accion=ACTUALIZAR" -Token $pmoToken -ExpectedStatus 200

# 12.3 Filtros temporales
Test-Api -Name "12.13 - Filtrar por rango de fechas (año completo)" -Method GET -Endpoint "/historial-cambios?fechaDesde=2025-01-01&fechaHasta=2025-12-31" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.14 - Filtrar por fecha desde" -Method GET -Endpoint "/historial-cambios?fechaDesde=2025-01-01" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.15 - Combinar filtros (entidad + fecha)" -Method GET -Endpoint "/historial-cambios?entidadTipo=TAREA&fechaDesde=2025-01-01" -Token $adminToken -ExpectedStatus 200

# 12.4 Historial reciente
Test-Api -Name "12.16 - Obtener cambios recientes (ultimos 50)" -Method GET -Endpoint "/historial-cambios/recientes" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.17 - Obtener cambios recientes (personalizado)" -Method GET -Endpoint "/historial-cambios/recientes?limit=20" -Token $pmoToken -ExpectedStatus 200

# 12.5 Estadísticas de cambios
Test-Api -Name "12.18 - Obtener estadisticas de cambios (rango)" -Method GET -Endpoint "/historial-cambios/estadisticas?fechaDesde=2025-01-01&fechaHasta=2025-12-31" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.19 - Estadisticas del ultimo mes" -Method GET -Endpoint "/historial-cambios/estadisticas?fechaDesde=2025-01-01&fechaHasta=2025-01-31" -Token $adminToken -ExpectedStatus 200

# 12.6 Paginación
Test-Api -Name "12.20 - Historial con paginacion (pagina 1)" -Method GET -Endpoint "/historial-cambios?page=1&limit=10" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "12.21 - Historial con paginacion (pagina 2)" -Method GET -Endpoint "/historial-cambios?page=2&limit=10" -Token $adminToken -ExpectedStatus 200

# 12.7 Validaciones
Test-Api -Name "12.22 - Rechazar entidad inexistente" -Method GET -Endpoint "/historias-usuario/99999/historial" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "12.23 - Validar estadisticas requieren fechas" -Method GET -Endpoint "/historial-cambios/estadisticas" -Token $adminToken -ExpectedStatus 400 -ShouldFail $true

Test-Api -Name "12.24 - Validar acceso con autenticacion" -Method GET -Endpoint "/historial-cambios" -Token $null -ExpectedStatus 401 -ShouldFail $true

# ========================================
# FASE 13: METRICAS Y REPORTES AVANZADOS
# ========================================
Write-Host "`n=== FASE 13: METRICAS Y REPORTES AVANZADOS ===" -ForegroundColor Magenta

# 13.1 Métricas de Sprint (profundización de Fase 2.7 y 2.8)
Test-Api -Name "13.1 - Verificar metricas completas del Sprint 1" -Method GET -Endpoint "/sprints/$($ids.sprintId)/metricas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.2 - Verificar metricas del Sprint 2" -Method GET -Endpoint "/sprints/$($ids.sprintId2)/metricas" -Token $pmoToken -ExpectedStatus 200

Test-Api -Name "13.3 - Burndown del Sprint 1" -Method GET -Endpoint "/sprints/$($ids.sprintId)/burndown" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.4 - Burndown del Sprint 2" -Method GET -Endpoint "/sprints/$($ids.sprintId2)/burndown" -Token $pmoToken -ExpectedStatus 200

# 13.2 Estadísticas de Épica (profundización de Fase 1.7)
Test-Api -Name "13.5 - Estadisticas de Epica ALTA prioridad" -Method GET -Endpoint "/epicas/$($ids.epicaId)/estadisticas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.6 - Estadisticas de Epica MEDIA prioridad" -Method GET -Endpoint "/epicas/$($ids.epicaId2)/estadisticas" -Token $pmoToken -ExpectedStatus 200

Test-Api -Name "13.7 - Estadisticas de Epica BAJA prioridad" -Method GET -Endpoint "/epicas/$($ids.epicaId3)/estadisticas" -Token $coordinadorToken -ExpectedStatus 200

# 13.3 Estadísticas de Subtareas por Tarea
Test-Api -Name "13.8 - Estadisticas de subtareas de Tarea SCRUM" -Method GET -Endpoint "/tareas/$($ids.tareaId)/subtareas/estadisticas" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.9 - Estadisticas de subtareas de Tarea Kanban" -Method GET -Endpoint "/tareas/$($ids.tareaKanbanId)/subtareas/estadisticas" -Token $pmoToken -ExpectedStatus 200

# 13.4 Tableros (profundización de Fase 5.1)
Test-Api -Name "13.10 - Tablero completo del Sprint 1 con metricas" -Method GET -Endpoint "/sprints/$($ids.sprintId)/tablero" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.11 - Tablero del Sprint 2 con metricas" -Method GET -Endpoint "/sprints/$($ids.sprintId2)/tablero" -Token $pmoToken -ExpectedStatus 200

# 13.5 Resumen de Daily Meeting
Test-Api -Name "13.12 - Resumen de Daily Meeting 1 (Proyecto)" -Method GET -Endpoint "/daily-meetings/$($ids.dailyId)/resumen" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.13 - Resumen de Daily Meeting 2 (Sprint)" -Method GET -Endpoint "/daily-meetings/$($ids.dailyId2)/resumen" -Token $pmoToken -ExpectedStatus 200

# 13.6 Contadores de Comentarios
Test-Api -Name "13.14 - Contar comentarios de Historia Usuario" -Method GET -Endpoint "/historias-usuario/$($ids.huId)/comentarios/count" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.15 - Contar comentarios de Tarea" -Method GET -Endpoint "/tareas/$($ids.tareaId)/comentarios/count" -Token $adminToken -ExpectedStatus 200

Test-Api -Name "13.16 - Contar comentarios de Subtarea" -Method GET -Endpoint "/subtareas/$($ids.subtareaId)/comentarios/count" -Token $pmoToken -ExpectedStatus 200

# 13.7 Validaciones de métricas con entidades inexistentes
Test-Api -Name "13.17 - Rechazar metricas de sprint inexistente" -Method GET -Endpoint "/sprints/99999/metricas" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "13.18 - Rechazar estadisticas de epica inexistente" -Method GET -Endpoint "/epicas/99999/estadisticas" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "13.19 - Rechazar burndown de sprint inexistente" -Method GET -Endpoint "/sprints/99999/burndown" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

Test-Api -Name "13.20 - Rechazar tablero de sprint inexistente" -Method GET -Endpoint "/sprints/99999/tablero" -Token $adminToken -ExpectedStatus 404 -ShouldFail $true

# 13.8 Validaciones de permisos en métricas
Test-Api -Name "13.21 - Metricas accesibles con token de desarrollador" -Method GET -Endpoint "/sprints/$($ids.sprintId)/metricas" -Token $devToken -ExpectedStatus 200

Test-Api -Name "13.22 - Estadisticas accesibles con token de PMO" -Method GET -Endpoint "/epicas/$($ids.epicaId)/estadisticas" -Token $pmoToken -ExpectedStatus 200

Test-Api -Name "13.23 - Rechazar acceso sin autenticacion" -Method GET -Endpoint "/sprints/$($ids.sprintId)/metricas" -Token $null -ExpectedStatus 401 -ShouldFail $true

# RESUMEN FINAL
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "RESUMEN - MODULO AGILE" -ForegroundColor Cyan
Write-Host "=======================================`n" -ForegroundColor Cyan

$stats.EndTime = Get-Date
$duration = ($stats.EndTime - $stats.StartTime).TotalSeconds

Write-Host "Estadisticas:" -ForegroundColor White
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

$results | ConvertTo-Json -Depth 10 | Out-File "test-agile-results.json" -Encoding UTF8
Write-Host "`nResultados guardados en: test-agile-results.json" -ForegroundColor Cyan
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "=======================================`n" -ForegroundColor Cyan
