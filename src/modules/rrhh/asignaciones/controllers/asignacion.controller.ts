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
import { AsignacionService } from '../services/asignacion.service';
import { CreateAsignacionDto } from '../dto/create-asignacion.dto';
import { UpdateAsignacionDto } from '../dto/update-asignacion.dto';
import { TipoAsignacion } from '../enums/tipo-asignacion.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionController {
  constructor(private readonly asignacionService: AsignacionService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  create(@Body() createDto: CreateAsignacionDto, @CurrentUser('id') userId: number) {
    return this.asignacionService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('personalId') personalId?: string,
    @Query('tipoAsignacion') tipoAsignacion?: TipoAsignacion,
    @Query('proyectoId') proyectoId?: string,
    @Query('actividadId') actividadId?: string,
    @Query('subproyectoId') subproyectoId?: string,
    @Query('activo') activo?: string,
  ) {
    return this.asignacionService.findAll({
      personalId: personalId ? parseInt(personalId, 10) : undefined,
      tipoAsignacion,
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      actividadId: actividadId ? parseInt(actividadId, 10) : undefined,
      subproyectoId: subproyectoId ? parseInt(subproyectoId, 10) : undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get('alertas/sobrecarga')
  @Roles(Role.ADMIN, Role.PMO)
  getAlertasSobrecarga() {
    return this.asignacionService.getAlertasSobrecarga();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAsignacionDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.asignacionService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.asignacionService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoAsignacionesController {
  constructor(private readonly asignacionService: AsignacionService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.asignacionService.findByProyecto(proyectoId);
  }
}

@Controller('actividades/:actividadId/asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadAsignacionesController {
  constructor(private readonly asignacionService: AsignacionService) {}

  @Get()
  findByActividad(@Param('actividadId', ParseIntPipe) actividadId: number) {
    return this.asignacionService.findByActividad(actividadId);
  }
}

@Controller('subproyectos/:subproyectoId/asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubproyectoAsignacionesController {
  constructor(private readonly asignacionService: AsignacionService) {}

  @Get()
  findBySubproyecto(@Param('subproyectoId', ParseIntPipe) subproyectoId: number) {
    return this.asignacionService.findBySubproyecto(subproyectoId);
  }
}
