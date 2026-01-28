import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, Not } from 'typeorm';
import { Tarea, EvidenciaTarea, TareaAsignado } from '../entities';
import { Subtarea } from '../../subtareas/entities/subtarea.entity';
import { HistoriaUsuario } from '../../historias-usuario/entities/historia-usuario.entity';
import { Proyecto } from '../../../poi/proyectos/entities/proyecto.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { CreateTareaDto } from '../dto/create-tarea.dto';
import { UpdateTareaDto } from '../dto/update-tarea.dto';
import { CambiarEstadoTareaDto } from '../dto/cambiar-estado-tarea.dto';
import { ValidarTareaDto } from '../dto/validar-tarea.dto';
import { CreateEvidenciaTareaDto } from '../dto/create-evidencia-tarea.dto';
import { TareaTipo, TareaEstado, TareaPrioridad } from '../enums/tarea.enum';
import { HuEstado } from '../../historias-usuario/enums/historia-usuario.enum';
import { HistorialCambioService } from '../../common/services/historial-cambio.service';
import { HistorialEntidadTipo, HistorialAccion } from '../../common/enums/historial-cambio.enum';
import { NotificacionService } from '../../../notificaciones/services/notificacion.service';
import { TipoNotificacion } from '../../../notificaciones/enums/tipo-notificacion.enum';
import { HuEvidenciaPdfService } from '../../historias-usuario/services/hu-evidencia-pdf.service';
import { MinioService } from '../../../storage/services/minio.service';

// Configuración de WIP limits por defecto por columna
const DEFAULT_WIP_LIMITS: Record<TareaEstado, number | null> = {
  [TareaEstado.POR_HACER]: null, // Sin límite
  [TareaEstado.EN_PROGRESO]: 5,  // Máximo 5 tareas en progreso
  [TareaEstado.EN_REVISION]: null, // Sin límite - pendiente de revisión
  [TareaEstado.FINALIZADO]: null, // Sin límite
};

@Injectable()
export class TareaService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(EvidenciaTarea)
    private readonly evidenciaRepository: Repository<EvidenciaTarea>,
    @InjectRepository(TareaAsignado)
    private readonly tareaAsignadoRepository: Repository<TareaAsignado>,
    @InjectRepository(Subtarea)
    private readonly subtareaRepository: Repository<Subtarea>,
    @InjectRepository(HistoriaUsuario)
    private readonly historiaUsuarioRepository: Repository<HistoriaUsuario>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly historialCambioService: HistorialCambioService,
    @Inject(forwardRef(() => NotificacionService))
    private readonly notificacionService: NotificacionService,
    private readonly huEvidenciaPdfService: HuEvidenciaPdfService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  async create(createDto: CreateTareaDto, userId?: number): Promise<Tarea> {
    // Validate that either historiaUsuarioId or actividadId is provided based on type
    if (createDto.tipo === TareaTipo.SCRUM && !createDto.historiaUsuarioId) {
      throw new BadRequestException('historiaUsuarioId es requerido para tareas SCRUM');
    }
    if (createDto.tipo === TareaTipo.KANBAN && !createDto.actividadId) {
      throw new BadRequestException('actividadId es requerido para tareas KANBAN');
    }

    // Validar fechas de la tarea contra el rango de la HU (solo para tareas SCRUM)
    if (createDto.tipo === TareaTipo.SCRUM && createDto.historiaUsuarioId) {
      await this.validarFechasContraHistoria(
        createDto.historiaUsuarioId,
        createDto.fechaInicio,
        createDto.fechaFin,
      );
    }

    // Check for duplicate code
    const whereCondition = createDto.tipo === TareaTipo.SCRUM
      ? { historiaUsuarioId: createDto.historiaUsuarioId, codigo: createDto.codigo }
      : { actividadId: createDto.actividadId, codigo: createDto.codigo };

    const existing = await this.tareaRepository.findOne({ where: whereCondition });

    if (existing) {
      throw new ConflictException(`Ya existe una tarea con el código ${createDto.codigo}`);
    }

    // Filtrar asignadoA y asignadosIds para manejar por separado
    const { asignadoA, asignadosIds, ...restDto } = createDto;

    // Si hay asignadosIds, usar el primero como asignadoA principal (compatibilidad)
    const asignadoPrincipal = asignadosIds && asignadosIds.length > 0
      ? asignadosIds[0]
      : (asignadoA ?? undefined);

    const tarea = this.tareaRepository.create({
      ...restDto,
      asignadoA: asignadoPrincipal,
      createdBy: userId,
      updatedBy: userId,
    });

    const tareaGuardada = await this.tareaRepository.save(tarea);

    // Crear entradas en tarea_asignados para todos los responsables
    if (asignadosIds && asignadosIds.length > 0) {
      const asignaciones = asignadosIds.map(usuarioId =>
        this.tareaAsignadoRepository.create({
          tareaId: tareaGuardada.id,
          usuarioId,
          rol: 'IMPLEMENTADOR',
          asignadoPor: userId,
        })
      );
      await this.tareaAsignadoRepository.save(asignaciones);

      // Notificar a todos los asignados
      for (const usuarioId of asignadosIds) {
        if (usuarioId !== userId) {
          await this.notificacionService.notificar(
            TipoNotificacion.TAREAS,
            usuarioId,
            {
              titulo: `Nueva tarea asignada: ${tareaGuardada.codigo}`,
              descripcion: `Se te ha asignado la tarea "${tareaGuardada.nombre}"`,
              entidadTipo: 'Tarea',
              entidadId: tareaGuardada.id,
              urlAccion: `/poi/tareas/${tareaGuardada.id}`,
            },
          );
        }
      }
    } else if (asignadoA && asignadoA !== userId) {
      // Compatibilidad: si solo se envió asignadoA, notificar
      await this.notificacionService.notificar(
        TipoNotificacion.TAREAS,
        asignadoA,
        {
          titulo: `Nueva tarea asignada: ${tareaGuardada.codigo}`,
          descripcion: `Se te ha asignado la tarea "${tareaGuardada.nombre}"`,
          entidadTipo: 'Tarea',
          entidadId: tareaGuardada.id,
          urlAccion: `/poi/tareas/${tareaGuardada.id}`,
        },
      );
    }

    // Registrar creacion en historial
    if (userId) {
      await this.historialCambioService.registrarCreacion(
        HistorialEntidadTipo.TAREA,
        tareaGuardada.id,
        userId,
        { codigo: tareaGuardada.codigo, nombre: tareaGuardada.nombre },
      );
    }

    return tareaGuardada;
  }

  async findAll(filters?: {
    tipo?: TareaTipo;
    historiaUsuarioId?: number;
    actividadId?: number;
    estado?: TareaEstado;
    prioridad?: TareaPrioridad;
    asignadoA?: number;
    activo?: boolean;
  }): Promise<Tarea[]> {
    const queryBuilder = this.tareaRepository
      .createQueryBuilder('tarea')
      .leftJoinAndSelect('tarea.asignado', 'asignado')
      .orderBy('tarea.prioridad', 'ASC')
      .addOrderBy('tarea.createdAt', 'DESC');

    if (filters?.tipo) {
      queryBuilder.andWhere('tarea.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.historiaUsuarioId) {
      queryBuilder.andWhere('tarea.historiaUsuarioId = :historiaUsuarioId', {
        historiaUsuarioId: filters.historiaUsuarioId,
      });
    }

    if (filters?.actividadId) {
      queryBuilder.andWhere('tarea.actividadId = :actividadId', {
        actividadId: filters.actividadId,
      });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('tarea.estado = :estado', { estado: filters.estado });
    }

    if (filters?.prioridad) {
      queryBuilder.andWhere('tarea.prioridad = :prioridad', { prioridad: filters.prioridad });
    }

    if (filters?.asignadoA) {
      queryBuilder.andWhere('tarea.asignadoA = :asignadoA', { asignadoA: filters.asignadoA });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('tarea.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByHistoriaUsuario(historiaUsuarioId: number): Promise<Tarea[]> {
    return this.tareaRepository.find({
      where: { historiaUsuarioId, activo: true },
      relations: ['asignado', 'asignados', 'asignados.usuario', 'creator'],
      order: { prioridad: 'ASC', createdAt: 'DESC' },
    });
  }

  async findByActividad(actividadId: number): Promise<Tarea[]> {
    return this.tareaRepository.find({
      where: { actividadId, activo: true },
      relations: ['asignado', 'asignados', 'asignados.usuario', 'creator'],
      order: { prioridad: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Tarea> {
    const tarea = await this.tareaRepository.findOne({
      where: { id },
      relations: ['historiaUsuario', 'actividad', 'asignado', 'validador', 'asignados', 'asignados.usuario', 'creator'],
    });

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return tarea;
  }

  async update(id: number, updateDto: UpdateTareaDto, userId?: number, userRole?: string): Promise<Tarea> {
    const tarea = await this.findOne(id);

    // Verificar si la tarea está finalizada
    if (tarea.estado === TareaEstado.FINALIZADO) {
      throw new ForbiddenException('No se puede editar una tarea finalizada');
    }

    // IMPLEMENTADOR no puede editar tareas, solo ver detalles
    if (userRole === 'IMPLEMENTADOR') {
      throw new ForbiddenException('Los implementadores no pueden editar tareas, solo pueden ver detalles');
    }

    // Si es tarea SCRUM, verificar estado de HU
    if (tarea.tipo === TareaTipo.SCRUM && tarea.historiaUsuarioId) {
      const hu = await this.historiaUsuarioRepository.findOne({
        where: { id: tarea.historiaUsuarioId },
      });
      if (hu?.estado === HuEstado.EN_REVISION) {
        throw new BadRequestException(
          'No se puede editar una tarea cuya Historia de Usuario está en revisión. Espere a que sea validada o rechazada.',
        );
      }
      if (hu?.estado === HuEstado.FINALIZADO) {
        throw new BadRequestException(
          'No se puede editar una tarea cuya Historia de Usuario ya fue validada y finalizada.',
        );
      }
    }

    // Validar fechas de la tarea contra el rango de la HU (solo para tareas SCRUM)
    if (tarea.tipo === TareaTipo.SCRUM && tarea.historiaUsuarioId) {
      const fechaInicio = updateDto.fechaInicio !== undefined
        ? updateDto.fechaInicio
        : (tarea.fechaInicio instanceof Date ? tarea.fechaInicio.toISOString().split('T')[0] : tarea.fechaInicio);
      const fechaFin = updateDto.fechaFin !== undefined
        ? updateDto.fechaFin
        : (tarea.fechaFin instanceof Date ? tarea.fechaFin.toISOString().split('T')[0] : tarea.fechaFin);
      await this.validarFechasContraHistoria(tarea.historiaUsuarioId, fechaInicio, fechaFin);
    }

    // Clonar valores anteriores para comparacion
    const valoresAnteriores = {
      nombre: tarea.nombre,
      descripcion: tarea.descripcion,
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      horasEstimadas: tarea.horasEstimadas,
      horasReales: tarea.horasReales,
      asignadoA: tarea.asignadoA,
    };

    // Extraer asignadosIds para manejar por separado
    const { asignadosIds, ...restUpdateDto } = updateDto;

    // Si hay asignadosIds, actualizar el asignadoA principal con el primero
    if (asignadosIds && asignadosIds.length > 0) {
      restUpdateDto.asignadoA = asignadosIds[0];
    }

    Object.assign(tarea, restUpdateDto, { updatedBy: userId });

    // Si se actualizó asignadoA, limpiar la relación 'asignado' para evitar conflicto con TypeORM
    // TypeORM usa la relación ManyToOne al guardar, lo que puede sobreescribir el valor del campo
    if (updateDto.asignadoA !== undefined) {
      tarea.asignado = null as any;
    }

    const tareaActualizada = await this.tareaRepository.save(tarea);

    // Actualizar asignados en tabla tarea_asignados si se proporcionó asignadosIds
    if (asignadosIds && asignadosIds.length > 0) {
      // Eliminar asignaciones anteriores
      await this.tareaAsignadoRepository.delete({ tareaId: id });

      // Crear nuevas asignaciones
      const asignaciones = asignadosIds.map(usuarioId =>
        this.tareaAsignadoRepository.create({
          tareaId: id,
          usuarioId,
          rol: 'IMPLEMENTADOR',
          asignadoPor: userId,
        })
      );
      await this.tareaAsignadoRepository.save(asignaciones);

      // Notificar a los nuevos asignados
      for (const usuarioId of asignadosIds) {
        if (usuarioId !== userId && usuarioId !== valoresAnteriores.asignadoA) {
          await this.notificacionService.notificar(
            TipoNotificacion.TAREAS,
            usuarioId,
            {
              titulo: `Tarea asignada: ${tarea.codigo}`,
              descripcion: `Se te ha asignado la tarea "${tarea.nombre}"`,
              entidadTipo: 'Tarea',
              entidadId: tarea.id,
              urlAccion: `/poi/tareas/${tarea.id}`,
            },
          );
        }
      }
    }

    // Registrar cambios en historial (con nombres de usuario para asignadoA)
    if (userId) {
      // Resolver nombres de usuario para asignadoA si hay cambios
      let valoresAnterioresHistorial = { ...valoresAnteriores };
      let valoresNuevosHistorial = { ...updateDto };

      if (updateDto.asignadoA !== undefined || valoresAnteriores.asignadoA !== undefined) {
        // Obtener nombre del asignado anterior
        if (valoresAnteriores.asignadoA) {
          const usuarioAnterior = await this.usuarioRepository.findOne({
            where: { id: valoresAnteriores.asignadoA },
            select: ['id', 'nombre', 'apellido'],
          });
          if (usuarioAnterior) {
            valoresAnterioresHistorial = {
              ...valoresAnterioresHistorial,
              asignadoA: `${usuarioAnterior.nombre} ${usuarioAnterior.apellido}`.trim() as any,
            };
          }
        }

        // Obtener nombre del asignado nuevo
        if (updateDto.asignadoA) {
          const usuarioNuevo = await this.usuarioRepository.findOne({
            where: { id: updateDto.asignadoA },
            select: ['id', 'nombre', 'apellido'],
          });
          if (usuarioNuevo) {
            valoresNuevosHistorial = {
              ...valoresNuevosHistorial,
              asignadoA: `${usuarioNuevo.nombre} ${usuarioNuevo.apellido}`.trim() as any,
            };
          }
        } else if (updateDto.asignadoA === null) {
          valoresNuevosHistorial = {
            ...valoresNuevosHistorial,
            asignadoA: 'Sin asignar' as any,
          };
        }
      }

      await this.historialCambioService.registrarCambiosMultiples(
        HistorialEntidadTipo.TAREA,
        id,
        valoresAnterioresHistorial,
        valoresNuevosHistorial,
        userId,
      );
    }

    // Notificar si se cambia el asignado
    if (updateDto.asignadoA && updateDto.asignadoA !== valoresAnteriores.asignadoA && updateDto.asignadoA !== userId) {
      await this.notificacionService.notificar(
        TipoNotificacion.TAREAS,
        updateDto.asignadoA,
        {
          titulo: `Tarea asignada: ${tarea.codigo}`,
          descripcion: `Se te ha asignado la tarea "${tarea.nombre}"`,
          entidadTipo: 'Tarea',
          entidadId: tarea.id,
          urlAccion: `/poi/tareas/${tarea.id}`,
        },
      );
    }

    return tareaActualizada;
  }

  async cambiarEstado(
    id: number,
    cambiarEstadoDto: CambiarEstadoTareaDto,
    userId?: number,
  ): Promise<Tarea> {
    const tarea = await this.findOne(id);
    const estadoAnterior = tarea.estado;

    // If finalizing, require evidencias for SCRUM tasks (using evidencias_tarea table)
    if (
      cambiarEstadoDto.estado === TareaEstado.FINALIZADO &&
      tarea.tipo === TareaTipo.SCRUM
    ) {
      const evidencias = await this.obtenerEvidencias(id);
      if (evidencias.length === 0) {
        throw new BadRequestException(
          'Se requiere al menos una evidencia para finalizar una tarea SCRUM',
        );
      }
    }

    // Validar WIP limit antes de mover (solo para tareas KANBAN)
    if (tarea.tipo === TareaTipo.KANBAN && estadoAnterior !== cambiarEstadoDto.estado) {
      await this.validateWipLimit(tarea.actividadId, cambiarEstadoDto.estado, id);
    }

    // Validar subtareas pendientes al finalizar tarea KANBAN
    if (
      cambiarEstadoDto.estado === TareaEstado.FINALIZADO &&
      tarea.tipo === TareaTipo.KANBAN
    ) {
      await this.validateSubtareasPendientes(id);
    }

    tarea.estado = cambiarEstadoDto.estado;
    tarea.updatedBy = userId;

    if (cambiarEstadoDto.horasReales !== undefined) {
      tarea.horasReales = cambiarEstadoDto.horasReales;
    }

    // evidenciaUrl eliminado - usar tabla evidencias_tarea en su lugar

    const tareaActualizada = await this.tareaRepository.save(tarea);

    // Registrar cambio de estado en historial
    if (userId && estadoAnterior !== cambiarEstadoDto.estado) {
      await this.historialCambioService.registrarCambioEstado(
        HistorialEntidadTipo.TAREA,
        id,
        estadoAnterior,
        cambiarEstadoDto.estado,
        userId,
      );
    }

    // Notificar al asignado cuando la tarea cambia de estado
    if (estadoAnterior !== cambiarEstadoDto.estado && tarea.asignadoA && tarea.asignadoA !== userId) {
      const mensajeEstado = cambiarEstadoDto.estado === TareaEstado.FINALIZADO
        ? 'ha sido completada'
        : `ha sido movida a ${cambiarEstadoDto.estado}`;

      await this.notificacionService.notificar(
        TipoNotificacion.TAREAS,
        tarea.asignadoA,
        {
          titulo: `Tarea actualizada: ${tarea.codigo}`,
          descripcion: `La tarea "${tarea.nombre}" ${mensajeEstado}`,
          entidadTipo: 'Tarea',
          entidadId: tarea.id,
          urlAccion: `/poi/tareas/${tarea.id}`,
        },
      );
    }

    // Emitir evento WebSocket para actualizar tableros
    const proyectoId = tarea.historiaUsuario?.proyecto?.id || tarea.actividad?.id;
    if (proyectoId) {
      this.notificacionService.emitTaskUpdate(proyectoId, 'task_status_changed', {
        tareaId: tarea.id,
        codigo: tarea.codigo,
        estadoAnterior,
        estadoNuevo: cambiarEstadoDto.estado,
      });
    }

    // Actualizar estado de la HU automáticamente (solo para tareas SCRUM)
    if (tarea.tipo === TareaTipo.SCRUM && tarea.historiaUsuarioId) {
      await this.actualizarEstadoHUSegunTareas(tarea.historiaUsuarioId, userId);
    }

    return tareaActualizada;
  }

  async validar(id: number, validarDto: ValidarTareaDto, userId: number): Promise<Tarea> {
    const tarea = await this.findOne(id);

    if (tarea.estado !== TareaEstado.FINALIZADO) {
      throw new BadRequestException('Solo se pueden validar tareas finalizadas');
    }

    const validadaAnterior = tarea.validada;

    tarea.validada = validarDto.validada;
    tarea.validadaPor = userId;
    tarea.fechaValidacion = new Date();
    tarea.updatedBy = userId;

    if (validarDto.observacion) {
      tarea.observaciones = validarDto.observacion;
    }

    const tareaValidada = await this.tareaRepository.save(tarea);

    // Registrar validacion en historial
    await this.historialCambioService.registrarCambio({
      entidadTipo: HistorialEntidadTipo.TAREA,
      entidadId: id,
      accion: HistorialAccion.VALIDACION,
      campoModificado: 'validada',
      valorAnterior: validadaAnterior,
      valorNuevo: validarDto.validada,
      usuarioId: userId,
    });

    return tareaValidada;
  }

  async mover(id: number, estado: TareaEstado, userId?: number): Promise<Tarea> {
    const tarea = await this.findOne(id);
    const estadoAnterior = tarea.estado;

    // Validar WIP limit antes de mover (solo para tareas KANBAN)
    if (tarea.tipo === TareaTipo.KANBAN && estadoAnterior !== estado) {
      await this.validateWipLimit(tarea.actividadId, estado, id);
    }

    // Validar subtareas pendientes al finalizar tarea KANBAN
    if (estado === TareaEstado.FINALIZADO && tarea.tipo === TareaTipo.KANBAN) {
      await this.validateSubtareasPendientes(id);
    }

    tarea.estado = estado;
    tarea.updatedBy = userId;

    return this.tareaRepository.save(tarea);
  }

  async remove(id: number, userId?: number, userRole?: string): Promise<Tarea> {
    const tarea = await this.findOne(id);

    // Verificar si la tarea está finalizada
    if (tarea.estado === TareaEstado.FINALIZADO) {
      throw new ForbiddenException('No se puede eliminar una tarea finalizada');
    }

    // IMPLEMENTADOR no puede eliminar tareas
    if (userRole === 'IMPLEMENTADOR') {
      throw new ForbiddenException('Los implementadores no pueden eliminar tareas');
    }

    tarea.activo = false;
    tarea.updatedBy = userId;

    const tareaEliminada = await this.tareaRepository.save(tarea);

    // Registrar eliminacion en historial
    if (userId) {
      await this.historialCambioService.registrarEliminacion(
        HistorialEntidadTipo.TAREA,
        id,
        userId,
      );
    }

    return tareaEliminada;
  }

  // ================================================================
  // Métodos de Evidencias
  // ================================================================

  async agregarEvidencia(
    tareaId: number,
    createDto: CreateEvidenciaTareaDto,
    userId: number,
  ): Promise<EvidenciaTarea> {
    // Verificar que la tarea existe
    const tarea = await this.findOne(tareaId);

    const evidencia = this.evidenciaRepository.create({
      ...createDto,
      tareaId,
      subidoPor: userId,
    });

    const evidenciaCreada = await this.evidenciaRepository.save(evidencia);

    // Registrar en historial
    await this.historialCambioService.registrarCambio({
      entidadTipo: HistorialEntidadTipo.TAREA,
      entidadId: tareaId,
      accion: HistorialAccion.ACTUALIZACION,
      usuarioId: userId,
      campoModificado: 'evidencia',
      valorNuevo: createDto.nombre,
    });

    // Cambiar estado de la tarea a "Finalizado" y actualizar fecha_completado
    if (tarea.estado !== TareaEstado.FINALIZADO) {
      const estadoAnterior = tarea.estado;

      await this.tareaRepository.update(tareaId, {
        estado: TareaEstado.FINALIZADO,
        fechaCompletado: new Date(),
        updatedBy: userId,
      });

      // Registrar cambio de estado
      await this.historialCambioService.registrarCambioEstado(
        HistorialEntidadTipo.TAREA,
        tareaId,
        estadoAnterior,
        TareaEstado.FINALIZADO,
        userId,
      );

      console.log(`[Tarea ${tarea.codigo}] Evidencia agregada → Estado cambiado a "Finalizado"`);
    } else {
      // Si ya está en Finalizado, solo actualizar la fecha
      await this.tareaRepository.update(tareaId, {
        fechaCompletado: new Date(),
        updatedBy: userId,
      });
    }

    // Actualizar estado de la HU automáticamente (solo para tareas SCRUM)
    // Se ejecuta siempre que se agrega evidencia para verificar si todas las tareas tienen evidencias
    if (tarea.tipo === TareaTipo.SCRUM && tarea.historiaUsuarioId) {
      await this.actualizarEstadoHUSegunTareas(tarea.historiaUsuarioId, userId);
    }

    return evidenciaCreada;
  }

  async obtenerEvidencias(tareaId: number): Promise<EvidenciaTarea[]> {
    // Verificar que la tarea existe
    await this.findOne(tareaId);

    return this.evidenciaRepository.find({
      where: { tareaId },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async eliminarEvidencia(
    tareaId: number,
    evidenciaId: number,
    userId: number,
  ): Promise<void> {
    // Verificar que la tarea existe
    const tarea = await this.findOne(tareaId);

    const evidencia = await this.evidenciaRepository.findOne({
      where: { id: evidenciaId, tareaId },
    });

    if (!evidencia) {
      throw new NotFoundException(`Evidencia con ID ${evidenciaId} no encontrada`);
    }

    await this.evidenciaRepository.remove(evidencia);

    // Registrar en historial
    await this.historialCambioService.registrarCambio({
      entidadTipo: HistorialEntidadTipo.TAREA,
      entidadId: tareaId,
      accion: HistorialAccion.ACTUALIZACION,
      usuarioId: userId,
      campoModificado: 'evidencia',
      valorAnterior: evidencia.nombre,
    });

    // Verificar si la tarea queda sin evidencias
    const evidenciasRestantes = await this.evidenciaRepository.count({
      where: { tareaId },
    });

    // Si no quedan evidencias y la tarea está en "Finalizado", cambiar a "En progreso"
    if (evidenciasRestantes === 0 && tarea.estado === TareaEstado.FINALIZADO) {
      const estadoAnterior = tarea.estado;

      await this.tareaRepository.update(tareaId, {
        estado: TareaEstado.EN_PROGRESO,
        fechaCompletado: null as any, // Limpiar fecha de completado
        updatedBy: userId,
      });

      // Registrar cambio de estado
      await this.historialCambioService.registrarCambioEstado(
        HistorialEntidadTipo.TAREA,
        tareaId,
        estadoAnterior,
        TareaEstado.EN_PROGRESO,
        userId,
      );

      console.log(`[Tarea ${tarea.codigo}] Última evidencia eliminada → Estado cambiado a "En progreso"`);

      // Si la HU estaba en "En revisión", también debe volver a "En progreso"
      if (tarea.tipo === TareaTipo.SCRUM && tarea.historiaUsuarioId) {
        const hu = await this.historiaUsuarioRepository.findOne({
          where: { id: tarea.historiaUsuarioId, activo: true },
        });

        if (hu && hu.estado === HuEstado.EN_REVISION) {
          const huEstadoAnterior = hu.estado;

          await this.historiaUsuarioRepository.update(tarea.historiaUsuarioId, {
            estado: HuEstado.EN_PROGRESO,
            documentoEvidenciasUrl: null, // Invalidar el PDF anterior
            updatedBy: userId,
          });

          // Registrar cambio de estado de la HU
          await this.historialCambioService.registrarCambioEstado(
            HistorialEntidadTipo.HISTORIA_USUARIO,
            tarea.historiaUsuarioId,
            huEstadoAnterior,
            HuEstado.EN_PROGRESO,
            userId,
          );

          console.log(`[HU-${hu.codigo}] Evidencia de tarea eliminada → Estado cambiado a "En progreso"`);
        }
      }
    }
  }

  // ================================================================
  // Métodos de validación Kanban
  // ================================================================

  /**
   * Valida que no se exceda el WIP limit de una columna antes de mover una tarea
   */
  private async validateWipLimit(
    actividadId: number,
    nuevoEstado: TareaEstado,
    tareaId: number,
  ): Promise<void> {
    const wipLimit = this.getWipLimit(nuevoEstado);

    if (wipLimit === null) {
      return; // Sin límite para esta columna
    }

    // Contar tareas activas en el estado destino (excluyendo la tarea que se mueve)
    const tareasEnColumna = await this.tareaRepository.count({
      where: {
        actividadId,
        estado: nuevoEstado,
        activo: true,
        id: Not(tareaId),
      },
    });

    if (tareasEnColumna >= wipLimit) {
      throw new ConflictException(
        `Límite WIP alcanzado en columna "${nuevoEstado}". Máximo ${wipLimit} tareas permitidas.`,
      );
    }
  }

  /**
   * Obtiene el WIP limit para un estado específico
   */
  private getWipLimit(estado: TareaEstado): number | null {
    return DEFAULT_WIP_LIMITS[estado] ?? null;
  }

  /**
   * Cuenta las tareas en un estado específico para una actividad
   */
  async countByEstado(actividadId: number, estado: TareaEstado): Promise<number> {
    return this.tareaRepository.count({
      where: {
        actividadId,
        estado,
        activo: true,
      },
    });
  }

  /**
   * Valida que todas las subtareas de una tarea KANBAN estén finalizadas
   * antes de permitir finalizar la tarea padre
   */
  private async validateSubtareasPendientes(tareaId: number): Promise<void> {
    const pendientes = await this.subtareaRepository.count({
      where: {
        tareaId,
        estado: Not(TareaEstado.FINALIZADO),
        activo: true,
      },
    });

    if (pendientes > 0) {
      throw new BadRequestException(
        `No se puede finalizar la tarea. Hay ${pendientes} subtarea(s) pendiente(s) de completar.`,
      );
    }
  }

  /**
   * Obtiene información de WIP limits para un tablero
   */
  async getWipLimitsInfo(actividadId: number): Promise<{
    estado: TareaEstado;
    limite: number | null;
    actual: number;
  }[]> {
    const estados = Object.values(TareaEstado);
    const result: { estado: TareaEstado; limite: number | null; actual: number }[] = [];

    for (const estado of estados) {
      const actual = await this.countByEstado(actividadId, estado);
      result.push({
        estado,
        limite: this.getWipLimit(estado),
        actual,
      });
    }

    return result;
  }

  /**
   * Valida que las fechas de la tarea estén dentro del rango de fechas de la HU
   */
  private async validarFechasContraHistoria(
    historiaUsuarioId: number,
    fechaInicio: string | null | undefined,
    fechaFin: string | null | undefined,
  ): Promise<void> {
    if (!fechaInicio && !fechaFin) return;

    const historia = await this.historiaUsuarioRepository.findOne({
      where: { id: historiaUsuarioId },
      select: ['id', 'codigo', 'fechaInicio', 'fechaFin'],
    });

    if (!historia) {
      throw new NotFoundException(`Historia de usuario con ID ${historiaUsuarioId} no encontrada`);
    }

    // Si la HU no tiene fechas definidas, no validar
    if (!historia.fechaInicio && !historia.fechaFin) return;

    const huInicio = historia.fechaInicio ? new Date(historia.fechaInicio) : null;
    const huFin = historia.fechaFin ? new Date(historia.fechaFin) : null;

    if (fechaInicio) {
      const tareaInicio = new Date(fechaInicio);
      if (huInicio && tareaInicio < huInicio) {
        throw new BadRequestException(
          `La fecha de inicio de la tarea (${fechaInicio}) no puede ser anterior a la fecha de inicio de la HU ${historia.codigo} (${historia.fechaInicio})`,
        );
      }
      if (huFin && tareaInicio > huFin) {
        throw new BadRequestException(
          `La fecha de inicio de la tarea (${fechaInicio}) no puede ser posterior a la fecha fin de la HU ${historia.codigo} (${historia.fechaFin})`,
        );
      }
    }

    if (fechaFin) {
      const tareaFin = new Date(fechaFin);
      if (huInicio && tareaFin < huInicio) {
        throw new BadRequestException(
          `La fecha fin de la tarea (${fechaFin}) no puede ser anterior a la fecha de inicio de la HU ${historia.codigo} (${historia.fechaInicio})`,
        );
      }
      if (huFin && tareaFin > huFin) {
        throw new BadRequestException(
          `La fecha fin de la tarea (${fechaFin}) no puede ser posterior a la fecha fin de la HU ${historia.codigo} (${historia.fechaFin})`,
        );
      }
    }

    // Validar que fecha inicio no sea mayor que fecha fin
    if (fechaInicio && fechaFin) {
      const tareaInicio = new Date(fechaInicio);
      const tareaFin = new Date(fechaFin);
      if (tareaInicio > tareaFin) {
        throw new BadRequestException(
          'La fecha de inicio de la tarea no puede ser posterior a la fecha fin',
        );
      }
    }
  }

  /**
   * Actualiza el estado de la Historia de Usuario según el estado de sus tareas
   * Lógica:
   * - Si alguna tarea pasa a "Finalizado" → HU pasa a "En progreso" (si tiene más de 1 tarea)
   * - Si TODAS las tareas están "Finalizado" con evidencias → HU pasa a "En revisión" y se genera PDF
   * - Si solo tiene 1 tarea y está "Finalizado" con evidencia → HU pasa a "En revisión" y se genera PDF
   */
  async actualizarEstadoHUSegunTareas(historiaUsuarioId: number, userId?: number): Promise<void> {
    // Obtener la HU
    const hu = await this.historiaUsuarioRepository.findOne({
      where: { id: historiaUsuarioId, activo: true },
    });

    if (!hu) return;

    // No actualizar si la HU ya está en "Finalizado"
    if (hu.estado === HuEstado.FINALIZADO) return;

    // Obtener todas las tareas activas de la HU
    const tareas = await this.tareaRepository.find({
      where: {
        historiaUsuarioId,
        activo: true,
        tipo: TareaTipo.SCRUM,
      },
    });

    // Si no hay tareas, no hacer nada
    if (tareas.length === 0) return;

    // Contar tareas finalizadas
    const tareasFinalizadas = tareas.filter(t => t.estado === TareaEstado.FINALIZADO);
    const todasFinalizadas = tareasFinalizadas.length === tareas.length;

    // Si todas las tareas están finalizadas, verificar si todas tienen evidencias
    if (todasFinalizadas) {
      let todasConEvidencia = true;

      for (const tarea of tareas) {
        const evidencias = await this.evidenciaRepository.count({
          where: { tareaId: tarea.id },
        });
        if (evidencias === 0) {
          todasConEvidencia = false;
          break;
        }
      }

      if (todasConEvidencia) {
        // Todas las tareas finalizadas con evidencias → HU pasa a "En revisión"
        const estadoAnterior = hu.estado;

        // Obtener proyecto para el PDF y notificación
        const proyecto = await this.proyectoRepository.findOne({
          where: { id: hu.proyectoId },
        });

        // Obtener sprint (si existe) para el PDF
        let sprintNombre: string | null = null;
        if (hu.sprintId) {
          const huConSprint = await this.historiaUsuarioRepository.findOne({
            where: { id: historiaUsuarioId },
            relations: ['sprint'],
          });
          sprintNombre = huConSprint?.sprint?.nombre || null;
        }

        // Generar PDF consolidado de evidencias
        let pdfUrl = '';
        try {
          const pdfBuffer = await this.huEvidenciaPdfService.generateEvidenciasPdf(
            historiaUsuarioId,
            { codigo: proyecto?.codigo || '', nombre: proyecto?.nombre || '' },
            sprintNombre ? { nombre: sprintNombre } : null,
          );

          // Subir PDF a MinIO
          const bucketName = this.configService.get('minio.buckets.documentos', 'sigp-documentos');
          const objectKey = `evidencias/hu/${hu.codigo}_evidencias_${Date.now()}.pdf`;

          await this.minioService.putObject(
            bucketName,
            objectKey,
            pdfBuffer,
            pdfBuffer.length,
            { 'Content-Type': 'application/pdf' },
          );

          // Generar URL de descarga
          pdfUrl = await this.minioService.getPresignedGetUrl(bucketName, objectKey, 7 * 24 * 60 * 60); // 7 días

          console.log(`[HU-${hu.codigo}] PDF de evidencias generado: ${objectKey}`);
        } catch (error) {
          console.error(`[HU-${hu.codigo}] Error generando PDF de evidencias:`, error);
          // Continuar aunque falle la generación del PDF
        }

        // Actualizar HU con estado "En revisión" y URL del PDF
        await this.historiaUsuarioRepository.update(historiaUsuarioId, {
          estado: HuEstado.EN_REVISION,
          updatedBy: userId,
          documentoEvidenciasUrl: pdfUrl || null,
        });

        // Registrar cambio de estado en historial
        if (userId && estadoAnterior !== HuEstado.EN_REVISION) {
          await this.historialCambioService.registrarCambioEstado(
            HistorialEntidadTipo.HISTORIA_USUARIO,
            historiaUsuarioId,
            estadoAnterior,
            HuEstado.EN_REVISION,
            userId,
          );
        }

        // Enviar notificación al SCRUM_MASTER del proyecto
        if (proyecto?.scrumMasterId) {
          try {
            await this.notificacionService.notificar(
              TipoNotificacion.VALIDACIONES,
              proyecto.scrumMasterId,
              {
                titulo: `HU en Revisión: ${hu.codigo}`,
                descripcion: `La Historia de Usuario "${hu.titulo}" del proyecto "${proyecto.nombre}" tiene todas sus tareas finalizadas con evidencias y está pendiente de validación.`,
                entidadTipo: 'HistoriaUsuario',
                entidadId: hu.id,
                proyectoId: proyecto.id,
                urlAccion: `/poi/proyecto/detalles?tab=Backlog`,
              },
            );
            console.log(`[HU-${hu.codigo}] Notificación enviada a SCRUM_MASTER (ID: ${proyecto.scrumMasterId})`);
          } catch (error) {
            console.error(`[HU-${hu.codigo}] Error enviando notificación a SCRUM_MASTER:`, error);
          }
        }

        console.log(`[HU-${hu.codigo}] Todas las tareas finalizadas con evidencias. Estado cambiado a "En revisión".`);
        return;
      }
    }

    // Si hay alguna tarea finalizada pero no todas, y la HU está en "Por hacer"
    // → cambiar a "En progreso"
    if (tareasFinalizadas.length > 0 && hu.estado === HuEstado.POR_HACER) {
      const estadoAnterior = hu.estado;

      await this.historiaUsuarioRepository.update(historiaUsuarioId, {
        estado: HuEstado.EN_PROGRESO,
        updatedBy: userId,
      });

      // Registrar cambio de estado en historial
      if (userId) {
        await this.historialCambioService.registrarCambioEstado(
          HistorialEntidadTipo.HISTORIA_USUARIO,
          historiaUsuarioId,
          estadoAnterior,
          HuEstado.EN_PROGRESO,
          userId,
        );
      }

      console.log(`[HU-${hu.codigo}] Tarea finalizada. Estado cambiado a "En progreso".`);
    }
  }
}
