# MATRIZ DE PERMISOS COMPLETA - SIGP

## Sistema Integral de Gestion de Proyectos

**Version:** 1.0
**Fecha:** Diciembre 2025
**Documento:** Matriz Consolidada de Permisos

---

## LEYENDA

| Simbolo | Significado |
|---------|-------------|
| ✅ | Permiso completo |
| 👁️ | Solo lectura/vista |
| ➕ | Solo crear |
| ✏️ | Solo editar |
| 🗑️ | Solo eliminar |
| ✔️ | Solo aprobar |
| 📤 | Solo enviar |
| 🔒 | Acceso limitado (ver notas) |
| ❌ | Sin acceso |

## ROLES

| Codigo | Rol | Nivel |
|--------|-----|-------|
| **ADM** | Administrador | 100 |
| **PMO** | Project Management Office | 90 |
| **COO** | Coordinador | 80 |
| **SM** | Scrum Master | 70 |
| **SPO** | Patrocinador (Sponsor) | 60 |
| **DEV** | Desarrollador | 50 |
| **IMP** | Implementador | 50 |

---

## 1. MODULO ADMINISTRACION

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Usuarios** | Listar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Asignar rol | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Resetear password | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Bloquear/Desbloquear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configuracion** | Ver parametros | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar parametros | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Auditoria** | Ver logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Exportar logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Filtrar logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Backups** | Ver backups | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Crear backup | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Restaurar backup | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Programar backup | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2. MODULO PGD (PLANIFICACION ESTRATEGICA)

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **PGD** | Listar | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver dashboard | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **OEI** | Listar | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Definir metas anuales | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **OGD** | Listar | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Definir metas anuales | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **OEGD** | Listar | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Acciones Estrategicas** | Listar | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver proyectos vinculados | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. MODULO POI - PROYECTOS

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Proyectos** | Listar todos | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Listar asignados | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ |
| | Ver detalles | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Cambiar estado | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Asignar SM | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Asignar Coordinador | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Asignar Patrocinador | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver progreso | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ |
| **Subproyectos** | Listar | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Asignar SM | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| **Documentos** | Listar | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Ver documento | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Subir documento | ✅ | ➕ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar documento | ✅ | ✏️ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar documento | ✅ | 🗑️ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Descargar documento | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | **Aprobar documento** | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Rechazar documento | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Actas de Reunion** | Listar | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Generar PDF | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | **Aprobar** | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Acta de Constitucion** | Listar | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Generar PDF | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | **Aprobar (PMO)** | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | **Aprobar (Sponsor)** | ✅ | ❌ | ❌ | ❌ | ✔️ | ❌ | ❌ |
| **Requerimientos** | Listar | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Crear RF | ✅ | ➕ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Crear RNF | ✅ | ➕ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Vincular a HU | ✅ | ✏️ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| **Cronograma** | Ver | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Crear | ✅ | ➕ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Exportar Excel | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | Exportar PDF | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| | **Aprobar** | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Informes de Sprint** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Generar automatico | ✅ | ➕ | ❌ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ❌ | ✏️ | ❌ | ❌ | ❌ |
| | **Enviar a revision** | ✅ | ❌ | ❌ | 📤 | ❌ | ❌ | ❌ |
| | **Aprobar (Coordinador)** | ✅ | ❌ | ✔️ | ❌ | ❌ | ❌ | ❌ |
| | **Aprobar (PMO)** | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Rechazar | ✅ | ✔️ | ✔️ | ❌ | ❌ | ❌ | ❌ |
| | Descargar PDF | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |

---

## 4. MODULO POI - ACTIVIDADES

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Actividades** | Listar todas | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Listar asignadas | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | 👁️ |
| | Ver detalles | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | 👁️ |
| | Crear | ✅ | ➕ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Cambiar estado | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Asignar Coordinador | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Configurar periodicidad | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Ver progreso | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| **Informes de Actividad** | Listar | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Ver detalle | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Crear | ✅ | ➕ | ➕ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ | ❌ |
| | **Aprobar** | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Rechazar | ✅ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Descargar | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |

---

## 5. MODULO AGILE - SCRUM (Proyectos)

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Epicas** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Crear | ✅ | ❌ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Cambiar estado | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Ver estadisticas | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| **Sprints** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Crear | ✅ | ❌ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | **Iniciar Sprint** | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | **Cerrar Sprint** | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Ver Burndown | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver Metricas | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| **Historias de Usuario** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Crear | ✅ | ❌ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Cambiar estado | ✅ | ❌ | ✏️ | ✏️ | ❌ | 🔒¹ | ❌ |
| | Asignar a Sprint | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Quitar de Sprint | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Asignar persona | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Estimar (SP) | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Definir prioridad | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Agregar criterio aceptacion | ✅ | ❌ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar criterio | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar criterio | ✅ | ❌ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Verificar criterio | ✅ | ❌ | ✔️ | ✔️ | ❌ | ❌ | ❌ |
| | Vincular requerimiento | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Agregar dependencia | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar dependencia | ✅ | ❌ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| **Tareas (Scrum)** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | **Crear** | ✅ | ❌ | ➕ | ➕ | ❌ | ➕ | ❌ |
| | Editar | ✅ | ❌ | ✏️ | ✏️ | ❌ | 🔒² | ❌ |
| | Eliminar | ✅ | ❌ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Cambiar estado | ✅ | ❌ | ✏️ | ✏️ | ❌ | 🔒² | ❌ |
| | Asignar persona | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Registrar horas reales | ✅ | ❌ | ✏️ | ✏️ | ❌ | ✏️ | ❌ |
| | Subir evidencia | ✅ | ❌ | ✏️ | ✏️ | ❌ | ✏️ | ❌ |
| | **Validar tarea** | ✅ | ❌ | ✔️ | ✔️ | ❌ | ❌ | ❌ |
| | Agregar comentario | ✅ | ✏️ | ✏️ | ✏️ | ❌ | ✏️ | ❌ |
| **Backlog** | Ver backlog | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Reordenar items | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Filtrar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| **Tablero Scrum** | Ver tablero | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | **Drag & Drop** | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Filtrar por asignado | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Filtrar por prioridad | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| **Daily Meeting** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Crear | ✅ | ❌ | ➕ | ➕ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ✏️ | ✏️ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | 🗑️ | 🗑️ | ❌ | ❌ | ❌ |
| | Agregar participacion | ✅ | ❌ | ✏️ | ✏️ | ❌ | ✏️ | ❌ |
| | Editar mi participacion | ✅ | ❌ | ✏️ | ✏️ | ❌ | ✏️ | ❌ |

> **Notas:**
> - 🔒¹ DEV solo puede cambiar estado de HUs asignadas a él
> - 🔒² DEV solo puede editar/cambiar estado de tareas asignadas a él

---

## 6. MODULO AGILE - KANBAN (Actividades)

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Tareas (Kanban)** | Listar | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Ver detalle | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | **Crear** | ✅ | ❌ | ➕ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | 🔒³ |
| | Eliminar | ✅ | ❌ | 🗑️ | ❌ | ❌ | ❌ | ❌ |
| | Cambiar estado | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | 🔒³ |
| | Asignar persona | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Registrar horas | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ✏️ |
| | Subir evidencia | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ✏️ |
| | Agregar comentario | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ✏️ |
| **Subtareas** | Listar | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Ver detalle | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | **Crear** | ✅ | ❌ | ➕ | ❌ | ❌ | ❌ | ➕ |
| | Editar | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | 🔒⁴ |
| | Eliminar | ✅ | ❌ | 🗑️ | ❌ | ❌ | ❌ | ❌ |
| | Cambiar estado | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ✏️ |
| | Registrar horas | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ✏️ |
| | Subir evidencia | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ✏️ |
| | **Validar subtarea** | ✅ | ❌ | ✔️ | ❌ | ❌ | ❌ | ❌ |
| | Agregar comentario | ✅ | ✏️ | ✏️ | ❌ | ❌ | ❌ | ✏️ |
| **Tablero Kanban** | Ver tablero | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | **Drag & Drop** | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Filtrar por asignado | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Filtrar por prioridad | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| **Daily Meeting** | Listar | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Ver detalle | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Crear | ✅ | ❌ | ➕ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | 🗑️ | ❌ | ❌ | ❌ | ❌ |
| | Agregar participacion | ✅ | ❌ | ✏️ | ❌ | ❌ | ❌ | ✏️ |

> **Notas:**
> - 🔒³ IMP solo puede editar/cambiar estado de tareas asignadas a él
> - 🔒⁴ IMP solo puede editar subtareas asignadas a él

---

## 7. MODULO RECURSOS HUMANOS

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Personal** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver disponibilidad | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Buscar por habilidad | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| **Divisiones** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Habilidades** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Editar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Asignar a personal | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Asignaciones** | Listar | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Ver detalle | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Crear asignacion | ✅ | ❌ | ➕ | ❌ | ❌ | ❌ | ❌ |
| | Editar asignacion | ✅ | ❌ | ✏️ | 🔒⁵ | ❌ | ❌ | ❌ |
| | Eliminar asignacion | ✅ | ❌ | 🗑️ | ❌ | ❌ | ❌ | ❌ |

> **Notas:**
> - 🔒⁵ SM solo puede editar el porcentaje de dedicacion de los desarrolladores de sus proyectos

---

## 8. MODULO NOTIFICACIONES

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Notificaciones** | Ver propias | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| | Marcar como leida | ✅ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ |
| | Marcar todas leidas | ✅ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ |
| | Ver conteo no leidas | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| | Filtrar por tipo | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| **Preferencias** | Ver preferencias | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| | Editar preferencias | ✅ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ |

### Tipos de Notificacion por Rol

| Tipo | ADM | PMO | COO | SM | SPO | DEV | IMP |
|------|-----|-----|-----|-----|-----|-----|-----|
| Proyectos | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Sprints | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Retrasos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Aprobaciones | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tareas | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Sistema | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 9. MODULO DASHBOARD

| Submodulo | Accion | ADM | PMO | COO | SM | SPO | DEV | IMP |
|-----------|--------|-----|-----|-----|-----|-----|-----|-----|
| **Dashboard General** | Ver | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Ver KPIs globales | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ |
| | Ver salud proyectos | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| | Exportar reportes | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard Proyecto** | Ver (todos) | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver (asignados) | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver burndown | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver velocidad | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| | Ver actividad reciente | ✅ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | ❌ |
| **Dashboard Actividad** | Ver (todos) | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver (asignadas) | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Ver metricas Kanban | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| | Ver throughput | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | 👁️ |
| **Dashboard OEI** | Ver avance | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Ver proyectos por OEI | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 10. RESUMEN EJECUTIVO POR ROL

### ADMINISTRADOR (ADM)
- Acceso total a todos los modulos
- Unico rol con acceso a Administracion
- Puede realizar cualquier accion en el sistema

### PMO
- CRUD completo en PGD (OEI, OGD, OEGD, AE)
- CRUD completo en Proyectos y Actividades
- **Asigna Coordinador** a proyectos/actividades (el Coordinador asigna al equipo)
- **Aprueba:** Documentos, Actas, Cronogramas, Informes
- Solo lectura en Agile (backlog, sprints)
- Solo lectura en Asignaciones de personal (supervisa)

### COORDINADOR (COO)
- **No tiene acceso a PGD**
- **Asigna equipo:** SM, desarrolladores e implementadores con % de dedicacion
- CRUD en gestion agil (Epicas, Sprints, HUs, Tareas)
- **Crea tareas Kanban** (IMP no puede)
- Valida tareas y subtareas
- Aprueba Informes de Sprint (nivel 1)
- Dashboard de proyectos/actividades asignados

### SCRUM MASTER (SM)
- Similar a Coordinador pero **solo en Proyectos**
- **No gestiona Actividades**
- **Puede editar % dedicacion** de los desarrolladores de sus proyectos
- CRUD en gestion Scrum completa
- Valida tareas de sus proyectos
- Envia Informes de Sprint a aprobacion
- Dashboard de proyectos asignados

### PATROCINADOR (SPO)
- Solo lectura en proyectos asignados
- **Aprueba Acta de Constitucion** (junto con PMO)
- Recibe notificaciones de aprobaciones
- Sin acceso a gestion agil ni actividades

### DESARROLLADOR (DEV)
- **Solo proyectos** (no actividades)
- Vista de backlog y tablero
- **Crea tareas** dentro de HUs asignadas
- Edita solo sus tareas asignadas
- Sube evidencias
- Participa en Daily Meeting

### IMPLEMENTADOR (IMP)
- **Solo actividades** (no proyectos)
- Vista de tablero Kanban
- **Crea subtareas** (no tareas)
- Edita solo sus subtareas asignadas
- Sube evidencias
- Participa en Daily Meeting

---

## 11. FLUJOS DE APROBACION

### Documentos de Proyecto
```
SM/COO crea → PMO aprueba/rechaza
```

### Acta de Constitucion
```
SM/COO crea → PMO aprueba → Patrocinador aprueba
```

### Informe de Sprint
```
Sistema genera → SM edita → SM envia → Coordinador aprueba → PMO aprueba
```

### Informe de Actividad
```
Coordinador crea → PMO aprueba/rechaza
```

### Cronograma
```
SM/COO crea → PMO aprueba/rechaza
```

---

**Documento preparado por OTIN (Oficina Tecnica de Informatica)**

*Sistema SIGP - Matriz de Permisos Completa v1.0*
