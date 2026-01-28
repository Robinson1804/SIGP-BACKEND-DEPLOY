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
import { ComentarioService } from '../services/comentario.service';
import { CreateComentarioDto } from '../dto/create-comentario.dto';
import { UpdateComentarioDto } from '../dto/update-comentario.dto';
import { EntidadTipoComentario } from '../entities/comentario.entity';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

/**
 * Controller principal para comentarios
 * Maneja operaciones CRUD en /comentarios
 */
@Controller('comentarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  /**
   * Crear un nuevo comentario
   * POST /comentarios
   */
  @Post()
  create(
    @Body() createDto: CreateComentarioDto,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.comentarioService.create(createDto, usuarioId);
  }

  /**
   * Listar comentarios con filtros opcionales
   * GET /comentarios?entidadTipo=HU&entidadId=1&usuarioId=1&soloRaiz=true
   */
  @Get()
  findAll(
    @Query('entidadTipo') entidadTipo?: EntidadTipoComentario,
    @Query('entidadId') entidadId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('activo') activo?: string,
    @Query('soloRaiz') soloRaiz?: string,
  ) {
    return this.comentarioService.findAll({
      entidadTipo,
      entidadId: entidadId ? parseInt(entidadId, 10) : undefined,
      usuarioId: usuarioId ? parseInt(usuarioId, 10) : undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
      soloRaiz: soloRaiz !== undefined ? soloRaiz === 'true' : undefined,
    });
  }

  /**
   * Obtener un comentario por ID
   * GET /comentarios/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comentarioService.findOne(id);
  }

  /**
   * Actualizar un comentario
   * PATCH /comentarios/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateComentarioDto,
    @CurrentUser('id') usuarioId: number,
    @CurrentUser('rol') userRole: string,
  ) {
    return this.comentarioService.update(id, updateDto, usuarioId, userRole);
  }

  /**
   * Eliminar un comentario (soft delete)
   * DELETE /comentarios/:id
   */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') usuarioId: number,
    @CurrentUser('rol') userRole: string,
  ) {
    return this.comentarioService.remove(id, usuarioId, userRole);
  }
}

/**
 * Controller anidado para comentarios de Historias de Usuario
 * Maneja operaciones en /historias-usuario/:entidadId/comentarios
 */
@Controller('historias-usuario/:entidadId/comentarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HuComentariosController {
  constructor(private readonly comentarioService: ComentarioService) {}

  /**
   * Listar comentarios de una Historia de Usuario
   * GET /historias-usuario/:entidadId/comentarios
   */
  @Get()
  findByHistoriaUsuario(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.comentarioService.findByHistoriaUsuario(entidadId);
  }

  /**
   * Crear comentario en una Historia de Usuario
   * POST /historias-usuario/:entidadId/comentarios
   */
  @Post()
  createInHu(
    @Param('entidadId', ParseIntPipe) entidadId: number,
    @Body() createDto: Omit<CreateComentarioDto, 'entidadTipo' | 'entidadId'>,
    @CurrentUser('id') usuarioId: number,
  ) {
    const fullDto: CreateComentarioDto = {
      ...createDto,
      entidadTipo: EntidadTipoComentario.HU,
      entidadId,
      texto: (createDto as any).texto,
    };
    return this.comentarioService.create(fullDto, usuarioId);
  }

  /**
   * Contar comentarios de una Historia de Usuario
   * GET /historias-usuario/:entidadId/comentarios/count
   */
  @Get('count')
  countByHu(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.comentarioService.countByEntidad(
      EntidadTipoComentario.HU,
      entidadId,
    );
  }
}

/**
 * Controller anidado para comentarios de Tareas
 * Maneja operaciones en /tareas/:entidadId/comentarios
 */
@Controller('tareas/:entidadId/comentarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareaComentariosController {
  constructor(private readonly comentarioService: ComentarioService) {}

  /**
   * Listar comentarios de una Tarea
   * GET /tareas/:entidadId/comentarios
   */
  @Get()
  findByTarea(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.comentarioService.findByTarea(entidadId);
  }

  /**
   * Crear comentario en una Tarea
   * POST /tareas/:entidadId/comentarios
   */
  @Post()
  createInTarea(
    @Param('entidadId', ParseIntPipe) entidadId: number,
    @Body() createDto: Omit<CreateComentarioDto, 'entidadTipo' | 'entidadId'>,
    @CurrentUser('id') usuarioId: number,
  ) {
    const fullDto: CreateComentarioDto = {
      ...createDto,
      entidadTipo: EntidadTipoComentario.TAREA,
      entidadId,
      texto: (createDto as any).texto,
    };
    return this.comentarioService.create(fullDto, usuarioId);
  }

  /**
   * Contar comentarios de una Tarea
   * GET /tareas/:entidadId/comentarios/count
   */
  @Get('count')
  countByTarea(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.comentarioService.countByEntidad(
      EntidadTipoComentario.TAREA,
      entidadId,
    );
  }
}

/**
 * Controller anidado para comentarios de Subtareas
 * Maneja operaciones en /subtareas/:entidadId/comentarios
 */
@Controller('subtareas/:entidadId/comentarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubtareaComentariosController {
  constructor(private readonly comentarioService: ComentarioService) {}

  /**
   * Listar comentarios de una Subtarea
   * GET /subtareas/:entidadId/comentarios
   */
  @Get()
  findBySubtarea(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.comentarioService.findBySubtarea(entidadId);
  }

  /**
   * Crear comentario en una Subtarea
   * POST /subtareas/:entidadId/comentarios
   */
  @Post()
  createInSubtarea(
    @Param('entidadId', ParseIntPipe) entidadId: number,
    @Body() createDto: Omit<CreateComentarioDto, 'entidadTipo' | 'entidadId'>,
    @CurrentUser('id') usuarioId: number,
  ) {
    const fullDto: CreateComentarioDto = {
      ...createDto,
      entidadTipo: EntidadTipoComentario.SUBTAREA,
      entidadId,
      texto: (createDto as any).texto,
    };
    return this.comentarioService.create(fullDto, usuarioId);
  }

  /**
   * Contar comentarios de una Subtarea
   * GET /subtareas/:entidadId/comentarios/count
   */
  @Get('count')
  countBySubtarea(@Param('entidadId', ParseIntPipe) entidadId: number) {
    return this.comentarioService.countByEntidad(
      EntidadTipoComentario.SUBTAREA,
      entidadId,
    );
  }
}
