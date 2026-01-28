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
import { HistoriaUsuarioService } from '../services/historia-usuario.service';
import { CreateHistoriaUsuarioDto } from '../dto/create-historia-usuario.dto';
import { UpdateHistoriaUsuarioDto } from '../dto/update-historia-usuario.dto';
import { CambiarEstadoHuDto } from '../dto/cambiar-estado-hu.dto';
import { MoverSprintDto } from '../dto/mover-sprint.dto';
import { AsignarHuDto } from '../dto/asignar-hu.dto';
import { AgregarDependenciaDto } from '../dto/agregar-dependencia.dto';
import { ReordenarBacklogDto } from '../dto/reordenar-backlog.dto';
import { VincularRequerimientoDto } from '../dto/vincular-requerimiento.dto';
import { ValidarHuDto } from '../dto/validar-hu.dto';
import { HuPrioridad, HuEstado } from '../enums/historia-usuario.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('historias-usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistoriaUsuarioController {
  constructor(private readonly huService: HistoriaUsuarioService) {}

  @Get('next-codigo/:proyectoId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  getNextCodigo(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.huService.getNextCodigo(proyectoId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateHistoriaUsuarioDto, @CurrentUser('id') userId: number) {
    return this.huService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('epicaId') epicaId?: string,
    @Query('sprintId') sprintId?: string,
    @Query('estado') estado?: HuEstado,
    @Query('prioridad') prioridad?: HuPrioridad,
    @Query('asignadoA') asignadoA?: string,
    @Query('enBacklog') enBacklog?: string,
    @Query('activo') activo?: string,
  ) {
    return this.huService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      epicaId: epicaId ? parseInt(epicaId, 10) : undefined,
      sprintId: sprintId ? parseInt(sprintId, 10) : undefined,
      estado,
      prioridad,
      asignadoA: asignadoA ? parseInt(asignadoA, 10) : undefined,
      enBacklog: enBacklog === 'true',
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHistoriaUsuarioDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.update(id, updateDto, userId);
  }

  @Patch(':id/estado')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoHuDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.cambiarEstado(id, cambiarEstadoDto, userId);
  }

  /**
   * Validar (aprobar/rechazar) una Historia de Usuario en estado "En revisión"
   * Solo SCRUM_MASTER puede validar
   */
  @Patch(':id/validar')
  @Roles(Role.ADMIN, Role.PMO, Role.SCRUM_MASTER)
  validarHu(
    @Param('id', ParseIntPipe) id: number,
    @Body() validarDto: ValidarHuDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.validarHu(id, validarDto, userId);
  }

  /**
   * Regenerar el PDF de evidencias para una HU en estado "En revisión"
   * Útil para actualizar el formato del PDF con nuevas imágenes embebidas
   */
  @Post(':id/regenerar-pdf')
  @Roles(Role.ADMIN, Role.PMO, Role.SCRUM_MASTER)
  regenerarPdf(@Param('id', ParseIntPipe) id: number) {
    return this.huService.regenerarPdf(id);
  }

  @Patch(':id/mover-sprint')
  @Roles(Role.ADMIN, Role.PMO, Role.SCRUM_MASTER)
  moverASprint(
    @Param('id', ParseIntPipe) id: number,
    @Body() moverDto: MoverSprintDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.moverASprint(id, moverDto, userId);
  }

  @Patch(':id/asignar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() asignarDto: AsignarHuDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.asignar(id, asignarDto, userId);
  }

  @Post(':id/dependencias')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  agregarDependencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() agregarDto: AgregarDependenciaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.agregarDependencia(id, agregarDto, userId);
  }

  @Delete(':id/dependencias/:dependenciaId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  eliminarDependencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('dependenciaId', ParseIntPipe) dependenciaId: number,
  ) {
    return this.huService.eliminarDependencia(id, dependenciaId);
  }

  @Post(':id/requerimientos')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  vincularRequerimiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() vincularDto: VincularRequerimientoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.vincularRequerimiento(id, vincularDto, userId);
  }

  @Get(':id/requerimientos')
  obtenerRequerimientos(@Param('id', ParseIntPipe) id: number) {
    return this.huService.obtenerRequerimientos(id);
  }

  @Delete(':id/requerimientos/:requerimientoId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  desvincularRequerimiento(
    @Param('id', ParseIntPipe) id: number,
    @Param('requerimientoId', ParseIntPipe) requerimientoId: number,
  ) {
    return this.huService.desvincularRequerimiento(id, requerimientoId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.huService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/historias-usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoHistoriasUsuarioController {
  constructor(private readonly huService: HistoriaUsuarioService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.huService.findByProyecto(proyectoId);
  }

  @Get('backlog')
  getBacklog(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.huService.getBacklog(proyectoId);
  }

  @Patch('backlog/reordenar')
  @Roles(Role.ADMIN, Role.PMO, Role.SCRUM_MASTER)
  reordenarBacklog(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @Body() reordenarDto: ReordenarBacklogDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.huService.reordenarBacklog(proyectoId, reordenarDto, userId);
  }
}

@Controller('sprints/:sprintId/historias-usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintHistoriasUsuarioController {
  constructor(private readonly huService: HistoriaUsuarioService) {}

  @Get()
  findBySprint(@Param('sprintId', ParseIntPipe) sprintId: number) {
    return this.huService.findBySprint(sprintId);
  }
}

@Controller('epicas/:epicaId/historias-usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EpicaHistoriasUsuarioController {
  constructor(private readonly huService: HistoriaUsuarioService) {}

  @Get()
  findByEpica(@Param('epicaId', ParseIntPipe) epicaId: number) {
    return this.huService.findByEpica(epicaId);
  }
}
