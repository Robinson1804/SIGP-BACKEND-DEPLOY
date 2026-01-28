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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubtareaService } from '../services/subtarea.service';
import { CreateSubtareaDto } from '../dto/create-subtarea.dto';
import { UpdateSubtareaDto } from '../dto/update-subtarea.dto';
import { ReordenarSubtareasDto } from '../dto/reordenar-subtareas.dto';
import { CreateEvidenciaSubtareaDto } from '../dto/create-evidencia-subtarea.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('subtareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubtareaController {
  constructor(private readonly subtareaService: SubtareaService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.IMPLEMENTADOR)
  create(
    @Body() createDto: CreateSubtareaDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.subtareaService.create(createDto, userId, userRole);
  }

  @Get()
  findAll(@Query('tareaId') tareaId?: string) {
    return this.subtareaService.findAll(tareaId ? parseInt(tareaId, 10) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subtareaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.IMPLEMENTADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubtareaDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.subtareaService.update(id, updateDto, userId, userRole);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.IMPLEMENTADOR)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ): Promise<void> {
    await this.subtareaService.remove(id, userId, userRole);
  }

  // ================================================================
  // Endpoints de Evidencias
  // ================================================================

  @Post(':id/evidencias')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.DESARROLLADOR, Role.IMPLEMENTADOR)
  agregarEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDto: CreateEvidenciaSubtareaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.subtareaService.agregarEvidencia(id, createDto, userId);
  }

  @Get(':id/evidencias')
  obtenerEvidencias(@Param('id', ParseIntPipe) id: number) {
    return this.subtareaService.obtenerEvidencias(id);
  }

  @Delete(':id/evidencias/:evidenciaId')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.DESARROLLADOR, Role.IMPLEMENTADOR)
  eliminarEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('evidenciaId', ParseIntPipe) evidenciaId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.subtareaService.eliminarEvidencia(id, evidenciaId, userId);
  }
}

@Controller('tareas/:tareaId/subtareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareaSubtareasController {
  constructor(private readonly subtareaService: SubtareaService) {}

  @Get()
  findByTarea(@Param('tareaId', ParseIntPipe) tareaId: number) {
    return this.subtareaService.findByTarea(tareaId);
  }

  @Get('estadisticas')
  getEstadisticas(@Param('tareaId', ParseIntPipe) tareaId: number) {
    return this.subtareaService.getEstadisticasByTarea(tareaId);
  }

  @Patch('reordenar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.DESARROLLADOR, Role.IMPLEMENTADOR)
  reordenar(
    @Param('tareaId', ParseIntPipe) tareaId: number,
    @Body() dto: ReordenarSubtareasDto,
  ) {
    return this.subtareaService.reordenar(tareaId, dto.orden);
  }
}
