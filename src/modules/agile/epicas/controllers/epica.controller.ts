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
import { EpicaService } from '../services/epica.service';
import { CreateEpicaDto } from '../dto/create-epica.dto';
import { UpdateEpicaDto } from '../dto/update-epica.dto';
import { ReordenarEpicasDto } from '../dto/reordenar-epicas.dto';
import { EpicaPrioridad } from '../enums/epica.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('epicas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EpicaController {
  constructor(private readonly epicaService: EpicaService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateEpicaDto, @CurrentUser('id') userId: number) {
    return this.epicaService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('prioridad') prioridad?: EpicaPrioridad,
    @Query('activo') activo?: string,
  ) {
    return this.epicaService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      prioridad,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.epicaService.findOne(id);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.epicaService.getEstadisticas(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEpicaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.epicaService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.epicaService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/epicas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoEpicasController {
  constructor(private readonly epicaService: EpicaService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.epicaService.findByProyecto(proyectoId);
  }

  @Patch('reordenar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  reordenar(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @Body() reordenarDto: ReordenarEpicasDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.epicaService.reordenarEpicas(proyectoId, reordenarDto, userId);
  }
}
