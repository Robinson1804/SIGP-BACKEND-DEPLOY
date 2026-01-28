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
import { DailyMeetingService } from '../services/daily-meeting.service';
import { CreateDailyMeetingDto, CreateParticipanteDto } from '../dto/create-daily-meeting.dto';
import { UpdateDailyMeetingDto } from '../dto/update-daily-meeting.dto';
import { UpdateParticipanteDto } from '../dto/update-participante.dto';
import { DailyMeetingTipo } from '../enums/daily-meeting.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('daily-meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DailyMeetingController {
  constructor(private readonly dailyMeetingService: DailyMeetingService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateDailyMeetingDto, @CurrentUser('id') userId: number) {
    return this.dailyMeetingService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('tipo') tipo?: DailyMeetingTipo,
    @Query('proyectoId') proyectoId?: string,
    @Query('actividadId') actividadId?: string,
    @Query('sprintId') sprintId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.dailyMeetingService.findAll({
      tipo,
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      actividadId: actividadId ? parseInt(actividadId, 10) : undefined,
      sprintId: sprintId ? parseInt(sprintId, 10) : undefined,
      fechaDesde,
      fechaHasta,
    });
  }

  // IMPORTANTE: Las rutas con paths literales deben definirse ANTES de las rutas con parámetros
  // para evitar conflictos de routing (ej: 'participantes/:id' antes de ':id')

  @Patch('participantes/:participanteId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER, Role.DESARROLLADOR)
  updateParticipante(
    @Param('participanteId', ParseIntPipe) participanteId: number,
    @Body() updateDto: UpdateParticipanteDto,
  ) {
    return this.dailyMeetingService.updateParticipante(participanteId, updateDto);
  }

  @Delete('participantes/:participanteId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  removeParticipante(@Param('participanteId', ParseIntPipe) participanteId: number) {
    return this.dailyMeetingService.removeParticipante(participanteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dailyMeetingService.findOne(id);
  }

  @Get(':id/resumen')
  getResumen(@Param('id', ParseIntPipe) id: number) {
    return this.dailyMeetingService.getResumen(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDailyMeetingDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.dailyMeetingService.update(id, updateDto, userId);
  }

  @Post(':id/participantes')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  addParticipante(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDto: CreateParticipanteDto,
  ) {
    return this.dailyMeetingService.addParticipante(id, createDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.dailyMeetingService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/daily-meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoDailyMeetingsController {
  constructor(private readonly dailyMeetingService: DailyMeetingService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.dailyMeetingService.findByProyecto(proyectoId);
  }
}

@Controller('actividades/:actividadId/daily-meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadDailyMeetingsController {
  constructor(private readonly dailyMeetingService: DailyMeetingService) {}

  @Get()
  findByActividad(@Param('actividadId', ParseIntPipe) actividadId: number) {
    return this.dailyMeetingService.findByActividad(actividadId);
  }
}

@Controller('sprints/:sprintId/daily-meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintDailyMeetingsController {
  constructor(private readonly dailyMeetingService: DailyMeetingService) {}

  @Get()
  findBySprint(@Param('sprintId', ParseIntPipe) sprintId: number) {
    return this.dailyMeetingService.findBySprint(sprintId);
  }
}
