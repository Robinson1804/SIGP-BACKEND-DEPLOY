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
import { TareaService } from '../services/tarea.service';
import { CreateTareaDto } from '../dto/create-tarea.dto';
import { UpdateTareaDto } from '../dto/update-tarea.dto';
import { CambiarEstadoTareaDto } from '../dto/cambiar-estado-tarea.dto';
import { ValidarTareaDto } from '../dto/validar-tarea.dto';
import { CreateEvidenciaTareaDto } from '../dto/create-evidencia-tarea.dto';
import { TareaTipo, TareaEstado, TareaPrioridad } from '../enums/tarea.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';
import { HistorialCambioService } from '../../common/services/historial-cambio.service';
import { HistorialEntidadTipo } from '../../common/enums/historial-cambio.enum';

@Controller('tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareaController {
  constructor(
    private readonly tareaService: TareaService,
    private readonly historialCambioService: HistorialCambioService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateTareaDto, @CurrentUser('id') userId: number) {
    return this.tareaService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('tipo') tipo?: TareaTipo,
    @Query('historiaUsuarioId') historiaUsuarioId?: string,
    @Query('actividadId') actividadId?: string,
    @Query('estado') estado?: TareaEstado,
    @Query('prioridad') prioridad?: TareaPrioridad,
    @Query('asignadoA') asignadoA?: string,
    @Query('activo') activo?: string,
  ) {
    return this.tareaService.findAll({
      tipo,
      historiaUsuarioId: historiaUsuarioId ? parseInt(historiaUsuarioId, 10) : undefined,
      actividadId: actividadId ? parseInt(actividadId, 10) : undefined,
      estado,
      prioridad,
      asignadoA: asignadoA ? parseInt(asignadoA, 10) : undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tareaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR, Role.IMPLEMENTADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTareaDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.tareaService.update(id, updateDto, userId, userRole);
  }

  @Patch(':id/estado')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoTareaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaService.cambiarEstado(id, cambiarEstadoDto, userId);
  }

  @Patch(':id/validar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  validar(
    @Param('id', ParseIntPipe) id: number,
    @Body() validarDto: ValidarTareaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaService.validar(id, validarDto, userId);
  }

  @Patch(':id/mover')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  mover(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: TareaEstado,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaService.mover(id, estado, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.tareaService.remove(id, userId, userRole);
  }

  // ================================================================
  // Endpoints de Evidencias
  // ================================================================

  @Post(':id/evidencias')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  agregarEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDto: CreateEvidenciaTareaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaService.agregarEvidencia(id, createDto, userId);
  }

  @Get(':id/evidencias')
  obtenerEvidencias(@Param('id', ParseIntPipe) id: number) {
    return this.tareaService.obtenerEvidencias(id);
  }

  @Delete(':id/evidencias/:evidenciaId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  eliminarEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('evidenciaId', ParseIntPipe) evidenciaId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.tareaService.eliminarEvidencia(id, evidenciaId, userId);
  }

  // ================================================================
  // Endpoint de Historial
  // ================================================================

  @Get(':id/historial')
  obtenerHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.historialCambioService.findByEntidad(
      HistorialEntidadTipo.TAREA,
      id,
    );
  }
}

@Controller('historias-usuario/:historiaUsuarioId/tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistoriaUsuarioTareasController {
  constructor(private readonly tareaService: TareaService) {}

  @Get()
  findByHistoriaUsuario(
    @Param('historiaUsuarioId', ParseIntPipe) historiaUsuarioId: number,
  ) {
    return this.tareaService.findByHistoriaUsuario(historiaUsuarioId);
  }
}

@Controller('actividades/:actividadId/tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadTareasController {
  constructor(private readonly tareaService: TareaService) {}

  @Get()
  findByActividad(@Param('actividadId', ParseIntPipe) actividadId: number) {
    return this.tareaService.findByActividad(actividadId);
  }
}
