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
import { SprintService } from '../services/sprint.service';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { CerrarSprintDto } from '../dto/cerrar-sprint.dto';
import { SprintEstado } from '../enums/sprint.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('sprints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateSprintDto, @CurrentUser('id') userId: number) {
    return this.sprintService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('estado') estado?: SprintEstado,
    @Query('activo') activo?: string,
  ) {
    return this.sprintService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      estado,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sprintService.findOne(id);
  }

  @Get(':id/burndown')
  getBurndown(@Param('id', ParseIntPipe) id: number) {
    return this.sprintService.getBurndown(id);
  }

  @Get(':id/metricas')
  getMetricas(@Param('id', ParseIntPipe) id: number) {
    return this.sprintService.getMetricas(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSprintDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.sprintService.update(id, updateDto, userId);
  }

  @Patch(':id/iniciar')
  @Roles(Role.ADMIN, Role.PMO, Role.SCRUM_MASTER)
  iniciar(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.sprintService.iniciar(id, userId);
  }

  @Patch(':id/cerrar')
  @Roles(Role.ADMIN, Role.PMO, Role.SCRUM_MASTER)
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cerrarDto: CerrarSprintDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.sprintService.cerrar(id, cerrarDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.sprintService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/sprints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoSprintsController {
  constructor(private readonly sprintService: SprintService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.sprintService.findByProyecto(proyectoId);
  }

  @Get('velocidad')
  getVelocidad(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.sprintService.getVelocidadProyecto(proyectoId);
  }
}
