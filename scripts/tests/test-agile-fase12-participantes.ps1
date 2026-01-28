# ========================================
# FASE 12: PARTICIPANTES DE DAILY MEETINGS (EXHAUSTIVO)
# ========================================
# Este archivo contiene 45 tests exhaustivos para participantes de Daily Meetings
# Agregar este bloque antes del "# RESUMEN FINAL" en test-agile-exhaustivo.ps1

Write-Host "`n=== FASE 12: PARTICIPANTES DAILY (EXHAUSTIVO) ===" -ForegroundColor Magenta

# 12.1 Agregar participantes con diferentes configuraciones
Test-Api -Name "12.1 - Agregar participante basico a daily SCRUM" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" `
  -Token $adminToken `
  -Body @{usuarioId=13} `
  -ExpectedStatus 200 `
  -SaveIdAs "participanteAdmin"

Test-Api -Name "12.2 - Agregar participante con que hice/hare completo" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" `
  -Token $adminToken `
  -Body @{
    usuarioId=14;
    queHiceAyer="Complete la implementacion del modulo de autenticacion incluyendo login, registro y recuperacion de contraseña";
    queHareHoy="Trabajare en el sistema de perfiles de usuario y configuracion de cuentas"
  } `
  -ExpectedStatus 200 `
  -SaveIdAs "participantePmo"

Test-Api -Name "12.3 - Agregar participante con impedimentos" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" `
  -Token $pmoToken `
  -Body @{
    usuarioId=15;
    queHiceAyer="Revise y aprobe 5 pull requests del equipo";
    queHareHoy="Continuare con code review y empezare testing de integracion";
    impedimentos="Esperando respuesta del equipo de infraestructura sobre acceso a ambiente de staging"
  } `
  -ExpectedStatus 200 `
  -SaveIdAs "participanteDev"

Test-Api -Name "12.4 - Agregar participante a otra daily Kanban" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyKanbanId)/participantes" `
  -Token $adminToken `
  -Body @{
    usuarioId=13;
    queHiceAyer="Diseñe mockups de las pantallas principales";
    queHareHoy="Implementare los componentes UI en React"
  } `
  -ExpectedStatus 200

Test-Api -Name "12.5 - Agregar participante solo con impedimentos" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyKanbanId)/participantes" `
  -Token $pmoToken `
  -Body @{
    usuarioId=14;
    impedimentos="Bloqueado por falta de especificaciones tecnicas del API"
  } `
  -ExpectedStatus 200

# 12.2 Validaciones de negocio - Duplicados y permisos
Test-Api -Name "12.6 - Rechazar participante duplicado (mismo usuario)" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" `
  -Token $adminToken `
  -Body @{usuarioId=13; queHiceAyer="Test"} `
  -ExpectedStatus 409 `
  -ShouldFail $true

Test-Api -Name "12.7 - Rechazar agregar sin permisos (dev)" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyKanbanId)/participantes" `
  -Token $devToken `
  -Body @{usuarioId=15} `
  -ExpectedStatus 403 `
  -ShouldFail $true

Test-Api -Name "12.8 - Rechazar sin usuarioId valido" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" `
  -Token $adminToken `
  -Body @{queHiceAyer="Sin usuario"} `
  -ExpectedStatus 400 `
  -ShouldFail $true

Test-Api -Name "12.9 - Rechazar con usuarioId inexistente" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyId)/participantes" `
  -Token $adminToken `
  -Body @{usuarioId=99999} `
  -ExpectedStatus 404 `
  -ShouldFail $true

Test-Api -Name "12.10 - Rechazar agregar a daily inexistente" `
  -Method POST `
  -Endpoint "/daily-meetings/99999/participantes" `
  -Token $adminToken `
  -Body @{usuarioId=13} `
  -ExpectedStatus 404 `
  -ShouldFail $true

# 12.3 Actualizacion de campos individuales
Test-Api -Name "12.11 - Actualizar solo que hice ayer" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $adminToken `
  -Body @{queHiceAyer="Complete toda la funcionalidad de autenticacion incluyendo OAuth2 y JWT"} `
  -ExpectedStatus 200

Test-Api -Name "12.12 - Actualizar solo que hare hoy" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $adminToken `
  -Body @{queHareHoy="Iniciare con el modulo de perfiles y comenzare el CRUD de usuarios"} `
  -ExpectedStatus 200

Test-Api -Name "12.13 - Actualizar solo impedimentos" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participantePmo)" `
  -Token $adminToken `
  -Body @{impedimentos="Bloqueado por falta de acceso a base de datos de produccion para migracion"} `
  -ExpectedStatus 200

Test-Api -Name "12.14 - Limpiar impedimentos (vacio)" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participantePmo)" `
  -Token $adminToken `
  -Body @{impedimentos=""} `
  -ExpectedStatus 200

# 12.4 Actualizacion de campo asistencia
Test-Api -Name "12.15 - Marcar asistencia como presente (true)" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $adminToken `
  -Body @{asistio=$true} `
  -ExpectedStatus 200

Test-Api -Name "12.16 - Marcar asistencia como ausente (false)" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participantePmo)" `
  -Token $adminToken `
  -Body @{asistio=$false} `
  -ExpectedStatus 200

Test-Api -Name "12.17 - Cambiar asistencia de false a true" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participantePmo)" `
  -Token $pmoToken `
  -Body @{asistio=$true} `
  -ExpectedStatus 200

# 12.5 Actualizacion multiple de campos
Test-Api -Name "12.18 - Actualizar todos los campos juntos" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $adminToken `
  -Body @{
    queHiceAyer="Finalice integracion con sistema de notificaciones via email y SMS";
    queHareHoy="Trabajare en la dashboard de administracion y reportes";
    impedimentos="Ninguno por el momento";
    asistio=$true
  } `
  -ExpectedStatus 200

Test-Api -Name "12.19 - Actualizar que hice y que hare juntos" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteDev)" `
  -Token $adminToken `
  -Body @{
    queHiceAyer="Configure CI/CD pipeline con GitHub Actions";
    queHareHoy="Agregare tests unitarios y de integracion"
  } `
  -ExpectedStatus 200

Test-Api -Name "12.20 - Actualizar que hare e impedimentos" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteDev)" `
  -Token $adminToken `
  -Body @{
    queHareHoy="Revisar documentacion de API antes de continuar";
    impedimentos="Esperando clarificacion de requisitos de negocio"
  } `
  -ExpectedStatus 200

# 12.6 Permisos de actualizacion por rol
Test-Api -Name "12.21 - Admin puede actualizar cualquier participante" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participantePmo)" `
  -Token $adminToken `
  -Body @{queHareHoy="Admin actualizando datos de PMO"} `
  -ExpectedStatus 200

Test-Api -Name "12.22 - PMO puede actualizar cualquier participante" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $pmoToken `
  -Body @{impedimentos="PMO actualizando datos de Admin"} `
  -ExpectedStatus 200

Test-Api -Name "12.23 - Scrum Master puede actualizar cualquier participante" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteDev)" `
  -Token $scrumMasterToken `
  -Body @{asistio=$true} `
  -ExpectedStatus 200

Test-Api -Name "12.24 - Coordinador puede actualizar cualquier participante" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $coordinadorToken `
  -Body @{queHiceAyer="Coordinador actualizando reporte"} `
  -ExpectedStatus 200

Test-Api -Name "12.25 - Dev NO puede actualizar datos de otros (Admin)" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $devToken `
  -Body @{queHiceAyer="Intento de dev actualizar datos de admin"} `
  -ExpectedStatus 403 `
  -ShouldFail $true

Test-Api -Name "12.26 - Dev NO puede actualizar datos de otros (PMO)" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participantePmo)" `
  -Token $devToken `
  -Body @{impedimentos="Intento de hack"} `
  -ExpectedStatus 403 `
  -ShouldFail $true

# 12.7 Consulta y verificacion de datos
Test-Api -Name "12.27 - Obtener daily con participantes actualizados" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyId)" `
  -Token $adminToken `
  -ExpectedStatus 200

Test-Api -Name "12.28 - Verificar participantes en resumen detallado" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyId)/resumen" `
  -Token $adminToken `
  -ExpectedStatus 200

Test-Api -Name "12.29 - Obtener daily Kanban con participantes" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyKanbanId)" `
  -Token $pmoToken `
  -ExpectedStatus 200

Test-Api -Name "12.30 - Verificar datos completos de participantes" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyId)" `
  -Token $devToken `
  -ExpectedStatus 200

# 12.8 Eliminacion de participantes
Test-Api -Name "12.31 - Eliminar participante por Admin" `
  -Method DELETE `
  -Endpoint "/daily-meetings/participantes/$($ids.participantePmo)" `
  -Token $adminToken `
  -ExpectedStatus 200

Test-Api -Name "12.32 - Verificar participante eliminado no aparece" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyId)" `
  -Token $adminToken `
  -ExpectedStatus 200

Test-Api -Name "12.33 - Rechazar eliminar sin permisos (dev)" `
  -Method DELETE `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $devToken `
  -ExpectedStatus 403 `
  -ShouldFail $true

# 12.9 Permisos de eliminacion por rol
$tempParticipante1 = Test-Api -Name "12.34 - Crear participante temporal para test PMO" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyKanbanId)/participantes" `
  -Token $adminToken `
  -Body @{usuarioId=15; queHiceAyer="Test PMO delete"} `
  -ExpectedStatus 200

if ($tempParticipante1 -and $tempParticipante1.id) {
    Test-Api -Name "12.35 - PMO puede eliminar participante" `
      -Method DELETE `
      -Endpoint "/daily-meetings/participantes/$($tempParticipante1.id)" `
      -Token $pmoToken `
      -ExpectedStatus 200
}

$tempParticipante2 = Test-Api -Name "12.36 - Crear participante temporal para test Scrum Master" `
  -Method POST `
  -Endpoint "/daily-meetings/$($ids.dailyKanbanId)/participantes" `
  -Token $adminToken `
  -Body @{usuarioId=14; queHareHoy="Test SM delete"} `
  -ExpectedStatus 200

if ($tempParticipante2 -and $tempParticipante2.id) {
    Test-Api -Name "12.37 - Scrum Master puede eliminar participante" `
      -Method DELETE `
      -Endpoint "/daily-meetings/participantes/$($tempParticipante2.id)" `
      -Token $scrumMasterToken `
      -ExpectedStatus 200
}

# 12.10 Validaciones de actualizacion
Test-Api -Name "12.38 - Rechazar actualizar participante inexistente" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/99999" `
  -Token $adminToken `
  -Body @{queHiceAyer="Test"} `
  -ExpectedStatus 404 `
  -ShouldFail $true

Test-Api -Name "12.39 - Rechazar eliminar participante inexistente" `
  -Method DELETE `
  -Endpoint "/daily-meetings/participantes/99999" `
  -Token $adminToken `
  -ExpectedStatus 404 `
  -ShouldFail $true

Test-Api -Name "12.40 - Actualizar con body vacio debe ser exitoso" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $adminToken `
  -Body @{} `
  -ExpectedStatus 200

# 12.11 Casos especiales - Textos largos
Test-Api -Name "12.41 - Actualizar con texto largo en que hice" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteAdmin)" `
  -Token $adminToken `
  -Body @{queHiceAyer="Ayer complete la implementacion del sistema de autenticacion completo incluyendo: login con email y password, login con OAuth2 (Google, GitHub), registro de nuevos usuarios con confirmacion por email, recuperacion de contraseña via token temporal, validacion de JWT en cada request, middleware de autorizacion por roles, sistema de refresh tokens, logout y revocacion de tokens, tests unitarios y de integracion para todos los casos de uso, documentacion de API en Swagger, y deployment a ambiente de staging"} `
  -ExpectedStatus 200

Test-Api -Name "12.42 - Actualizar con texto largo en impedimentos" `
  -Method PATCH `
  -Endpoint "/daily-meetings/participantes/$($ids.participanteDev)" `
  -Token $adminToken `
  -Body @{impedimentos="Actualmente tengo varios blockers importantes: 1) Esperando aprobacion de seguridad para integrar con API externa de pagos, 2) Falta acceso a base de datos de produccion para debugging de issue critico, 3) Equipo de infraestructura no ha provisto credenciales para S3, 4) Revision de arquitectura pendiente con tech lead, 5) Dependencia con equipo mobile que no ha completado su parte"} `
  -ExpectedStatus 200

# 12.12 Verificacion final y cleanup
Test-Api -Name "12.43 - Verificar estado final de participantes en daily SCRUM" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyId)" `
  -Token $adminToken `
  -ExpectedStatus 200

Test-Api -Name "12.44 - Verificar estado final de participantes en daily Kanban" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyKanbanId)" `
  -Token $adminToken `
  -ExpectedStatus 200

Test-Api -Name "12.45 - Verificar conteo de participantes en resumen" `
  -Method GET `
  -Endpoint "/daily-meetings/$($ids.dailyId)/resumen" `
  -Token $pmoToken `
  -ExpectedStatus 200
