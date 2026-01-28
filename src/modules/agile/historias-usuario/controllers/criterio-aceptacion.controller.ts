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
import { CriterioAceptacionService } from '../services/criterio-aceptacion.service';
import { CreateCriterioAceptacionDto } from '../dto/create-criterio-aceptacion.dto';
import { UpdateCriterioAceptacionDto } from '../dto/update-criterio-aceptacion.dto';
import { ReordenarCriteriosDto } from '../dto/reordenar-criterios.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

/**
 * Controller principal para Criterios de Aceptacion
 * Ruta base: /criterios-aceptacion
 */
@Controller('criterios-aceptacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CriterioAceptacionController {
  constructor(private readonly criterioService: CriterioAceptacionService) {}

  /**
   * POST /criterios-aceptacion
   * Crear un nuevo criterio de aceptacion
   */
  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(
    @Body() createDto: CreateCriterioAceptacionDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.criterioService.create(createDto, userId);
  }

  /**
   * GET /criterios-aceptacion
   * Listar criterios, opcionalmente filtrados por historiaUsuarioId
   */
  @Get()
  findAll(@Query('historiaUsuarioId') historiaUsuarioId?: string) {
    const huId = historiaUsuarioId ? parseInt(historiaUsuarioId, 10) : undefined;
    return this.criterioService.findAll(huId);
  }

  /**
   * GET /criterios-aceptacion/:id
   * Obtener un criterio por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.criterioService.findOne(id);
  }

  /**
   * PATCH /criterios-aceptacion/:id
   * Actualizar un criterio
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCriterioAceptacionDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.criterioService.update(id, updateDto, userId);
  }

  /**
   * DELETE /criterios-aceptacion/:id
   * Eliminar un criterio (soft delete)
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.criterioService.remove(id, userId);
  }
}

/**
 * Controller anidado para Criterios de Aceptacion bajo Historias de Usuario
 * Ruta base: /historias-usuario/:huId/criterios-aceptacion
 */
@Controller('historias-usuario/:huId/criterios-aceptacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HuCriteriosAceptacionController {
  constructor(private readonly criterioService: CriterioAceptacionService) {}

  /**
   * GET /historias-usuario/:huId/criterios-aceptacion
   * Listar criterios de una Historia de Usuario
   */
  @Get()
  findByHistoriaUsuario(@Param('huId', ParseIntPipe) huId: number) {
    return this.criterioService.findByHistoriaUsuario(huId);
  }

  /**
   * POST /historias-usuario/:huId/criterios-aceptacion
   * Crear un criterio para una Historia de Usuario especifica
   */
  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(
    @Param('huId', ParseIntPipe) huId: number,
    @Body() createDto: Omit<CreateCriterioAceptacionDto, 'historiaUsuarioId'>,
    @CurrentUser('id') userId: number,
  ) {
    return this.criterioService.createForHu(huId, createDto, userId);
  }

  /**
   * PATCH /historias-usuario/:huId/criterios-aceptacion/reordenar
   * Reordenar multiples criterios de una Historia de Usuario
   */
  @Patch('reordenar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  reordenar(
    @Param('huId', ParseIntPipe) huId: number,
    @Body() reordenarDto: ReordenarCriteriosDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.criterioService.reordenar(huId, reordenarDto, userId);
  }
}
