import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TareaCronograma } from '../entities/tarea-cronograma.entity';
import { Cronograma } from '../entities/cronograma.entity';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { CreateTareaCronogramaDto } from '../dto/create-tarea-cronograma.dto';
import { UpdateTareaCronogramaDto } from '../dto/update-tarea-cronograma.dto';
import { TareaEstado, CronogramaEstado } from '../enums/cronograma.enum';

// Estados en los que se permite editar el cronograma
const ESTADOS_EDITABLES = [CronogramaEstado.BORRADOR, CronogramaEstado.RECHAZADO];

@Injectable()
export class TareaCronogramaService {
  constructor(
    @InjectRepository(TareaCronograma)
    private readonly tareaCronogramaRepository: Repository<TareaCronograma>,
    @InjectRepository(Cronograma)
    private readonly cronogramaRepository: Repository<Cronograma>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
  ) {}

  /**
   * Valida que el cronograma esté en un estado que permita ediciones
   */
  private async validarCronogramaEditable(cronogramaId: number): Promise<void> {
    const cronograma = await this.cronogramaRepository.findOne({
      where: { id: cronogramaId },
      select: ['id', 'estado'],
    });

    if (!cronograma) {
      throw new NotFoundException(`Cronograma con ID ${cronogramaId} no encontrado`);
    }

    if (!ESTADOS_EDITABLES.includes(cronograma.estado)) {
      throw new BadRequestException(
        `No se puede modificar el cronograma en estado "${cronograma.estado}". ` +
        `Solo se permite editar en estados: ${ESTADOS_EDITABLES.join(', ')}.`
      );
    }
  }

  /**
   * Valida que las fechas de la tarea estén dentro del rango del proyecto
   * @param cronogramaId - ID del cronograma
   * @param fechaInicio - Fecha de inicio de la tarea
   * @param fechaFin - Fecha de fin de la tarea
   */
  private async validarFechasDentroDelProyecto(
    cronogramaId: number,
    fechaInicio: Date | string,
    fechaFin: Date | string,
  ): Promise<void> {
    // Obtener el cronograma con su proyecto
    const cronograma = await this.cronogramaRepository.findOne({
      where: { id: cronogramaId },
      select: ['id', 'proyectoId'],
    });

    if (!cronograma) {
      throw new NotFoundException(`Cronograma con ID ${cronogramaId} no encontrado`);
    }

    // Obtener el proyecto
    const proyecto = await this.proyectoRepository.findOne({
      where: { id: cronograma.proyectoId },
      select: ['id', 'fechaInicio', 'fechaFin', 'nombre'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto no encontrado`);
    }

    // Si el proyecto no tiene fechas definidas, no validar
    if (!proyecto.fechaInicio || !proyecto.fechaFin) {
      return;
    }

    // Normalizar fechas para comparación (solo fecha, sin hora)
    const normalizeDate = (date: Date | string): Date => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const tareaInicio = normalizeDate(fechaInicio);
    const tareaFin = normalizeDate(fechaFin);
    const proyectoInicio = normalizeDate(proyecto.fechaInicio);
    const proyectoFin = normalizeDate(proyecto.fechaFin);

    // Formatear fechas para mensajes de error
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Validar fecha de inicio
    if (tareaInicio < proyectoInicio) {
      throw new BadRequestException(
        `La fecha de inicio de la tarea (${formatDate(tareaInicio)}) no puede ser anterior ` +
        `a la fecha de inicio del proyecto (${formatDate(proyectoInicio)}).`
      );
    }

    // Validar fecha de fin
    if (tareaFin > proyectoFin) {
      throw new BadRequestException(
        `La fecha de fin de la tarea (${formatDate(tareaFin)}) no puede ser posterior ` +
        `a la fecha de fin del proyecto (${formatDate(proyectoFin)}).`
      );
    }
  }

  /**
   * Genera el siguiente código de tarea en formato T-XXX
   */
  private async generateNextCodigo(cronogramaId: number): Promise<string> {
    // Buscar el código más alto existente con formato T-XXX
    const tareas = await this.tareaCronogramaRepository.find({
      where: { cronogramaId },
      select: ['codigo'],
    });

    let maxNumber = 0;
    for (const tarea of tareas) {
      const match = tarea.codigo?.match(/^T-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    return `T-${String(nextNumber).padStart(3, '0')}`;
  }

  async create(createDto: CreateTareaCronogramaDto, userId?: number): Promise<TareaCronograma> {
    // Validar que el cronograma permita ediciones
    await this.validarCronogramaEditable(createDto.cronogramaId);

    // Validar que las fechas estén dentro del rango del proyecto
    await this.validarFechasDentroDelProyecto(
      createDto.cronogramaId,
      createDto.fechaInicio,
      createDto.fechaFin,
    );

    // Generar código si no se proporciona o no tiene el formato correcto
    let codigo = createDto.codigo;
    if (!codigo || !codigo.match(/^T-\d{3}$/)) {
      codigo = await this.generateNextCodigo(createDto.cronogramaId);
    }

    const existing = await this.tareaCronogramaRepository.findOne({
      where: { cronogramaId: createDto.cronogramaId, codigo },
    });

    if (existing) {
      // Si ya existe, generar un nuevo código
      codigo = await this.generateNextCodigo(createDto.cronogramaId);
    }

    const tarea = this.tareaCronogramaRepository.create({
      ...createDto,
      codigo,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.tareaCronogramaRepository.save(tarea);
  }

  async findByCronograma(cronogramaId: number): Promise<TareaCronograma[]> {
    return this.tareaCronogramaRepository.find({
      where: { cronogramaId, activo: true },
      order: { orden: 'ASC', fechaInicio: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TareaCronograma> {
    const tarea = await this.tareaCronogramaRepository.findOne({
      where: { id },
      relations: ['cronograma', 'tareaPadre'],
    });

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return tarea;
  }

  async update(
    id: number,
    updateDto: UpdateTareaCronogramaDto,
    userId?: number,
  ): Promise<TareaCronograma> {
    // Verificar que la tarea existe
    const tareaExistente = await this.findOne(id);

    // Validar que el cronograma permita ediciones
    await this.validarCronogramaEditable(tareaExistente.cronogramaId);

    // Validar que las fechas estén dentro del rango del proyecto (si se actualizan fechas)
    if (updateDto.fechaInicio !== undefined || updateDto.fechaFin !== undefined) {
      const fechaInicio = updateDto.fechaInicio ?? tareaExistente.fechaInicio;
      const fechaFin = updateDto.fechaFin ?? tareaExistente.fechaFin;
      await this.validarFechasDentroDelProyecto(
        tareaExistente.cronogramaId,
        fechaInicio,
        fechaFin,
      );
    }

    // Construir el QueryBuilder para UPDATE
    const qb = this.tareaCronogramaRepository
      .createQueryBuilder()
      .update(TareaCronograma)
      .where('id = :id', { id });

    // Preparar los campos a actualizar
    const setFields: Record<string, any> = {};

    // Mapear campos del DTO a columnas de la BD
    if (updateDto.nombre !== undefined) setFields.nombre = updateDto.nombre;
    if (updateDto.descripcion !== undefined) setFields.descripcion = updateDto.descripcion;
    if (updateDto.fechaInicio !== undefined) setFields.fechaInicio = updateDto.fechaInicio;
    if (updateDto.fechaFin !== undefined) setFields.fechaFin = updateDto.fechaFin;
    if (updateDto.prioridad !== undefined) setFields.prioridad = updateDto.prioridad;
    if (updateDto.asignadoA !== undefined) setFields.asignadoA = updateDto.asignadoA;
    if (updateDto.orden !== undefined) setFields.orden = updateDto.orden;
    if (updateDto.notas !== undefined) setFields.notas = updateDto.notas;
    if (updateDto.fase !== undefined) setFields.fase = updateDto.fase;
    if (updateDto.esHito !== undefined) setFields.esHito = updateDto.esHito;
    if (updateDto.color !== undefined) setFields.color = updateDto.color;
    if (updateDto.estado !== undefined) setFields.estado = updateDto.estado;
    if (updateDto.porcentajeAvance !== undefined) setFields.porcentajeAvance = updateDto.porcentajeAvance;
    if (updateDto.fechaInicioReal !== undefined) setFields.fechaInicioReal = updateDto.fechaInicioReal;
    if (updateDto.fechaFinReal !== undefined) setFields.fechaFinReal = updateDto.fechaFinReal;

    // IMPORTANTE: Manejar tareaPadreId explícitamente, incluyendo null
    if ('tareaPadreId' in updateDto) {
      setFields.tareaPadreId = updateDto.tareaPadreId;
    }

    // Siempre actualizar updatedBy
    if (userId !== undefined) setFields.updatedBy = userId;

    // Auto-update estado based on porcentajeAvance
    if (updateDto.porcentajeAvance !== undefined) {
      if (updateDto.porcentajeAvance >= 100) {
        setFields.estado = TareaEstado.COMPLETADO;
        if (!tareaExistente.fechaFinReal) {
          setFields.fechaFinReal = new Date();
        }
      } else if (updateDto.porcentajeAvance > 0 && tareaExistente.estado === TareaEstado.POR_HACER) {
        setFields.estado = TareaEstado.EN_PROGRESO;
        if (!tareaExistente.fechaInicioReal) {
          setFields.fechaInicioReal = new Date();
        }
      }
    }

    // Ejecutar el UPDATE
    await qb.set(setFields).execute();

    // Retornar la tarea actualizada
    return this.findOne(id);
  }

  async remove(id: number, userId?: number): Promise<TareaCronograma> {
    const tarea = await this.findOne(id);

    // Validar que el cronograma permita ediciones
    await this.validarCronogramaEditable(tarea.cronogramaId);

    tarea.activo = false;
    tarea.updatedBy = userId;
    return this.tareaCronogramaRepository.save(tarea);
  }

  /**
   * Actualiza SOLO el estado de una tarea del cronograma.
   * Este método permite actualizar el estado incluso cuando el cronograma está aprobado.
   * Solo los roles ADMIN, SCRUM_MASTER y COORDINADOR pueden usar este método.
   */
  async updateEstadoOnly(
    id: number,
    estado: TareaEstado,
    userId?: number,
  ): Promise<TareaCronograma> {
    // Verificar que la tarea existe
    const tarea = await this.findOne(id);

    // Verificar que el cronograma existe y está aprobado
    const cronograma = await this.cronogramaRepository.findOne({
      where: { id: tarea.cronogramaId },
      select: ['id', 'estado'],
    });

    if (!cronograma) {
      throw new NotFoundException(`Cronograma con ID ${tarea.cronogramaId} no encontrado`);
    }

    // Solo permitir si el cronograma está Aprobado o en estados editables
    const estadosPermitidos = [CronogramaEstado.APROBADO, ...ESTADOS_EDITABLES];
    if (!estadosPermitidos.includes(cronograma.estado)) {
      throw new BadRequestException(
        `No se puede actualizar el estado de tareas cuando el cronograma está en estado "${cronograma.estado}".`
      );
    }

    // Preparar campos a actualizar
    const setFields: Record<string, any> = {
      estado,
      updatedBy: userId,
    };

    // Auto-actualizar fechas reales según el estado
    if (estado === TareaEstado.EN_PROGRESO && !tarea.fechaInicioReal) {
      setFields.fechaInicioReal = new Date();
    }
    if (estado === TareaEstado.COMPLETADO) {
      setFields.porcentajeAvance = 100;
      if (!tarea.fechaFinReal) {
        setFields.fechaFinReal = new Date();
      }
    }

    // Ejecutar UPDATE
    await this.tareaCronogramaRepository
      .createQueryBuilder()
      .update(TareaCronograma)
      .set(setFields)
      .where('id = :id', { id })
      .execute();

    return this.findOne(id);
  }
}
