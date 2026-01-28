import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CronogramaService } from '../services/cronograma.service';
import { TareaCronogramaService } from '../services/tarea-cronograma.service';
import { DependenciaCronogramaService } from '../services/dependencia-cronograma.service';
import { RutaCriticaService } from '../services/ruta-critica.service';
import { ExportacionCronogramaService } from '../services/exportacion-cronograma.service';
import { CreateCronogramaDto } from '../dto/create-cronograma.dto';
import { UpdateCronogramaDto } from '../dto/update-cronograma.dto';
import { CreateTareaCronogramaDto } from '../dto/create-tarea-cronograma.dto';
import { UpdateTareaCronogramaDto } from '../dto/update-tarea-cronograma.dto';
import { CreateDependenciaDto } from '../dto/create-dependencia.dto';
import { AprobarCronogramaDto } from '../dto/aprobar-cronograma.dto';
import { ResultadoRutaCriticaDto, DatosExportacionDto } from '../dto/ruta-critica-response.dto';
import { CronogramaEstado, TareaEstado } from '../enums/cronograma.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('cronogramas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CronogramaController {
  constructor(
    private readonly cronogramaService: CronogramaService,
    private readonly rutaCriticaService: RutaCriticaService,
    private readonly exportacionService: ExportacionCronogramaService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateCronogramaDto, @CurrentUser('id') userId: number) {
    return this.cronogramaService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('estado') estado?: CronogramaEstado,
    @Query('activo') activo?: string,
  ) {
    return this.cronogramaService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      estado,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cronogramaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCronogramaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.cronogramaService.update(id, updateDto, userId);
  }

  @Post(':id/estado')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: CronogramaEstado,
    @CurrentUser('id') userId: number,
  ) {
    return this.cronogramaService.cambiarEstado(id, estado, userId);
  }

  @Post(':id/aprobar')
  @Roles(Role.ADMIN, Role.PMO, Role.PATROCINADOR)
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AprobarCronogramaDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('rol') userRole: string,
  ) {
    return this.cronogramaService.aprobar(id, dto, userId, userRole);
  }

  @Post(':id/enviar-revision')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  enviarARevision(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.cronogramaService.enviarARevision(id, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.cronogramaService.remove(id, userId);
  }

  @Get(':id/ruta-critica')
  getRutaCritica(@Param('id', ParseIntPipe) id: number): Promise<ResultadoRutaCriticaDto> {
    return this.rutaCriticaService.calcularRutaCritica(id);
  }

  @Post(':id/recalcular')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  recalcularFechas(@Param('id', ParseIntPipe) id: number) {
    return this.rutaCriticaService.recalcularFechas(id);
  }

  @Get(':id/exportar')
  exportar(
    @Param('id', ParseIntPipe) id: number,
    @Query('formato') formato: string,
  ): Promise<DatosExportacionDto | string> {
    if (formato === 'csv') {
      return this.exportacionService.exportarCSV(id);
    }
    return this.exportacionService.exportarJSON(id);
  }

  @Get(':id/plantilla-importacion')
  getPlantillaImportacion() {
    return this.exportacionService.generarPlantillaImportacion();
  }
}

@Controller('proyectos/:proyectoId/cronogramas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoCronogramasController {
  constructor(private readonly cronogramaService: CronogramaService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.cronogramaService.findByProyecto(proyectoId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  createForProyecto(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @Body() createDto: CreateCronogramaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.cronogramaService.create({ ...createDto, proyectoId }, userId);
  }
}

// Endpoint singular para obtener el cronograma activo de un proyecto
@Controller('proyectos/:proyectoId/cronograma')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoCronogramaController {
  constructor(private readonly cronogramaService: CronogramaService) {}

  @Get()
  async findActiveByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    const cronogramas = await this.cronogramaService.findByProyecto(proyectoId);
    if (cronogramas.length === 0) {
      return null;
    }
    // Retornar el cronograma mas reciente (activo)
    return cronogramas[0];
  }

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  createForProyecto(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @Body() createDto: CreateCronogramaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.cronogramaService.create({ ...createDto, proyectoId }, userId);
  }
}

@Controller('tareas-cronograma')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareaCronogramaController {
  constructor(private readonly tareaCronogramaService: TareaCronogramaService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateTareaCronogramaDto, @CurrentUser('id') userId: number) {
    return this.tareaCronogramaService.create(createDto, userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tareaCronogramaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTareaCronogramaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaCronogramaService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.tareaCronogramaService.remove(id, userId);
  }

  /**
   * Actualiza SOLO el estado de una tarea del cronograma.
   * Funciona incluso cuando el cronograma está aprobado.
   * Solo ADMIN, SCRUM_MASTER y COORDINADOR pueden usar este endpoint.
   */
  @Patch(':id/estado')
  @Roles(Role.ADMIN, Role.SCRUM_MASTER, Role.COORDINADOR)
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: TareaEstado,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaCronogramaService.updateEstadoOnly(id, estado, userId);
  }
}

@Controller('cronogramas/:cronogramaId/tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CronogramaTareasController {
  constructor(private readonly tareaCronogramaService: TareaCronogramaService) {}

  @Get()
  findByCronograma(@Param('cronogramaId', ParseIntPipe) cronogramaId: number) {
    return this.tareaCronogramaService.findByCronograma(cronogramaId);
  }

  @Patch(':tareaId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  update(
    @Param('cronogramaId', ParseIntPipe) cronogramaId: number,
    @Param('tareaId', ParseIntPipe) tareaId: number,
    @Body() updateDto: UpdateTareaCronogramaDto,
    @CurrentUser('id') userId: number,
  ) {
    // El cronogramaId se puede usar para validación adicional si es necesario
    return this.tareaCronogramaService.update(tareaId, updateDto, userId);
  }

  @Delete(':tareaId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(
    @Param('cronogramaId', ParseIntPipe) cronogramaId: number,
    @Param('tareaId', ParseIntPipe) tareaId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaCronogramaService.remove(tareaId, userId);
  }
}

@Controller('cronogramas/:cronogramaId/dependencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CronogramaDependenciasController {
  constructor(
    private readonly dependenciaService: DependenciaCronogramaService,
  ) {}

  @Get()
  findByCronograma(@Param('cronogramaId', ParseIntPipe) cronogramaId: number) {
    return this.dependenciaService.findByCronograma(cronogramaId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(
    @Param('cronogramaId', ParseIntPipe) cronogramaId: number,
    @Body() createDto: CreateDependenciaDto,
  ) {
    return this.dependenciaService.create(cronogramaId, createDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dependenciaService.remove(id);
  }
}

@Controller('tareas-cronograma/:tareaId/dependencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareaDependenciasController {
  constructor(
    private readonly dependenciaService: DependenciaCronogramaService,
  ) {}

  @Get()
  findByTarea(@Param('tareaId', ParseIntPipe) tareaId: number) {
    return this.dependenciaService.findByTarea(tareaId);
  }
}
