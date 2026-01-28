import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subtarea } from '../entities/subtarea.entity';
import { EvidenciaSubtarea } from '../entities/evidencia-subtarea.entity';
import { Tarea } from '../../tareas/entities/tarea.entity';
import { TareaAsignado } from '../../tareas/entities/tarea-asignado.entity';
import { CreateSubtareaDto } from '../dto/create-subtarea.dto';
import { UpdateSubtareaDto } from '../dto/update-subtarea.dto';
import { CreateEvidenciaSubtareaDto } from '../dto/create-evidencia-subtarea.dto';
import { TareaTipo, TareaEstado } from '../../tareas/enums/tarea.enum';

@Injectable()
export class SubtareaService {
  constructor(
    @InjectRepository(Subtarea)
    private readonly subtareaRepository: Repository<Subtarea>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(EvidenciaSubtarea)
    private readonly evidenciaSubtareaRepository: Repository<EvidenciaSubtarea>,
    @InjectRepository(TareaAsignado)
    private readonly tareaAsignadoRepository: Repository<TareaAsignado>,
  ) {}

  // ================================================================
  // Métodos de Verificación de Permisos
  // ================================================================

  /**
   * Verifica si un usuario está asignado como responsable en una tarea
   */
  async isUserAssignedToTask(tareaId: number, userId: number): Promise<boolean> {
    const asignacion = await this.tareaAsignadoRepository.findOne({
      where: { tareaId, usuarioId: userId, activo: true },
    });
    return !!asignacion;
  }

  /**
   * Verifica si un usuario es el responsable de una subtarea
   */
  async isUserResponsibleForSubtask(subtareaId: number, userId: number): Promise<boolean> {
    const subtarea = await this.subtareaRepository.findOne({
      where: { id: subtareaId },
    });
    return subtarea?.responsableId === userId;
  }

  // ================================================================
  // Métodos de Actualización de Estado de Tarea
  // ================================================================

  /**
   * Actualiza el estado de la tarea padre basándose en el estado de sus subtareas
   * - Si todas las subtareas están "Finalizado" → tarea = "Finalizado"
   * - Si al menos una subtarea tiene evidencia → tarea = "En progreso"
   * - Si no hay subtareas o ninguna tiene evidencia → tarea = "Por hacer"
   */
  async actualizarEstadoTareaPadre(tareaId: number, userId?: number): Promise<void> {
    const subtareas = await this.subtareaRepository.find({
      where: { tareaId, activo: true },
    });

    // Si no hay subtareas, estado = "Por hacer"
    if (subtareas.length === 0) {
      await this.tareaRepository.update(tareaId, {
        estado: TareaEstado.POR_HACER,
        updatedBy: userId,
      });
      return;
    }

    // Contar subtareas finalizadas y con evidencia
    const finalizadas = subtareas.filter((s) => s.estado === TareaEstado.FINALIZADO);

    // Si todas las subtareas están finalizadas → tarea = "Finalizado"
    if (finalizadas.length === subtareas.length) {
      await this.tareaRepository.update(tareaId, {
        estado: TareaEstado.FINALIZADO,
        updatedBy: userId,
      });
      return;
    }

    // Si al menos una subtarea está finalizada → tarea = "En progreso"
    if (finalizadas.length > 0) {
      await this.tareaRepository.update(tareaId, {
        estado: TareaEstado.EN_PROGRESO,
        updatedBy: userId,
      });
      return;
    }

    // Si ninguna está finalizada → tarea = "Por hacer"
    await this.tareaRepository.update(tareaId, {
      estado: TareaEstado.POR_HACER,
      updatedBy: userId,
    });
  }

  async create(createDto: CreateSubtareaDto, userId?: number, userRole?: string): Promise<Subtarea> {
    // Verify tarea exists and is KANBAN type
    const tarea = await this.tareaRepository.findOne({
      where: { id: createDto.tareaId },
    });

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${createDto.tareaId} no encontrada`);
    }

    if (tarea.tipo !== TareaTipo.KANBAN) {
      throw new BadRequestException('Solo se pueden crear subtareas para tareas de tipo KANBAN');
    }

    // Verificar permisos para IMPLEMENTADOR: debe estar asignado a la tarea
    if (userRole === 'IMPLEMENTADOR' && userId) {
      const isAssigned = await this.isUserAssignedToTask(createDto.tareaId, userId);
      if (!isAssigned) {
        throw new ForbiddenException('Solo puedes crear subtareas en tareas donde estés asignado como responsable');
      }
    }

    // Check for duplicate code within the same tarea
    const existing = await this.subtareaRepository.findOne({
      where: { tareaId: createDto.tareaId, codigo: createDto.codigo },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una subtarea con el código ${createDto.codigo} en esta tarea`);
    }

    const subtarea = this.subtareaRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.subtareaRepository.save(subtarea);
  }

  async findAll(tareaId?: number): Promise<Subtarea[]> {
    const queryBuilder = this.subtareaRepository
      .createQueryBuilder('subtarea')
      .leftJoinAndSelect('subtarea.responsable', 'responsable')
      .where('subtarea.activo = :activo', { activo: true })
      .orderBy('subtarea.prioridad', 'ASC')
      .addOrderBy('subtarea.createdAt', 'DESC');

    if (tareaId) {
      queryBuilder.andWhere('subtarea.tareaId = :tareaId', { tareaId });
    }

    return queryBuilder.getMany();
  }

  async findByTarea(tareaId: number): Promise<Subtarea[]> {
    // Verify tarea exists and is KANBAN type
    const tarea = await this.tareaRepository.findOne({
      where: { id: tareaId },
    });

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    if (tarea.tipo !== TareaTipo.KANBAN) {
      throw new BadRequestException('Solo las tareas KANBAN pueden tener subtareas');
    }

    return this.subtareaRepository.find({
      where: { tareaId, activo: true },
      relations: ['responsable', 'creator'],
      order: { orden: 'ASC', prioridad: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Subtarea> {
    const subtarea = await this.subtareaRepository.findOne({
      where: { id },
      relations: ['tarea', 'responsable', 'creator'],
    });

    if (!subtarea) {
      throw new NotFoundException(`Subtarea con ID ${id} no encontrada`);
    }

    return subtarea;
  }

  async update(id: number, updateDto: UpdateSubtareaDto, userId?: number, userRole?: string): Promise<Subtarea> {
    const subtarea = await this.findOne(id);

    // Verificar si la subtarea está finalizada
    if (subtarea.estado === TareaEstado.FINALIZADO) {
      throw new ForbiddenException('No se puede editar una subtarea finalizada');
    }

    // Verificar si la tarea padre está finalizada
    const tareaPadre = await this.tareaRepository.findOne({
      where: { id: subtarea.tareaId },
    });
    if (tareaPadre?.estado === TareaEstado.FINALIZADO) {
      throw new ForbiddenException('No se puede editar subtareas de una tarea finalizada');
    }

    // Verificar permisos para IMPLEMENTADOR: debe ser el responsable de la subtarea
    if (userRole === 'IMPLEMENTADOR' && userId) {
      const isResponsible = await this.isUserResponsibleForSubtask(id, userId);
      if (!isResponsible) {
        throw new ForbiddenException('Solo puedes editar subtareas donde estés asignado como responsable');
      }
    }

    // Check for duplicate code if updating
    if (updateDto.codigo && updateDto.codigo !== subtarea.codigo) {
      const existing = await this.subtareaRepository.findOne({
        where: { tareaId: subtarea.tareaId, codigo: updateDto.codigo },
      });

      if (existing) {
        throw new ConflictException(`Ya existe una subtarea con el código ${updateDto.codigo} en esta tarea`);
      }
    }

    Object.assign(subtarea, updateDto, { updatedBy: userId });

    return this.subtareaRepository.save(subtarea);
  }

  async remove(id: number, userId?: number, userRole?: string): Promise<void> {
    const subtarea = await this.findOne(id);
    const tareaId = subtarea.tareaId;

    // Verificar si la subtarea está finalizada
    if (subtarea.estado === TareaEstado.FINALIZADO) {
      throw new ForbiddenException('No se puede eliminar una subtarea finalizada');
    }

    // Verificar si la tarea padre está finalizada
    const tareaPadre = await this.tareaRepository.findOne({
      where: { id: tareaId },
    });
    if (tareaPadre?.estado === TareaEstado.FINALIZADO) {
      throw new ForbiddenException('No se puede eliminar subtareas de una tarea finalizada');
    }

    // Verificar permisos para IMPLEMENTADOR: debe ser el responsable de la subtarea
    if (userRole === 'IMPLEMENTADOR' && userId) {
      const isResponsible = await this.isUserResponsibleForSubtask(id, userId);
      if (!isResponsible) {
        throw new ForbiddenException('Solo puedes eliminar subtareas donde estés asignado como responsable');
      }
    }

    // Eliminar evidencias asociadas primero
    await this.evidenciaSubtareaRepository.delete({ subtareaId: id });

    // Eliminar la subtarea permanentemente de la base de datos
    await this.subtareaRepository.remove(subtarea);

    // Actualizar el estado de la tarea padre
    await this.actualizarEstadoTareaPadre(tareaId, userId);
  }

  async getEstadisticasByTarea(tareaId: number): Promise<{
    total: number;
    porEstado: Record<string, number>;
    horasEstimadas: number;
    horasReales: number;
    progreso: number;
  }> {
    const subtareas = await this.subtareaRepository.find({
      where: { tareaId, activo: true },
    });

    const porEstado: Record<string, number> = {};
    let horasEstimadas = 0;
    let horasReales = 0;
    let completadas = 0;

    subtareas.forEach((st) => {
      porEstado[st.estado] = (porEstado[st.estado] || 0) + 1;
      horasEstimadas += Number(st.horasEstimadas) || 0;
      horasReales += Number(st.horasReales) || 0;
      if (st.estado === 'Finalizado') {
        completadas++;
      }
    });

    return {
      total: subtareas.length,
      porEstado,
      horasEstimadas,
      horasReales,
      progreso: subtareas.length > 0 ? Math.round((completadas / subtareas.length) * 100) : 0,
    };
  }

  /**
   * Reordena las subtareas de una tarea KANBAN
   * @param tareaId ID de la tarea padre
   * @param orden Array de IDs de subtareas en el nuevo orden
   * @returns Lista de subtareas reordenadas
   */
  async reordenar(tareaId: number, orden: number[]): Promise<Subtarea[]> {
    // Verify tarea exists and is KANBAN type
    const tarea = await this.tareaRepository.findOne({
      where: { id: tareaId },
    });

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    if (tarea.tipo !== TareaTipo.KANBAN) {
      throw new BadRequestException('Solo las tareas KANBAN pueden reordenar subtareas');
    }

    // Verify all IDs belong to this tarea
    const subtareas = await this.subtareaRepository.find({
      where: { tareaId, activo: true },
    });

    const subtareaIds = new Set(subtareas.map((s) => s.id));

    for (const id of orden) {
      if (!subtareaIds.has(id)) {
        throw new BadRequestException(
          `La subtarea con ID ${id} no pertenece a la tarea ${tareaId} o no está activa`,
        );
      }
    }

    // Update orden field for each subtarea
    const updatePromises = orden.map((subtareaId, index) =>
      this.subtareaRepository.update(subtareaId, { orden: index }),
    );

    await Promise.all(updatePromises);

    // Return updated subtareas ordered by new orden
    return this.subtareaRepository.find({
      where: { tareaId, activo: true },
      relations: ['responsable'],
      order: { orden: 'ASC' },
    });
  }

  // ================================================================
  // Métodos de Evidencias
  // ================================================================

  /**
   * Agregar evidencia a una subtarea
   * Las evidencias son archivos adjuntos (imágenes, documentos)
   * Al agregar evidencia, la subtarea se marca como "Finalizado" y se actualiza el estado de la tarea padre
   */
  async agregarEvidencia(
    subtareaId: number,
    createDto: CreateEvidenciaSubtareaDto,
    userId: number,
  ): Promise<EvidenciaSubtarea> {
    // Verificar que la subtarea existe
    const subtarea = await this.findOne(subtareaId);

    const evidencia = this.evidenciaSubtareaRepository.create({
      subtareaId: subtarea.id,
      nombre: createDto.nombre,
      descripcion: createDto.descripcion,
      url: createDto.url,
      tipo: createDto.tipo,
      tamanoBytes: createDto.tamanoBytes,
      subidoPor: userId,
    });

    const savedEvidencia = await this.evidenciaSubtareaRepository.save(evidencia);

    // Marcar la subtarea como "Finalizado" al adjuntar evidencia
    await this.subtareaRepository.update(subtareaId, {
      estado: TareaEstado.FINALIZADO,
      updatedBy: userId,
    });

    // Actualizar el estado de la tarea padre
    await this.actualizarEstadoTareaPadre(subtarea.tareaId, userId);

    return savedEvidencia;
  }

  /**
   * Obtener todas las evidencias de una subtarea
   */
  async obtenerEvidencias(subtareaId: number): Promise<EvidenciaSubtarea[]> {
    // Verificar que la subtarea existe
    await this.findOne(subtareaId);

    return this.evidenciaSubtareaRepository.find({
      where: { subtareaId },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Eliminar una evidencia de una subtarea
   */
  async eliminarEvidencia(
    subtareaId: number,
    evidenciaId: number,
    userId: number,
  ): Promise<void> {
    // Verificar que la subtarea existe
    await this.findOne(subtareaId);

    const evidencia = await this.evidenciaSubtareaRepository.findOne({
      where: { id: evidenciaId, subtareaId },
    });

    if (!evidencia) {
      throw new NotFoundException(
        `Evidencia con ID ${evidenciaId} no encontrada en la subtarea ${subtareaId}`,
      );
    }

    await this.evidenciaSubtareaRepository.remove(evidencia);
  }

  /**
   * Verificar si una subtarea tiene evidencias
   */
  async tieneEvidencias(subtareaId: number): Promise<boolean> {
    const count = await this.evidenciaSubtareaRepository.count({
      where: { subtareaId },
    });
    return count > 0;
  }
}
