import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesModule } from '../notificaciones';
import { StorageModule } from '../storage/storage.module';

// Entities
import { Proyecto } from './proyectos/entities/proyecto.entity';
import { Actividad } from './actividades/entities/actividad.entity';
import { Subproyecto } from './subproyectos/entities/subproyecto.entity';
import { Documento } from './documentos/entities/documento.entity';
import { Acta } from './actas/entities/acta.entity';
import { Requerimiento } from './requerimientos/entities/requerimiento.entity';
import { Cronograma, TareaCronograma, DependenciaCronograma } from './cronogramas/entities';
import { InformeSprint } from './informes-sprint/entities/informe-sprint.entity';
import { InformeActividad } from './informes-actividad/entities/informe-actividad.entity';
import { AccionEstrategica } from '../planning/acciones-estrategicas/entities/accion-estrategica.entity';
import { Usuario } from '../auth/entities/usuario.entity';

// Services
import { ProyectoService } from './proyectos/services/proyecto.service';
import { ActividadService } from './actividades/services/actividad.service';
import { SubproyectoService } from './subproyectos/services/subproyecto.service';
import { DocumentoService } from './documentos/services/documento.service';
import { ActaService } from './actas/services/acta.service';
import { ActaPdfService } from './actas/services/acta-pdf.service';
import { RequerimientoService } from './requerimientos/services/requerimiento.service';
import { CronogramaService, TareaCronogramaService, DependenciaCronogramaService, RutaCriticaService, ExportacionCronogramaService } from './cronogramas/services';
import { InformeSprintService } from './informes-sprint/services/informe-sprint.service';
import { InformeActividadService } from './informes-actividad/services/informe-actividad.service';

// Controllers
import {
  ProyectoController,
  AccionEstrategicaProyectosController,
} from './proyectos/controllers/proyecto.controller';
import { ActividadController } from './actividades/controllers/actividad.controller';
import {
  SubproyectoController,
  ProyectoSubproyectosController,
} from './subproyectos/controllers/subproyecto.controller';
import {
  DocumentoController,
  ProyectoDocumentosController,
  SubproyectoDocumentosController,
} from './documentos/controllers/documento.controller';
import {
  ActaController,
  ProyectoActasController,
} from './actas/controllers/acta.controller';
import {
  RequerimientoController,
  ProyectoRequerimientosController,
} from './requerimientos/controllers/requerimiento.controller';
import {
  CronogramaController,
  ProyectoCronogramasController,
  ProyectoCronogramaController,
  TareaCronogramaController,
  CronogramaTareasController,
  CronogramaDependenciasController,
  TareaDependenciasController,
} from './cronogramas/controllers/cronograma.controller';
import {
  InformeSprintController,
  ProyectoInformesSprintController,
} from './informes-sprint/controllers/informe-sprint.controller';
import {
  InformeActividadController,
  ActividadInformesController,
} from './informes-actividad/controllers/informe-actividad.controller';

@Module({
  imports: [
    forwardRef(() => NotificacionesModule),
    StorageModule,
    TypeOrmModule.forFeature([
      Proyecto,
      Actividad,
      Subproyecto,
      Documento,
      Acta,
      Requerimiento,
      Cronograma,
      TareaCronograma,
      DependenciaCronograma,
      InformeSprint,
      InformeActividad,
      AccionEstrategica,
      Usuario,
    ]),
  ],
  controllers: [
    // Proyectos
    ProyectoController,
    AccionEstrategicaProyectosController,
    // Actividades
    ActividadController,
    // Subproyectos
    SubproyectoController,
    ProyectoSubproyectosController,
    // Documentos
    DocumentoController,
    ProyectoDocumentosController,
    SubproyectoDocumentosController,
    // Actas
    ActaController,
    ProyectoActasController,
    // Requerimientos
    RequerimientoController,
    ProyectoRequerimientosController,
    // Cronogramas
    CronogramaController,
    ProyectoCronogramasController,
    ProyectoCronogramaController,
    TareaCronogramaController,
    CronogramaTareasController,
    CronogramaDependenciasController,
    TareaDependenciasController,
    // Informes Sprint
    InformeSprintController,
    ProyectoInformesSprintController,
    // Informes Actividad
    InformeActividadController,
    ActividadInformesController,
  ],
  providers: [
    ProyectoService,
    ActividadService,
    SubproyectoService,
    DocumentoService,
    ActaService,
    ActaPdfService,
    RequerimientoService,
    CronogramaService,
    TareaCronogramaService,
    DependenciaCronogramaService,
    RutaCriticaService,
    ExportacionCronogramaService,
    InformeSprintService,
    InformeActividadService,
  ],
  exports: [
    ProyectoService,
    ActividadService,
    SubproyectoService,
    DocumentoService,
    ActaService,
    ActaPdfService,
    RequerimientoService,
    CronogramaService,
    TareaCronogramaService,
    DependenciaCronogramaService,
    RutaCriticaService,
    ExportacionCronogramaService,
    InformeSprintService,
    InformeActividadService,
  ],
})
export class PoiModule {}
