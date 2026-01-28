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
import { InformeSprintService } from '../services/informe-sprint.service';
import { CreateInformeSprintDto } from '../dto/create-informe-sprint.dto';
import { UpdateInformeSprintDto } from '../dto/update-informe-sprint.dto';
import { AprobarInformeSprintDto } from '../dto/aprobar-informe-sprint.dto';
import { InformeSprintEstado } from '../enums/informe-sprint.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('informes-sprint')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InformeSprintController {
  constructor(private readonly informeSprintService: InformeSprintService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateInformeSprintDto, @CurrentUser('id') userId: number) {
    return this.informeSprintService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('estado') estado?: InformeSprintEstado,
    @Query('activo') activo?: string,
  ) {
    return this.informeSprintService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      estado,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.informeSprintService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInformeSprintDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.informeSprintService.update(id, updateDto, userId);
  }

  @Post(':id/enviar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  enviar(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.informeSprintService.enviar(id, userId);
  }

  @Post(':id/aprobar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarDto: AprobarInformeSprintDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.informeSprintService.aprobar(id, aprobarDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.informeSprintService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/informes-sprint')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoInformesSprintController {
  constructor(private readonly informeSprintService: InformeSprintService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.informeSprintService.findByProyecto(proyectoId);
  }
}
