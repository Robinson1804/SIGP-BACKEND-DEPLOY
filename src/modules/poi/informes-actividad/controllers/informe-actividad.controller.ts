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
import { InformeActividadService } from '../services/informe-actividad.service';
import { CreateInformeActividadDto } from '../dto/create-informe-actividad.dto';
import { UpdateInformeActividadDto } from '../dto/update-informe-actividad.dto';
import { AprobarInformeActividadDto } from '../dto/aprobar-informe-actividad.dto';
import { InformeActividadEstado, PeriodoInforme } from '../enums/informe-actividad.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('informes-actividad')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InformeActividadController {
  constructor(private readonly informeActividadService: InformeActividadService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  create(@Body() createDto: CreateInformeActividadDto, @CurrentUser('id') userId: number) {
    return this.informeActividadService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('actividadId') actividadId?: string,
    @Query('periodo') periodo?: PeriodoInforme,
    @Query('anio') anio?: string,
    @Query('estado') estado?: InformeActividadEstado,
    @Query('activo') activo?: string,
  ) {
    return this.informeActividadService.findAll({
      actividadId: actividadId ? parseInt(actividadId, 10) : undefined,
      periodo,
      anio: anio ? parseInt(anio, 10) : undefined,
      estado,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.informeActividadService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInformeActividadDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.informeActividadService.update(id, updateDto, userId);
  }

  @Post(':id/enviar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  enviar(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.informeActividadService.enviar(id, userId);
  }

  @Post(':id/aprobar')
  @Roles(Role.ADMIN, Role.PMO)
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarDto: AprobarInformeActividadDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.informeActividadService.aprobar(id, aprobarDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.informeActividadService.remove(id, userId);
  }
}

@Controller('actividades/:actividadId/informes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadInformesController {
  constructor(private readonly informeActividadService: InformeActividadService) {}

  @Get()
  findByActividad(@Param('actividadId', ParseIntPipe) actividadId: number) {
    return this.informeActividadService.findByActividad(actividadId);
  }
}
