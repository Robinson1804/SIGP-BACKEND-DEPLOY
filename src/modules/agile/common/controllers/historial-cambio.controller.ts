import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { HistorialCambioService } from '../services/historial-cambio.service';
import {
  HistorialEntidadTipo,
  HistorialAccion,
} from '../enums/historial-cambio.enum';
import { HistorialCambioResponseDto } from '../dto/historial-cambio-response.dto';

/**
 * Controller principal para consulta de historial de cambios
 * NOTA: Este controller es de SOLO LECTURA - no permite crear/actualizar/eliminar
 */
@ApiTags('Historial de Cambios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('historial-cambios')
export class HistorialCambioController {
  constructor(private readonly historialService: HistorialCambioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar historial de cambios con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios encontrados',
    type: [HistorialCambioResponseDto],
  })
  @ApiQuery({
    name: 'entidadTipo',
    required: false,
    enum: HistorialEntidadTipo,
    description: 'Filtrar por tipo de entidad',
  })
  @ApiQuery({
    name: 'entidadId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de entidad',
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de usuario que realizo el cambio',
  })
  @ApiQuery({
    name: 'accion',
    required: false,
    enum: HistorialAccion,
    description: 'Filtrar por tipo de accion',
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Filtrar desde fecha (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numero de pagina (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por pagina (default: 50, max: 100)',
  })
  async findAll(
    @Query('entidadTipo') entidadTipo?: HistorialEntidadTipo,
    @Query('entidadId') entidadId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('accion') accion?: HistorialAccion,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { data, total } = await this.historialService.findAll({
      entidadTipo,
      entidadId: entidadId ? parseInt(entidadId, 10) : undefined,
      usuarioId: usuarioId ? parseInt(usuarioId, 10) : undefined,
      accion,
      fechaDesde,
      fechaHasta,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
    });

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? Math.min(parseInt(limit, 10), 100) : 50;

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get('recientes')
  @ApiOperation({ summary: 'Obtener cambios mas recientes del sistema' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios recientes',
    type: [HistorialCambioResponseDto],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros (default: 50, max: 100)',
  })
  async findRecientes(@Query('limit') limit?: string) {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 100) : 50;
    return this.historialService.findRecientes(limitNum);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadisticas de cambios en un rango de fechas' })
  @ApiResponse({
    status: 200,
    description: 'Estadisticas de cambios',
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: true,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: true,
    type: String,
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  async getEstadisticas(
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
  ) {
    return this.historialService.getEstadisticas(fechaDesde, fechaHasta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de historial por ID' })
  @ApiResponse({
    status: 200,
    description: 'Registro de historial encontrado',
    type: HistorialCambioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del registro de historial' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findOne(id);
  }
}

/**
 * Controller anidado para historial de Historias de Usuario
 */
@ApiTags('Historias de Usuario - Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('historias-usuario/:entidadId/historial')
export class HistoriaUsuarioHistorialController {
  constructor(private readonly historialService: HistorialCambioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener historial de cambios de una Historia de Usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios de la HU',
    type: [HistorialCambioResponseDto],
  })
  @ApiParam({ name: 'entidadId', type: Number, description: 'ID de la Historia de Usuario' })
  async findByHistoriaUsuario(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.historialService.findByHistoriaUsuario(entidadId);
  }
}

/**
 * Controller anidado para historial de Tareas
 */
@ApiTags('Tareas - Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tareas/:entidadId/historial')
export class TareaHistorialController {
  constructor(private readonly historialService: HistorialCambioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener historial de cambios de una Tarea' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios de la Tarea',
    type: [HistorialCambioResponseDto],
  })
  @ApiParam({ name: 'entidadId', type: Number, description: 'ID de la Tarea' })
  async findByTarea(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.historialService.findByTarea(entidadId);
  }
}

/**
 * Controller anidado para historial de Sprints
 */
@ApiTags('Sprints - Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sprints/:entidadId/historial')
export class SprintHistorialController {
  constructor(private readonly historialService: HistorialCambioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener historial de cambios de un Sprint' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios del Sprint',
    type: [HistorialCambioResponseDto],
  })
  @ApiParam({ name: 'entidadId', type: Number, description: 'ID del Sprint' })
  async findBySprint(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.historialService.findBySprint(entidadId);
  }
}

/**
 * Controller anidado para historial de Epicas
 */
@ApiTags('Epicas - Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('epicas/:entidadId/historial')
export class EpicaHistorialController {
  constructor(private readonly historialService: HistorialCambioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener historial de cambios de una Epica' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios de la Epica',
    type: [HistorialCambioResponseDto],
  })
  @ApiParam({ name: 'entidadId', type: Number, description: 'ID de la Epica' })
  async findByEpica(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.historialService.findByEpica(entidadId);
  }
}

/**
 * Controller anidado para historial de Subtareas
 */
@ApiTags('Subtareas - Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subtareas/:entidadId/historial')
export class SubtareaHistorialController {
  constructor(private readonly historialService: HistorialCambioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener historial de cambios de una Subtarea' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios de la Subtarea',
    type: [HistorialCambioResponseDto],
  })
  @ApiParam({ name: 'entidadId', type: Number, description: 'ID de la Subtarea' })
  async findBySubtarea(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.historialService.findByEntidad(
      HistorialEntidadTipo.SUBTAREA,
      entidadId,
    );
  }
}
