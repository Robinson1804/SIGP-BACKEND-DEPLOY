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
import { ImpedimentoService } from '../services/impedimento.service';
import { CreateImpedimentoDto } from '../dto/create-impedimento.dto';
import { UpdateImpedimentoDto } from '../dto/update-impedimento.dto';
import { ImpedimentoEstado } from '../enums/impedimento.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('impedimentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImpedimentoController {
  constructor(private readonly impedimentoService: ImpedimentoService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  create(@Body() createDto: CreateImpedimentoDto) {
    return this.impedimentoService.create(createDto);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('sprintId') sprintId?: string,
    @Query('actividadId') actividadId?: string,
    @Query('estado') estado?: ImpedimentoEstado,
  ) {
    return this.impedimentoService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      sprintId: sprintId ? parseInt(sprintId, 10) : undefined,
      actividadId: actividadId ? parseInt(actividadId, 10) : undefined,
      estado,
    });
  }

  @Get('proyecto/:proyectoId')
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.impedimentoService.findByProyecto(proyectoId);
  }

  @Get('sprint/:sprintId')
  findBySprint(@Param('sprintId', ParseIntPipe) sprintId: number) {
    return this.impedimentoService.findBySprint(sprintId);
  }

  @Get('actividad/:actividadId')
  findByActividad(@Param('actividadId', ParseIntPipe) actividadId: number) {
    return this.impedimentoService.findByActividad(actividadId);
  }

  @Get('estadisticas')
  getEstadisticas(
    @Query('proyectoId') proyectoId?: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.impedimentoService.getEstadisticas({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      sprintId: sprintId ? parseInt(sprintId, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.impedimentoService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateImpedimentoDto,
  ) {
    return this.impedimentoService.update(id, updateDto);
  }

  @Patch(':id/resolver')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body('resolucion') resolucion: string,
  ) {
    return this.impedimentoService.resolve(id, resolucion);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.impedimentoService.remove(id);
  }
}
