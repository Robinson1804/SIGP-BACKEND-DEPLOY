import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TableroService } from '../services/tablero.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

@Controller('sprints/:sprintId/tablero')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintTableroController {
  constructor(private readonly tableroService: TableroService) {}

  @Get()
  getTableroScrum(@Param('sprintId', ParseIntPipe) sprintId: number) {
    return this.tableroService.getTableroScrum(sprintId);
  }
}

@Controller('actividades/:actividadId/tablero')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadTableroController {
  constructor(private readonly tableroService: TableroService) {}

  @Get()
  getTableroKanban(@Param('actividadId', ParseIntPipe) actividadId: number) {
    return this.tableroService.getTableroKanban(actividadId);
  }
}

// Alias para compatibilidad con scripts
@Controller('actividades/:actividadId/tablero-kanban')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadTableroKanbanController {
  constructor(private readonly tableroService: TableroService) {}

  @Get()
  getTableroKanban(@Param('actividadId', ParseIntPipe) actividadId: number) {
    return this.tableroService.getTableroKanban(actividadId);
  }
}
