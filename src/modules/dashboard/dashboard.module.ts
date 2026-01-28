import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities from other modules
import { Proyecto } from '../poi/proyectos/entities/proyecto.entity';
import { Actividad } from '../poi/actividades/entities/actividad.entity';
import { Sprint } from '../agile/sprints/entities/sprint.entity';
import { HistoriaUsuario } from '../agile/historias-usuario/entities/historia-usuario.entity';
import { Tarea } from '../agile/tareas/entities/tarea.entity';
import { Asignacion } from '../rrhh/asignaciones/entities/asignacion.entity';
import { Personal } from '../rrhh/personal/entities/personal.entity';
import { Pgd } from '../planning/pgd/entities/pgd.entity';
import { Oei } from '../planning/oei/entities/oei.entity';
import { AccionEstrategica } from '../planning/acciones-estrategicas/entities/accion-estrategica.entity';

// Services
import { DashboardGeneralService } from './services/dashboard-general.service';
import { DashboardProyectoService } from './services/dashboard-proyecto.service';
import { DashboardActividadService } from './services/dashboard-actividad.service';
import { DashboardOeiService } from './services/dashboard-oei.service';
import { DashboardGerencialService } from './services/dashboard-gerencial.service';

// Controllers
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // POI
      Proyecto,
      Actividad,
      // Agile
      Sprint,
      HistoriaUsuario,
      Tarea,
      // RRHH
      Asignacion,
      Personal,
      // Planning
      Pgd,
      Oei,
      AccionEstrategica,
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardGeneralService,
    DashboardProyectoService,
    DashboardActividadService,
    DashboardOeiService,
    DashboardGerencialService,
  ],
  exports: [
    DashboardGeneralService,
    DashboardProyectoService,
    DashboardActividadService,
    DashboardOeiService,
    DashboardGerencialService,
  ],
})
export class DashboardModule {}
