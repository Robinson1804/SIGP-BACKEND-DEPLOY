# ================================================================
# SIGP - Simulacion de Flujo COMPLETO Kanban
# ================================================================
# Este script simula el ciclo completo de una actividad con metodologia Kanban:
# - Creacion de actividad
# - Creacion de tareas Kanban
# - Desglose en subtareas
# - Movimiento por el tablero (Por Hacer -> En Progreso -> En Revision -> Finalizado)
# - Daily meetings
# - Consulta de tablero y reportes
# ================================================================

$ErrorActionPreference = 'Continue'
$baseUrl = "http://localhost:3010/api/v1"

# ================================================================
# Colores para output
# ================================================================
function Write-Section {
    param([string]$Message)
    Write-Host "`n================================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "================================================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor Yellow
}

function Write-Error2 {
    param([string]$Message)
    Write-Host "[X] $Message" -ForegroundColor Red
}

function Write-Detail {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Gray
}

# ================================================================
# Variables globales para IDs
# ================================================================
$global:IDs = @{
    token = $null
    usuarioPMO = $null
    usuarioCoordinador = $null
    usuarioDesarrollador = $null
    accionEstrategicaId = $null
    actividadId = $null
    tareas = @()
    subtareas = @()
    dailyMeetings = @()
}

# ================================================================
# Funcion helper para hacer requests
# ================================================================
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Token = $null,
        [bool]$ShowResponse = $false
    )

    try {
        $headers = @{
            "Content-Type" = "application/json"
        }

        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }

        $url = "$baseUrl$Endpoint"

        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-RestMethod @params

        if ($ShowResponse) {
            Write-Detail ($response | ConvertTo-Json -Depth 5)
        }

        return $response
    }
    catch {
        Write-Error2 "Error en request: $($_.Exception.Message)"
        if ($_.ErrorDetails.Message) {
            Write-Detail $_.ErrorDetails.Message
        }
        return $null
    }
}

# ================================================================
# FASE 1: Autenticacion
# ================================================================
Write-Section "FASE 1: Autenticacion"

Write-Info "Intentando login como PMO..."
$loginBody = @{
    email = "pmo@inei.gob.pe"
    password = "Password123!"
}

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginBody

if ($loginResponse -and $loginResponse.data -and $loginResponse.data.accessToken) {
    $global:IDs.token = $loginResponse.data.accessToken
    $global:IDs.usuarioPMO = $loginResponse.data.user.id
    Write-Success "Login como PMO exitoso"
    Write-Detail "Usuario ID: $($loginResponse.data.user.id)"
    Write-Detail "Nombre: $($loginResponse.data.user.nombre) $($loginResponse.data.user.apellido)"
    Write-Detail "Rol: $($loginResponse.data.user.rol)"
    Write-Detail "Token obtenido: $($global:IDs.token.Substring(0, 50))..."
}
else {
    Write-Error2 "No se pudo hacer login. El script no puede continuar."
    exit 1
}

# ================================================================
# FASE 2: Preparacion (verificar datos existentes)
# ================================================================
Write-Section "FASE 2: Preparacion de Datos"

# Obtener acciones estrategicas
Write-Info "Consultando acciones estrategicas existentes..."
$accionesResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/acciones-estrategicas" -Token $global:IDs.token

if ($accionesResponse -and $accionesResponse.data -and $accionesResponse.data.Count -gt 0) {
    $global:IDs.accionEstrategicaId = $accionesResponse.data[0].id
    Write-Success "Accion Estrategica encontrada: ID $($global:IDs.accionEstrategicaId)"
    Write-Detail "Nombre: $($accionesResponse.data[0].nombre)"
}
else {
    Write-Info "No hay acciones estrategicas disponibles."
    Write-Detail "Omitiendo accionEstrategicaId (es opcional en el DTO)."
    $global:IDs.accionEstrategicaId = $null
}

# Usar IDs conocidos de usuarios de prueba
Write-Info "Configurando usuarios de prueba..."
Write-Detail "PMO: ID 5 (pmo@inei.gob.pe)"
Write-Detail "COORDINADOR: ID 16 (coordinador@inei.gob.pe)"
Write-Detail "DESARROLLADOR: ID 19 (desarrollador@inei.gob.pe)"

$global:IDs.usuarioCoordinador = 16
$global:IDs.usuarioDesarrollador = 19

Write-Success "Usuarios configurados correctamente"

# ================================================================
# FASE 3: Crear Actividad Kanban
# ================================================================
Write-Section "FASE 3: Crear Actividad con Metodologia Kanban"

# Primero verificar si ya existe una actividad de prueba
Write-Info "Verificando actividades existentes..."
$actividadesExistentes = Invoke-ApiRequest -Method "GET" -Endpoint "/actividades" -Token $global:IDs.token

$actividadExistente = $null
if ($actividadesExistentes -and $actividadesExistentes.data) {
    $actividadExistente = $actividadesExistentes.data | Where-Object { $_.codigo -eq "ACT-2025-MOD-EST" } | Select-Object -First 1
}

if ($actividadExistente) {
    Write-Success "Usando actividad existente: ID $($actividadExistente.id)"
    Write-Detail "Codigo: $($actividadExistente.codigo)"
    Write-Detail "Nombre: $($actividadExistente.nombre)"
    $global:IDs.actividadId = $actividadExistente.id
}
else {
    Write-Info "No existe actividad de prueba. Creando nueva..."

    $actividadBody = @{
        codigo = "ACT-2025-MOD-EST"
        nombre = "Modernizacion del Sistema de Estadisticas"
        descripcion = @"
Proyecto de modernizacion integral del Sistema Nacional de Estadisticas del INEI, con el objetivo de mejorar
la eficiencia en la recopilacion, procesamiento y difusion de informacion estadistica oficial.

El proyecto contempla:
- Actualizacion de la arquitectura tecnologica
- Implementacion de nuevas metodologias de captura de datos
- Desarrollo de dashboards interactivos
- Integracion con sistemas externos
- Capacitacion del personal tecnico

Este proyecto se alinea con los objetivos estrategicos institucionales de transformacion digital
y mejora continua de los servicios estadisticos nacionales.
"@
        clasificacion = "Gestion interna"
        coordinadorId = $global:IDs.usuarioCoordinador
        coordinacion = "Direccion de Tecnologia de la Informacion"
        areasFinancieras = @("1000", "2300", "5100")
        montoAnual = 75000.00
        anios = @(2025)
        fechaInicio = "2025-01-15T00:00:00Z"
        fechaFin = "2025-06-30T23:59:59Z"
        periodicidadInforme = "MENSUAL"
    }

    # Agregar accionEstrategicaId solo si existe
    if ($global:IDs.accionEstrategicaId) {
        $actividadBody.accionEstrategicaId = $global:IDs.accionEstrategicaId
    }

    Write-Info "Creando actividad..."
    $actividad = Invoke-ApiRequest -Method "POST" -Endpoint "/actividades" -Body $actividadBody -Token $global:IDs.token -ShowResponse $true

    if ($actividad -and $actividad.data -and $actividad.data.id) {
        $global:IDs.actividadId = $actividad.data.id
        Write-Success "Actividad creada exitosamente: ID $($global:IDs.actividadId)"
        Write-Detail "Codigo: $($actividad.data.codigo)"
        Write-Detail "Nombre: $($actividad.data.nombre)"
        Write-Detail "Clasificacion: $($actividad.data.clasificacion)"
        Write-Detail "Monto Anual: S/. $($actividad.data.montoAnual)"
    }
    else {
        Write-Error2 "No se pudo crear la actividad. Abortando script."
        if ($actividad) {
            Write-Detail ($actividad | ConvertTo-Json -Depth 5)
        }
        exit 1
    }
}

# ================================================================
# FASE 4: Crear Tareas Kanban
# ================================================================
Write-Section "FASE 4: Crear Tareas Kanban"

# Primero obtener tareas existentes de esta actividad
Write-Info "Consultando tareas existentes de la actividad..."
$tareasExistentesResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/actividades/$($global:IDs.actividadId)/tareas" -Token $global:IDs.token
$tareasExistentesMap = @{}

if ($tareasExistentesResponse -and $tareasExistentesResponse.data) {
    foreach ($te in $tareasExistentesResponse.data) {
        $tareasExistentesMap[$te.codigo] = $te
    }
    Write-Success "Encontradas $($tareasExistentesResponse.data.Count) tareas existentes"
}

$tareasData = @(
    @{
        codigo = "TAR-001"
        nombre = "Analisis de requerimientos tecnicos"
        descripcion = "Realizar analisis exhaustivo de requerimientos funcionales y no funcionales del sistema. Incluye entrevistas con stakeholders y documentacion tecnica."
        prioridad = "Alta"
        horasEstimadas = 40
        fechaInicio = "2025-01-15T08:00:00Z"
        fechaFin = "2025-01-22T17:00:00Z"
    },
    @{
        codigo = "TAR-002"
        nombre = "Diseno de arquitectura del sistema"
        descripcion = "Disenar la arquitectura tecnologica completa: base de datos, backend, frontend, infraestructura cloud y patrones de diseno."
        prioridad = "Alta"
        horasEstimadas = 32
        fechaInicio = "2025-01-23T08:00:00Z"
        fechaFin = "2025-01-30T17:00:00Z"
    },
    @{
        codigo = "TAR-003"
        nombre = "Desarrollo de modulo de captura de datos"
        descripcion = "Implementar el modulo frontend y backend para la captura de informacion estadistica con validaciones en tiempo real."
        prioridad = "Media"
        horasEstimadas = 60
        fechaInicio = "2025-02-01T08:00:00Z"
        fechaFin = "2025-02-20T17:00:00Z"
    },
    @{
        codigo = "TAR-004"
        nombre = "Implementacion de base de datos"
        descripcion = "Crear el modelo de datos, implementar esquemas, indices, procedimientos almacenados y politicas de seguridad."
        prioridad = "Media"
        horasEstimadas = 48
        fechaInicio = "2025-02-03T08:00:00Z"
        fechaFin = "2025-02-18T17:00:00Z"
    },
    @{
        codigo = "TAR-005"
        nombre = "Pruebas de integracion"
        descripcion = "Ejecutar pruebas de integracion completas: unitarias, funcionales, de rendimiento y seguridad."
        prioridad = "Media"
        horasEstimadas = 40
        fechaInicio = "2025-02-21T08:00:00Z"
        fechaFin = "2025-03-05T17:00:00Z"
    },
    @{
        codigo = "TAR-006"
        nombre = "Capacitacion de usuarios finales"
        descripcion = "Disenar y ejecutar plan de capacitacion para usuarios finales. Incluye manuales, videos tutoriales y sesiones presenciales."
        prioridad = "Baja"
        horasEstimadas = 24
        fechaInicio = "2025-03-10T08:00:00Z"
        fechaFin = "2025-03-20T17:00:00Z"
    },
    @{
        codigo = "TAR-007"
        nombre = "Despliegue a produccion"
        descripcion = "Planificar y ejecutar el despliegue a produccion. Incluye migracion de datos, configuracion de servidores y monitoreo post-despliegue."
        prioridad = "Alta"
        horasEstimadas = 32
        fechaInicio = "2025-03-25T08:00:00Z"
        fechaFin = "2025-04-05T17:00:00Z"
    }
)

foreach ($tareaData in $tareasData) {
    # Verificar si la tarea ya existe
    if ($tareasExistentesMap.ContainsKey($tareaData.codigo)) {
        $tareaExistente = $tareasExistentesMap[$tareaData.codigo]
        Write-Info "Usando tarea existente: $($tareaData.codigo)"
        $global:IDs.tareas += @{
            id = $tareaExistente.id
            codigo = $tareaExistente.codigo
            nombre = $tareaExistente.nombre
            estado = $tareaExistente.estado
        }
        Write-Success "Tarea: ID $($tareaExistente.id) - $($tareaExistente.nombre)"
        Write-Detail "Estado: $($tareaExistente.estado)"
    }
    else {
        # Crear nueva tarea
        $tareaBody = @{
            tipo = "KANBAN"
            actividadId = $global:IDs.actividadId
            codigo = $tareaData.codigo
            nombre = $tareaData.nombre
            descripcion = $tareaData.descripcion
            prioridad = $tareaData.prioridad
            asignadoA = $global:IDs.usuarioDesarrollador
            horasEstimadas = $tareaData.horasEstimadas
            fechaInicio = $tareaData.fechaInicio
            fechaFin = $tareaData.fechaFin
        }

        Write-Info "Creando tarea: $($tareaData.codigo)..."
        $tarea = Invoke-ApiRequest -Method "POST" -Endpoint "/tareas" -Body $tareaBody -Token $global:IDs.token

        if ($tarea -and $tarea.data -and $tarea.data.id) {
            $global:IDs.tareas += @{
                id = $tarea.data.id
                codigo = $tarea.data.codigo
                nombre = $tarea.data.nombre
                estado = $tarea.data.estado
            }
            Write-Success "Tarea creada: ID $($tarea.data.id) - $($tarea.data.nombre)"
            Write-Detail "Codigo: $($tarea.data.codigo)"
            Write-Detail "Prioridad: $($tarea.data.prioridad)"
            Write-Detail "Horas estimadas: $($tarea.data.horasEstimadas)h"
            Write-Detail "Estado inicial: $($tarea.data.estado)"
        }
        else {
            Write-Error2 "Error al crear tarea $($tareaData.codigo)"
        }
    }
}

Write-Success "Total de tareas creadas: $($global:IDs.tareas.Count)"

# ================================================================
# FASE 5: Crear Subtareas
# ================================================================
Write-Section "FASE 5: Desglosar Tareas en Subtareas"

# Subtareas para TAR-001 (Analisis de requerimientos)
if ($global:IDs.tareas.Count -gt 0) {
    $tarea1Id = $global:IDs.tareas[0].id

    $subtareas1 = @(
        @{
            codigo = "SUB-001-01"
            nombre = "Entrevistar stakeholders clave"
            descripcion = "Realizar entrevistas con directores, jefes de area y usuarios finales para identificar necesidades."
            horasEstimadas = 16
            prioridad = "Alta"
        },
        @{
            codigo = "SUB-001-02"
            nombre = "Documentar requerimientos funcionales"
            descripcion = "Crear documento formal de requerimientos funcionales con casos de uso y user stories."
            horasEstimadas = 12
            prioridad = "Alta"
        },
        @{
            codigo = "SUB-001-03"
            nombre = "Validar requerimientos con PMO"
            descripcion = "Presentar y validar requerimientos documentados con la oficina de gestion de proyectos."
            horasEstimadas = 8
            prioridad = "Media"
        }
    )

    Write-Info "Creando subtareas para TAR-001 (Analisis de requerimientos)..."
    foreach ($subData in $subtareas1) {
        $subBody = @{
            tareaId = $tarea1Id
            codigo = $subData.codigo
            nombre = $subData.nombre
            descripcion = $subData.descripcion
            estado = "Por hacer"
            prioridad = $subData.prioridad
            responsableId = $global:IDs.usuarioDesarrollador
            horasEstimadas = $subData.horasEstimadas
        }

        $subtarea = Invoke-ApiRequest -Method "POST" -Endpoint "/subtareas" -Body $subBody -Token $global:IDs.token

        if ($subtarea -and $subtarea.id) {
            $global:IDs.subtareas += @{
                id = $subtarea.id
                tareaId = $tarea1Id
                codigo = $subtarea.codigo
                nombre = $subtarea.nombre
            }
            Write-Success "Subtarea creada: ID $($subtarea.id) - $($subtarea.nombre)"
        }
    }
}

# Subtareas para TAR-002 (Diseno de arquitectura)
if ($global:IDs.tareas.Count -gt 1) {
    $tarea2Id = $global:IDs.tareas[1].id

    $subtareas2 = @(
        @{
            codigo = "SUB-002-01"
            nombre = "Disenar modelo de base de datos"
            descripcion = "Crear diagrama ER, definir tablas, relaciones, indices y constraints."
            horasEstimadas = 12
            prioridad = "Alta"
        },
        @{
            codigo = "SUB-002-02"
            nombre = "Definir arquitectura de microservicios"
            descripcion = "Disenar la arquitectura de backend con patron de microservicios y APIs REST."
            horasEstimadas = 16
            prioridad = "Alta"
        }
    )

    Write-Info "Creando subtareas para TAR-002 (Diseno de arquitectura)..."
    foreach ($subData in $subtareas2) {
        $subBody = @{
            tareaId = $tarea2Id
            codigo = $subData.codigo
            nombre = $subData.nombre
            descripcion = $subData.descripcion
            estado = "Por hacer"
            prioridad = $subData.prioridad
            responsableId = $global:IDs.usuarioDesarrollador
            horasEstimadas = $subData.horasEstimadas
        }

        $subtarea = Invoke-ApiRequest -Method "POST" -Endpoint "/subtareas" -Body $subBody -Token $global:IDs.token

        if ($subtarea -and $subtarea.id) {
            $global:IDs.subtareas += @{
                id = $subtarea.id
                tareaId = $tarea2Id
                codigo = $subtarea.codigo
                nombre = $subtarea.nombre
            }
            Write-Success "Subtarea creada: ID $($subtarea.id) - $($subtarea.nombre)"
        }
    }
}

# Subtareas para TAR-003 (Desarrollo modulo captura)
if ($global:IDs.tareas.Count -gt 2) {
    $tarea3Id = $global:IDs.tareas[2].id

    $subtareas3 = @(
        @{
            codigo = "SUB-003-01"
            nombre = "Implementar formularios de captura"
            descripcion = "Desarrollar componentes React para formularios dinamicos con validacion."
            horasEstimadas = 24
            prioridad = "Media"
        },
        @{
            codigo = "SUB-003-02"
            nombre = "Crear API endpoints de captura"
            descripcion = "Implementar endpoints REST para recibir y procesar datos capturados."
            horasEstimadas = 20
            prioridad = "Media"
        },
        @{
            codigo = "SUB-003-03"
            nombre = "Integrar validaciones en tiempo real"
            descripcion = "Implementar sistema de validacion de datos en tiempo real con feedback al usuario."
            horasEstimadas = 16
            prioridad = "Baja"
        }
    )

    Write-Info "Creando subtareas para TAR-003 (Desarrollo modulo)..."
    foreach ($subData in $subtareas3) {
        $subBody = @{
            tareaId = $tarea3Id
            codigo = $subData.codigo
            nombre = $subData.nombre
            descripcion = $subData.descripcion
            estado = "Por hacer"
            prioridad = $subData.prioridad
            responsableId = $global:IDs.usuarioDesarrollador
            horasEstimadas = $subData.horasEstimadas
        }

        $subtarea = Invoke-ApiRequest -Method "POST" -Endpoint "/subtareas" -Body $subBody -Token $global:IDs.token

        if ($subtarea -and $subtarea.id) {
            $global:IDs.subtareas += @{
                id = $subtarea.id
                tareaId = $tarea3Id
                codigo = $subtarea.codigo
                nombre = $subtarea.nombre
            }
            Write-Success "Subtarea creada: ID $($subtarea.id) - $($subtarea.nombre)"
        }
    }
}

Write-Success "Total de subtareas creadas: $($global:IDs.subtareas.Count)"

# ================================================================
# FASE 6: Simular Trabajo (mover tareas por el tablero)
# ================================================================
Write-Section "FASE 6: Simular Trabajo y Movimiento en Tablero Kanban"

# Tarea 1: Completar todo el flujo (Por hacer -> En progreso -> En revision -> Finalizado)
if ($global:IDs.tareas.Count -gt 0) {
    $tarea1Id = $global:IDs.tareas[0].id
    $tarea1Codigo = $global:IDs.tareas[0].codigo

    Write-Info "Procesando $tarea1Codigo (Analisis de requerimientos) - Flujo completo..."

    # Mover a "En progreso"
    Start-Sleep -Milliseconds 500
    $estadoBody = @{ nuevoEstado = "En progreso" }
    $result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/tareas/$tarea1Id/estado" -Body $estadoBody -Token $global:IDs.token
    if ($result) {
        Write-Success "-> Movida a: En progreso"

        # Actualizar horas reales
        $updateBody = @{ horasReales = 35 }
        Invoke-ApiRequest -Method "PATCH" -Endpoint "/tareas/$tarea1Id" -Body $updateBody -Token $global:IDs.token
        Write-Detail "Horas reales trabajadas: 35h"
    }

    # Marcar subtareas como completadas
    $subtareasTarea1 = $global:IDs.subtareas | Where-Object { $_.tareaId -eq $tarea1Id }
    foreach ($sub in $subtareasTarea1) {
        $subUpdateBody = @{
            estado = "Finalizado"
            horasReales = $sub.horasEstimadas
        }
        Invoke-ApiRequest -Method "PATCH" -Endpoint "/subtareas/$($sub.id)" -Body $subUpdateBody -Token $global:IDs.token
        Write-Detail "[+] Subtarea completada: $($sub.codigo)"
    }

    # Agregar evidencia
    Start-Sleep -Milliseconds 500
    $evidenciaBody = @{
        url = "https://docs.inei.gob.pe/proyectos/mod-est/analisis-requerimientos-v1.pdf"
        descripcion = "Documento de analisis de requerimientos funcionales y tecnicos"
    }
    Invoke-ApiRequest -Method "POST" -Endpoint "/tareas/$tarea1Id/evidencias" -Body $evidenciaBody -Token $global:IDs.token
    Write-Detail "Evidencia agregada: Documento de analisis"

    # Mover a "En revision"
    Start-Sleep -Milliseconds 500
    $estadoBody = @{ nuevoEstado = "En revision" }
    $result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/tareas/$tarea1Id/estado" -Body $estadoBody -Token $global:IDs.token
    if ($result) {
        Write-Success "-> Movida a: En revision"
    }

    # Validar tarea (como PMO)
    Start-Sleep -Milliseconds 500
    $validarBody = @{
        aprobado = $true
        observaciones = "Analisis completo y detallado. Requerimientos bien documentados y validados con todas las areas involucradas."
    }
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/tareas/$tarea1Id/validar" -Body $validarBody -Token $global:IDs.token
    if ($result) {
        Write-Success "-> Tarea validada por PMO"
        Write-Detail "Observaciones: $($validarBody.observaciones)"
        Write-Success "-> Movida automaticamente a: Finalizado"
    }
}

# Tarea 2: Mover a "En progreso" (trabajo en curso)
if ($global:IDs.tareas.Count -gt 1) {
    $tarea2Id = $global:IDs.tareas[1].id
    $tarea2Codigo = $global:IDs.tareas[1].codigo

    Write-Info "Procesando $tarea2Codigo (Diseno de arquitectura) - En progreso..."

    Start-Sleep -Milliseconds 500
    $estadoBody = @{ nuevoEstado = "En progreso" }
    $result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/tareas/$tarea2Id/estado" -Body $estadoBody -Token $global:IDs.token
    if ($result) {
        Write-Success "-> Movida a: En progreso"

        # Actualizar horas reales parciales
        $updateBody = @{ horasReales = 18 }
        Invoke-ApiRequest -Method "PATCH" -Endpoint "/tareas/$tarea2Id" -Body $updateBody -Token $global:IDs.token
        Write-Detail 'Horas trabajadas hasta ahora: 18h / 32h estimadas (56 porciento completado)'

        # Marcar primera subtarea como completada
        $subtareasTarea2 = $global:IDs.subtareas | Where-Object { $_.tareaId -eq $tarea2Id }
        if ($subtareasTarea2.Count -gt 0) {
            $subUpdateBody = @{
                estado = "Finalizado"
                horasReales = 12
            }
            Invoke-ApiRequest -Method "PATCH" -Endpoint "/subtareas/$($subtareasTarea2[0].id)" -Body $subUpdateBody -Token $global:IDs.token
            Write-Detail "[+] Subtarea completada: $($subtareasTarea2[0].codigo)"
        }
    }
}

# Tarea 3: Mover a "En progreso" (recien iniciada)
if ($global:IDs.tareas.Count -gt 2) {
    $tarea3Id = $global:IDs.tareas[2].id
    $tarea3Codigo = $global:IDs.tareas[2].codigo

    Write-Info "Procesando $tarea3Codigo (Desarrollo modulo) - Iniciando..."

    Start-Sleep -Milliseconds 500
    $estadoBody = @{ nuevoEstado = "En progreso" }
    $result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/tareas/$tarea3Id/estado" -Body $estadoBody -Token $global:IDs.token
    if ($result) {
        Write-Success "-> Movida a: En progreso"

        # Horas reales minimas
        $updateBody = @{ horasReales = 5 }
        Invoke-ApiRequest -Method "PATCH" -Endpoint "/tareas/$tarea3Id" -Body $updateBody -Token $global:IDs.token
        Write-Detail 'Horas trabajadas: 5h / 60h estimadas (8 porciento completado)'
    }
}

# Tareas 4-7 permanecen en "Por hacer"
Write-Info "Tareas restantes (TAR-004 a TAR-007) permanecen en estado: Por hacer"

# ================================================================
# FASE 7: Daily Meetings
# ================================================================
Write-Section "FASE 7: Registrar Daily Meetings"

# Daily Meeting 1 - Inicio del proyecto
Write-Info "Creando Daily Meeting #1 (Inicio del proyecto)..."
$daily1Body = @{
    tipo = "Actividad"
    actividadId = $global:IDs.actividadId
    nombre = "Daily Standup - Inicio Modernizacion Sistema Estadisticas"
    fecha = "2025-01-16T09:00:00Z"
    horaInicio = "09:00"
    horaFin = "09:15"
    facilitadorId = $global:IDs.usuarioCoordinador
    notas = "Primera reunion diaria del proyecto. Se da inicio formal a las actividades de modernizacion."
    linkReunion = "https://meet.google.com/abc-defg-hij"
    participantes = @(
        @{
            usuarioId = $global:IDs.usuarioCoordinador
            queHiceAyer = "Preparacion del proyecto y validacion de recursos"
            queHareHoy = "Coordinar inicio de analisis de requerimientos"
            impedimentos = "Ninguno"
        },
        @{
            usuarioId = $global:IDs.usuarioDesarrollador
            queHiceAyer = "Revision de documentacion existente"
            queHareHoy = "Iniciar entrevistas con stakeholders para analisis de requerimientos"
            impedimentos = "Pendiente confirmar agenda con algunos directores"
        }
    )
}

$daily1 = Invoke-ApiRequest -Method "POST" -Endpoint "/daily-meetings" -Body $daily1Body -Token $global:IDs.token
if ($daily1 -and $daily1.id) {
    $global:IDs.dailyMeetings += $daily1.id
    Write-Success "Daily Meeting #1 creada: ID $($daily1.id)"
    Write-Detail "Fecha: 2025-01-16 09:00"
    Write-Detail "Participantes: $($daily1Body.participantes.Count)"
    Write-Detail "Facilitador: Coordinador"
}

# Daily Meeting 2 - Progreso semana 1
Start-Sleep -Milliseconds 500
Write-Info "Creando Daily Meeting #2 (Progreso semana 1)..."
$daily2Body = @{
    tipo = "Actividad"
    actividadId = $global:IDs.actividadId
    nombre = "Daily Standup - Progreso Semana 1"
    fecha = "2025-01-20T09:00:00Z"
    horaInicio = "09:00"
    horaFin = "09:15"
    facilitadorId = $global:IDs.usuarioCoordinador
    notas = "Revision de avances en analisis de requerimientos. Se han completado 8 de 12 entrevistas planificadas."
    linkReunion = "https://meet.google.com/abc-defg-hij"
    participantes = @(
        @{
            usuarioId = $global:IDs.usuarioCoordinador
            queHiceAyer = "Seguimiento de entrevistas y resolucion de dudas con areas financieras"
            queHareHoy = "Revisar borrador de documento de requerimientos"
            impedimentos = "Ninguno"
        },
        @{
            usuarioId = $global:IDs.usuarioDesarrollador
            queHiceAyer = "Completadas 3 entrevistas mas con jefes de area. Documentacion de casos de uso"
            queHareHoy = "Finalizar entrevistas pendientes y consolidar requerimientos funcionales"
            impedimentos = "Un director no disponible hasta la proxima semana, se reprogramara"
        },
        @{
            usuarioId = $global:IDs.usuarioPMO
            queHiceAyer = "Revision de cronograma y presupuesto"
            queHareHoy = "Validar avances con PMO"
            impedimentos = "Ninguno"
        }
    )
}

$daily2 = Invoke-ApiRequest -Method "POST" -Endpoint "/daily-meetings" -Body $daily2Body -Token $global:IDs.token
if ($daily2 -and $daily2.id) {
    $global:IDs.dailyMeetings += $daily2.id
    Write-Success "Daily Meeting #2 creada: ID $($daily2.id)"
    Write-Detail "Fecha: 2025-01-20 09:00"
    Write-Detail "Participantes: $($daily2Body.participantes.Count)"
    Write-Detail 'Avance: Analisis de requerimientos 67 porciento completado'
}

# Daily Meeting 3 - Finalizacion analisis e inicio diseno
Start-Sleep -Milliseconds 500
Write-Info "Creando Daily Meeting #3 (Transicion a diseno)..."
$daily3Body = @{
    tipo = "Actividad"
    actividadId = $global:IDs.actividadId
    nombre = "Daily Standup - Inicio Fase de Diseno"
    fecha = "2025-01-24T09:00:00Z"
    horaInicio = "09:00"
    horaFin = "09:15"
    facilitadorId = $global:IDs.usuarioCoordinador
    notas = "Analisis de requerimientos finalizado y validado. Se inicia fase de diseno de arquitectura. Celebracion del primer hito completado."
    linkReunion = "https://meet.google.com/abc-defg-hij"
    participantes = @(
        @{
            usuarioId = $global:IDs.usuarioCoordinador
            queHiceAyer = "Validacion final de documento de requerimientos con PMO"
            queHareHoy = "Planificar kick-off de fase de diseno"
            impedimentos = "Ninguno"
        },
        @{
            usuarioId = $global:IDs.usuarioDesarrollador
            queHiceAyer = "Presentacion de requerimientos validados. Documento aprobado."
            queHareHoy = "Iniciar diseno de modelo de base de datos"
            impedimentos = "Ninguno"
        },
        @{
            usuarioId = $global:IDs.usuarioPMO
            queHiceAyer = "Aprobacion de documento de requerimientos"
            queHareHoy = "Seguimiento de presupuesto ejecutado vs planificado"
            impedimentos = "Ninguno"
        }
    )
}

$daily3 = Invoke-ApiRequest -Method "POST" -Endpoint "/daily-meetings" -Body $daily3Body -Token $global:IDs.token
if ($daily3 -and $daily3.id) {
    $global:IDs.dailyMeetings += $daily3.id
    Write-Success "Daily Meeting #3 creada: ID $($daily3.id)"
    Write-Detail "Fecha: 2025-01-24 09:00"
    Write-Detail "Participantes: $($daily3Body.participantes.Count)"
    Write-Detail "Hito alcanzado: Requerimientos completados [+]"
}

Write-Success "Total de Daily Meetings registradas: $($global:IDs.dailyMeetings.Count)"

# ================================================================
# FASE 8: Consultar Tablero Kanban
# ================================================================
Write-Section "FASE 8: Consultar Tablero Kanban"

Write-Info "Obteniendo tablero Kanban de la actividad..."
$tablero = Invoke-ApiRequest -Method "GET" -Endpoint "/actividades/$($global:IDs.actividadId)/tablero-kanban" -Token $global:IDs.token

if ($tablero) {
    Write-Success "Tablero Kanban obtenido exitosamente"
    Write-Host ""

    # Mostrar columnas del tablero
    Write-Host "+================================================================+" -ForegroundColor Cyan
    Write-Host "|           TABLERO KANBAN - ACTIVIDAD $($global:IDs.actividadId)                  |" -ForegroundColor Cyan
    Write-Host "+================================================================+" -ForegroundColor Cyan
    Write-Host "|  Proyecto: Modernizacion del Sistema de Estadisticas          |" -ForegroundColor Cyan
    Write-Host "+================================================================+" -ForegroundColor Cyan
    Write-Host ""

    # Contar tareas por estado
    $tareasPorHacer = 0
    $tareasEnProgreso = 0
    $tareasEnRevision = 0
    $tareasFinalizadas = 0
    $totalHorasEstimadas = 0
    $totalHorasReales = 0

    # Obtener todas las tareas de la actividad
    $todasLasTareas = Invoke-ApiRequest -Method "GET" -Endpoint "/actividades/$($global:IDs.actividadId)/tareas" -Token $global:IDs.token

    if ($todasLasTareas) {
        foreach ($t in $todasLasTareas) {
            $totalHorasEstimadas += $t.horasEstimadas
            if ($t.horasReales) {
                $totalHorasReales += $t.horasReales
            }

            switch ($t.estado) {
                "Por hacer" { $tareasPorHacer++ }
                "En progreso" { $tareasEnProgreso++ }
                "En revision" { $tareasEnRevision++ }
                "Finalizado" { $tareasFinalizadas++ }
            }
        }
    }

    $totalTareas = $tareasPorHacer + $tareasEnProgreso + $tareasEnRevision + $tareasFinalizadas

    # Calcular progreso
    $progresoGeneral = if ($totalTareas -gt 0) {
        [math]::Round((($tareasFinalizadas + ($tareasEnRevision * 0.9) + ($tareasEnProgreso * 0.5)) / $totalTareas) * 100, 1)
    } else { 0 }

    # Mostrar estadisticas por columna
    Write-Host "+-----------------+-----------------+-----------------+-----------------+" -ForegroundColor White
    Write-Host "|   Por Hacer     |  En Progreso    |  En Revision    |   Finalizado    |" -ForegroundColor White
    Write-Host "+-----------------+-----------------+-----------------+-----------------+" -ForegroundColor White
    Write-Host ("| {0,2} tareas      | {1,2} tareas      | {2,2} tareas      | {3,2} tareas      |" -f $tareasPorHacer, $tareasEnProgreso, $tareasEnRevision, $tareasFinalizadas) -ForegroundColor Yellow
    Write-Host "+-----------------+-----------------+-----------------+-----------------+" -ForegroundColor White
    Write-Host ""

    # Estadisticas generales
    Write-Host "======================= ESTADISTICAS GENERALES =======================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Total de tareas:              $totalTareas" -ForegroundColor White
    Write-Host "  Tareas completadas:           $tareasFinalizadas" -ForegroundColor Green
    Write-Host "  Tareas en progreso:           $($tareasEnProgreso + $tareasEnRevision)" -ForegroundColor Yellow
    Write-Host "  Tareas pendientes:            $tareasPorHacer" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Progreso General:             $progresoGeneral porciento" -ForegroundColor $(if ($progresoGeneral -ge 75) { "Green" } elseif ($progresoGeneral -ge 50) { "Yellow" } else { "Red" })
    Write-Host "  Horas Estimadas (Total):      $totalHorasEstimadas h" -ForegroundColor White
    Write-Host "  Horas Reales (Trabajadas):    $totalHorasReales h" -ForegroundColor White

    $eficiencia = if ($totalHorasEstimadas -gt 0) {
        [math]::Round(($totalHorasReales / $totalHorasEstimadas) * 100, 1)
    } else { 0 }
    Write-Host "  Eficiencia de estimacion:     $eficiencia porciento" -ForegroundColor $(if ($eficiencia -le 100) { "Green" } elseif ($eficiencia -le 120) { "Yellow" } else { "Red" })
    Write-Host ""

    # Barra de progreso visual
    $barWidth = 50
    $filled = [math]::Floor($barWidth * $progresoGeneral / 100)
    $empty = $barWidth - $filled
    $progressBar = ("=" * $filled) + ("-" * $empty)
    Write-Host "  Progreso: [$progressBar] $progresoGeneral porciento" -ForegroundColor Cyan
    Write-Host ""
}

# ================================================================
# FASE 9: Reportes Finales
# ================================================================
Write-Section "FASE 9: Reportes y Resumen Final"

# Listar todas las tareas
Write-Info "Listado completo de tareas de la actividad..."
$tareasActividad = Invoke-ApiRequest -Method "GET" -Endpoint "/actividades/$($global:IDs.actividadId)/tareas" -Token $global:IDs.token

if ($tareasActividad) {
    Write-Host ""
    Write-Host "========================== TAREAS ==========================" -ForegroundColor Cyan
    foreach ($t in $tareasActividad) {
        $estadoColor = switch ($t.estado) {
            "Finalizado" { "Green" }
            "En revision" { "Cyan" }
            "En progreso" { "Yellow" }
            default { "Gray" }
        }

        $prioridadIcon = switch ($t.prioridad) {
            "Alta" { "[HIGH]" }
            "Media" { "[MED]" }
            "Baja" { "[LOW]" }
            default { "[---]" }
        }

        Write-Host ""
        Write-Host "  [$($t.codigo)] $($t.nombre)" -ForegroundColor White
        Write-Host "    Estado: $($t.estado)" -ForegroundColor $estadoColor
        Write-Host "    Prioridad: $prioridadIcon $($t.prioridad)" -ForegroundColor White
        Write-Host "    Horas: $($t.horasReales)h / $($t.horasEstimadas)h estimadas" -ForegroundColor Gray
        if ($t.asignadoA) {
            Write-Host "    Asignado a: Usuario ID $($t.asignadoA)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Listar Daily Meetings
Write-Info "Listado de Daily Meetings realizadas..."
$dailyMeetings = Invoke-ApiRequest -Method "GET" -Endpoint "/daily-meetings?actividadId=$($global:IDs.actividadId)" -Token $global:IDs.token

if ($dailyMeetings) {
    Write-Host ""
    Write-Host "====================== DAILY MEETINGS ======================" -ForegroundColor Cyan
    foreach ($dm in $dailyMeetings) {
        Write-Host ""
        Write-Host "  [MEETING] $($dm.nombre)" -ForegroundColor White
        Write-Host "    ID: $($dm.id)" -ForegroundColor Gray
        Write-Host "    Fecha: $($dm.fecha.Substring(0,10)) $($dm.horaInicio) - $($dm.horaFin)" -ForegroundColor Yellow
        if ($dm.notas) {
            Write-Host "    Notas: $($dm.notas.Substring(0, [Math]::Min(80, $dm.notas.Length)))..." -ForegroundColor Gray
        }
        if ($dm.participantes) {
            Write-Host "    Participantes: $($dm.participantes.Count)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# ================================================================
# RESUMEN EJECUTIVO FINAL
# ================================================================
Write-Section "RESUMEN EJECUTIVO FINAL"

Write-Host ""
Write-Host "+===================================================================+" -ForegroundColor Green
Write-Host "|                    SIMULACION COMPLETADA                          |" -ForegroundColor Green
Write-Host "+===================================================================+" -ForegroundColor Green
Write-Host ""

Write-Host "  [CHART] ACTIVIDAD KANBAN" -ForegroundColor Cyan
Write-Host "    * ID: $($global:IDs.actividadId)" -ForegroundColor White
Write-Host "    * Codigo: ACT-2025-MOD-EST" -ForegroundColor White
Write-Host "    * Nombre: Modernizacion del Sistema de Estadisticas" -ForegroundColor White
Write-Host "    * Estado: En ejecucion" -ForegroundColor Yellow
Write-Host "    * Monto: S/. 75,000.00" -ForegroundColor White
Write-Host "    * Periodo: Enero - Junio 2025" -ForegroundColor White
Write-Host ""

Write-Host "  [LIST] TAREAS KANBAN" -ForegroundColor Cyan
Write-Host "    * Total creadas: $($global:IDs.tareas.Count)" -ForegroundColor White
Write-Host "    * Finalizadas: $tareasFinalizadas" -ForegroundColor Green
Write-Host "    * En progreso: $tareasEnProgreso" -ForegroundColor Yellow
Write-Host "    * En revision: $tareasEnRevision" -ForegroundColor Cyan
Write-Host "    * Por hacer: $tareasPorHacer" -ForegroundColor Gray
Write-Host ""

Write-Host "  [WORK] SUBTAREAS" -ForegroundColor Cyan
Write-Host "    * Total creadas: $($global:IDs.subtareas.Count)" -ForegroundColor White
Write-Host "    * Distribuidas en: 3 tareas principales" -ForegroundColor White
Write-Host ""

Write-Host "  [MEET] DAILY MEETINGS" -ForegroundColor Cyan
Write-Host "    * Total realizadas: $($global:IDs.dailyMeetings.Count)" -ForegroundColor White
Write-Host "    * Ultima reunion: 2025-01-24" -ForegroundColor White
Write-Host "    * Proxima reunion: 2025-01-27 09:00" -ForegroundColor Yellow
Write-Host ""

Write-Host "  [METRICS] METRICAS DE RENDIMIENTO" -ForegroundColor Cyan
Write-Host "    * Progreso general: $progresoGeneral porciento" -ForegroundColor $(if ($progresoGeneral -ge 50) { "Green" } else { "Yellow" })
Write-Host "    * Horas estimadas: $totalHorasEstimadas h" -ForegroundColor White
Write-Host "    * Horas trabajadas: $totalHorasReales h" -ForegroundColor White
Write-Host "    * Eficiencia: $eficiencia porciento" -ForegroundColor $(if ($eficiencia -le 100) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "  [TARGET] HITOS ALCANZADOS" -ForegroundColor Cyan
Write-Host "    [+] Analisis de requerimientos completado y validado" -ForegroundColor Green
Write-Host "    [+] Fase de diseno iniciada" -ForegroundColor Green
Write-Host "    [~] Desarrollo del modulo de captura en progreso" -ForegroundColor Yellow
Write-Host ""

Write-Host "  [TEAM] EQUIPO" -ForegroundColor Cyan
Write-Host "    * PMO: Usuario ID $($global:IDs.usuarioPMO)" -ForegroundColor White
Write-Host "    * Coordinador: Usuario ID $($global:IDs.usuarioCoordinador)" -ForegroundColor White
Write-Host "    * Desarrollador: Usuario ID $($global:IDs.usuarioDesarrollador)" -ForegroundColor White
Write-Host ""

Write-Host "  [!] IMPEDIMENTOS ACTUALES" -ForegroundColor Cyan
Write-Host "    * Ninguno reportado en la ultima daily meeting" -ForegroundColor Green
Write-Host ""

Write-Host "  [NEXT] PROXIMOS PASOS" -ForegroundColor Cyan
Write-Host "    1. Finalizar diseno de arquitectura (TAR-002)" -ForegroundColor White
Write-Host "    2. Completar desarrollo de modulo de captura (TAR-003)" -ForegroundColor White
Write-Host "    3. Iniciar implementacion de base de datos (TAR-004)" -ForegroundColor White
Write-Host "    4. Daily meeting diaria a las 09:00 AM" -ForegroundColor White
Write-Host ""

Write-Host "+===================================================================+" -ForegroundColor Green
Write-Host "|           [+] SIMULACION DE FLUJO KANBAN EXITOSA                  |" -ForegroundColor Green
Write-Host "+===================================================================+" -ForegroundColor Green
Write-Host ""

Write-Host "Todos los datos han sido guardados en el sistema SIGP." -ForegroundColor Cyan
Write-Host "Puedes consultar el tablero en: http://localhost:3010/api/v1/actividades/$($global:IDs.actividadId)/tablero-kanban" -ForegroundColor Gray
Write-Host ""
