import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardGeneralService } from '../services/dashboard-general.service';
import { DashboardProyectoService } from '../services/dashboard-proyecto.service';
import { DashboardActividadService } from '../services/dashboard-actividad.service';
import { DashboardOeiService } from '../services/dashboard-oei.service';
import { DashboardGerencialService } from '../services/dashboard-gerencial.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly dashboardGeneralService: DashboardGeneralService,
    private readonly dashboardProyectoService: DashboardProyectoService,
    private readonly dashboardActividadService: DashboardActividadService,
    private readonly dashboardOeiService: DashboardOeiService,
    private readonly dashboardGerencialService: DashboardGerencialService,
  ) {}

  // Dashboard General
  @Get()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  getDashboardGeneral() {
    return this.dashboardGeneralService.getDashboard();
  }

  @Get('alertas')
  @Roles(Role.ADMIN, Role.PMO)
  getAlertas() {
    return this.dashboardGeneralService.getAlertas();
  }

  // Dashboard Proyecto
  @Get('proyecto/:id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  getDashboardProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardProyectoService.getDashboard(id);
  }

  @Get('proyecto/:id/burndown')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  getBurndownProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardProyectoService.getBurndown(id);
  }

  @Get('proyecto/:id/velocidad')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  getVelocidadProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardProyectoService.getVelocidad(id);
  }

  // Dashboard Actividad
  @Get('actividad/:id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.IMPLEMENTADOR)
  getDashboardActividad(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardActividadService.getDashboard(id);
  }

  @Get('actividad/:id/throughput')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.IMPLEMENTADOR)
  getThroughputActividad(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardActividadService.getThroughput(id);
  }

  // Dashboard OEI (Estratégico)
  @Get('oei')
  @Roles(Role.ADMIN, Role.PMO)
  getDashboardOei() {
    return this.dashboardOeiService.getDashboard();
  }

  // ====================================
  // Dashboard Gerencial (Nuevos Endpoints)
  // ====================================

  @Get('kpis')
  @ApiOperation({ summary: 'Obtener KPIs gerenciales con variacion vs periodo anterior' })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  getKpisGerenciales() {
    return this.dashboardGerencialService.getKpisConVariacion();
  }

  @Get('proyectos-activos')
  @ApiOperation({ summary: 'Obtener lista de proyectos activos con metricas' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  getProyectosActivos(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.dashboardGerencialService.getProyectosActivos(+page, +limit);
  }

  @Get('actividades-activas')
  @ApiOperation({ summary: 'Obtener lista de actividades activas con metricas Kanban' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  getActividadesActivas(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.dashboardGerencialService.getActividadesActivas(+page, +limit);
  }

  @Get('timeline-sprints')
  @ApiOperation({ summary: 'Obtener timeline de sprints para visualizacion Gantt' })
  @ApiQuery({ name: 'meses', required: false, type: Number, example: 3 })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  getSprintsTimeline(@Query('meses') meses: number = 3) {
    return this.dashboardGerencialService.getSprintsTimeline(+meses);
  }

  @Get('salud-proyectos')
  @ApiOperation({ summary: 'Obtener salud detallada de proyectos' })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  getSaludProyectos() {
    return this.dashboardGerencialService.getSaludProyectosDetallada();
  }

  @Get('proyecto/:id/actividad-reciente')
  @ApiOperation({ summary: 'Obtener feed de actividad reciente de un proyecto' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  getActividadReciente(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit: number = 20,
  ) {
    return this.dashboardGerencialService.getActividadReciente(id, +limit);
  }

  @Get('proyecto/:id/carga-equipo')
  @ApiOperation({ summary: 'Obtener carga de trabajo del equipo de un proyecto' })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  getCargaEquipo(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardGerencialService.getCargaEquipo(id);
  }

  // ====================================
  // Dashboard Actividad (Kanban) Endpoints
  // ====================================

  @Get('actividad/:id/cfd')
  @ApiOperation({ summary: 'Obtener datos para CFD (Cumulative Flow Diagram)' })
  @ApiQuery({ name: 'dias', required: false, type: Number, example: 30 })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.IMPLEMENTADOR)
  getCfdData(
    @Param('id', ParseIntPipe) id: number,
    @Query('dias') dias: number = 30,
  ) {
    return this.dashboardGerencialService.getCfdData(id, +dias);
  }

  @Get('actividad/:id/tendencias-metricas')
  @ApiOperation({ summary: 'Obtener tendencias de metricas Kanban de una actividad' })
  @ApiQuery({ name: 'semanas', required: false, type: Number, example: 8 })
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.IMPLEMENTADOR)
  getTendenciasMetricas(
    @Param('id', ParseIntPipe) id: number,
    @Query('semanas') semanas: number = 8,
  ) {
    return this.dashboardGerencialService.getTendenciasMetricas(id, +semanas);
  }
}
