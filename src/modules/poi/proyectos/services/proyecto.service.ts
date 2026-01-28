import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../entities/proyecto.entity';
import { CreateProyectoDto } from '../dto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';
import { CambiarEstadoProyectoDto } from '../dto/cambiar-estado.dto';
import { ProyectoEstado } from '../enums/proyecto-estado.enum';
import { NotificacionService } from '../../../notificaciones/services/notificacion.service';
import { TipoNotificacion } from '../../../notificaciones/enums/tipo-notificacion.enum';
import { AccionEstrategica } from '../../../planning/acciones-estrategicas/entities/accion-estrategica.entity';
import { CronogramaService } from '../../cronogramas/services/cronograma.service';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(AccionEstrategica)
    private readonly accionEstrategicaRepository: Repository<AccionEstrategica>,
    @Inject(forwardRef(() => NotificacionService))
    private readonly notificacionService: NotificacionService,
    @Inject(forwardRef(() => CronogramaService))
    private readonly cronogramaService: CronogramaService,
  ) {}

  /**
   * Convierte una fecha string (YYYY-MM-DD) a Date evitando problemas de timezone.
   * Crea la fecha a las 12:00:00 hora local para evitar que la conversión UTC
   * desplace la fecha al día anterior.
   */
  private parseDateString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  /**
   * Genera el código del proyecto en formato PROY N°X
   * La secuencia es GLOBAL porque el constraint UNIQUE en la BD es global
   */
  private async generateCodigo(): Promise<string> {
    const proyectos = await this.proyectoRepository.find({
      select: ['codigo'],
    });

    let maxNum = 0;
    for (const proyecto of proyectos) {
      const match = proyecto.codigo.match(/PROY\s*N°(\d+)/i) || proyecto.codigo.match(/PROY-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `PROY N°${maxNum + 1}`;
  }

  /**
   * Obtener el siguiente código disponible para proyectos
   * Nota: El parámetro accionEstrategicaId se mantiene por compatibilidad pero no afecta la generación
   */
  async getNextCodigo(accionEstrategicaId?: number): Promise<string> {
    return this.generateCodigo();
  }

  /**
   * Valida que las fechas del proyecto estén dentro del rango del PGD asociado
   */
  private async validateFechasEnRangoPGD(
    accionEstrategicaId: number | undefined,
    fechaInicio: string | Date | undefined,
    fechaFin: string | Date | undefined,
  ): Promise<void> {
    if (!accionEstrategicaId || (!fechaInicio && !fechaFin)) return;

    // Obtener la AccionEstrategica con toda la cadena de relaciones hasta PGD
    const accion = await this.accionEstrategicaRepository.findOne({
      where: { id: accionEstrategicaId },
      relations: ['oegd', 'oegd.ogd', 'oegd.ogd.pgd'],
    });

    if (!accion || !accion.oegd?.ogd?.pgd) return;

    const pgd = accion.oegd.ogd.pgd;
    const pgdFechaInicio = new Date(`${pgd.anioInicio}-01-01`);
    const pgdFechaFin = new Date(`${pgd.anioFin}-12-31`);

    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio);
      if (fechaInicioDate < pgdFechaInicio || fechaInicioDate > pgdFechaFin) {
        throw new BadRequestException(
          `La fecha de inicio debe estar dentro del rango del PGD (${pgd.anioInicio}-01-01 a ${pgd.anioFin}-12-31)`
        );
      }
    }

    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin);
      if (fechaFinDate < pgdFechaInicio || fechaFinDate > pgdFechaFin) {
        throw new BadRequestException(
          `La fecha de fin debe estar dentro del rango del PGD (${pgd.anioInicio}-01-01 a ${pgd.anioFin}-12-31)`
        );
      }
    }
  }

  /**
   * Valida que los años seleccionados del proyecto estén dentro del rango del PGD
   */
  private async validateAniosEnRangoPGD(
    accionEstrategicaId: number | undefined,
    anios: number[] | undefined,
  ): Promise<void> {
    if (!accionEstrategicaId || !anios || anios.length === 0) return;

    // Obtener la AccionEstrategica con toda la cadena de relaciones hasta PGD
    const accion = await this.accionEstrategicaRepository.findOne({
      where: { id: accionEstrategicaId },
      relations: ['oegd', 'oegd.ogd', 'oegd.ogd.pgd'],
    });

    if (!accion || !accion.oegd?.ogd?.pgd) return;

    const pgd = accion.oegd.ogd.pgd;
    const pgdAnioInicio = pgd.anioInicio;
    const pgdAnioFin = pgd.anioFin;

    // Verificar que todos los años estén dentro del rango del PGD
    for (const anio of anios) {
      if (anio < pgdAnioInicio || anio > pgdAnioFin) {
        throw new BadRequestException(
          `El año ${anio} está fuera del rango del PGD (${pgdAnioInicio} - ${pgdAnioFin})`
        );
      }
    }
  }

  /**
   * Valida que las fechas del proyecto estén dentro del rango de años seleccionados
   */
  private validateFechasEnRangoAnios(
    anios: number[] | undefined,
    fechaInicio: string | Date | undefined,
    fechaFin: string | Date | undefined,
  ): void {
    if (!anios || anios.length === 0 || (!fechaInicio && !fechaFin)) return;

    const minAnio = Math.min(...anios);
    const maxAnio = Math.max(...anios);
    const rangoFechaInicio = new Date(`${minAnio}-01-01`);
    const rangoFechaFin = new Date(`${maxAnio}-12-31`);

    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio);
      if (fechaInicioDate < rangoFechaInicio || fechaInicioDate > rangoFechaFin) {
        throw new BadRequestException(
          `La fecha de inicio debe estar dentro del rango de años seleccionados (${minAnio}-01-01 a ${maxAnio}-12-31)`
        );
      }
    }

    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin);
      if (fechaFinDate < rangoFechaInicio || fechaFinDate > rangoFechaFin) {
        throw new BadRequestException(
          `La fecha de fin debe estar dentro del rango de años seleccionados (${minAnio}-01-01 a ${maxAnio}-12-31)`
        );
      }
    }
  }

  async create(createDto: CreateProyectoDto, userId?: number): Promise<Proyecto> {
    // Validar que la Acción Estratégica exista si se proporciona
    if (createDto.accionEstrategicaId) {
      const accionExiste = await this.accionEstrategicaRepository.findOne({
        where: { id: createDto.accionEstrategicaId },
      });
      if (!accionExiste) {
        throw new NotFoundException(
          `Acción Estratégica con ID ${createDto.accionEstrategicaId} no encontrada`
        );
      }
    }

    // Generar código automáticamente (secuencia global)
    const codigo = await this.generateCodigo();

    if (createDto.fechaInicio && createDto.fechaFin) {
      if (new Date(createDto.fechaFin) < new Date(createDto.fechaInicio)) {
        throw new BadRequestException('La fecha de fin debe ser mayor o igual a la fecha de inicio');
      }
    }

    // Validar que los años seleccionados estén dentro del rango del PGD
    await this.validateAniosEnRangoPGD(
      createDto.accionEstrategicaId,
      createDto.anios,
    );

    // Validar que las fechas estén dentro del rango del PGD
    await this.validateFechasEnRangoPGD(
      createDto.accionEstrategicaId,
      createDto.fechaInicio ?? undefined,
      createDto.fechaFin ?? undefined,
    );

    // Validar que las fechas estén dentro del rango de años seleccionados
    this.validateFechasEnRangoAnios(
      createDto.anios,
      createDto.fechaInicio ?? undefined,
      createDto.fechaFin ?? undefined,
    );

    // Desestructurar para manejar fechas por separado
    const { fechaInicio, fechaFin, ...restDto } = createDto;

    const proyecto = this.proyectoRepository.create({
      ...restDto,
      codigo, // Usar el código autogenerado
      metodoGestion: 'Scrum',
      // Las fechas se guardan como strings gracias al DateOnlyTransformer
      fechaInicio: fechaInicio || null,
      fechaFin: fechaFin || null,
      createdBy: userId,
      updatedBy: userId,
    });

    const proyectoGuardado: Proyecto = await this.proyectoRepository.save(proyecto);

    // Crear cronograma automáticamente para el proyecto
    try {
      await this.cronogramaService.create({
        proyectoId: proyectoGuardado.id,
        nombre: `Cronograma - ${proyectoGuardado.nombre}`,
        descripcion: `Cronograma del proyecto ${proyectoGuardado.codigo}`,
        fechaInicio: fechaInicio ?? undefined,
        fechaFin: fechaFin ?? undefined,
      }, userId);
    } catch (error) {
      console.error('Error al crear cronograma automático:', error);
      // No lanzamos error - el proyecto se creó correctamente
    }

    // Notificar al coordinador si se le asigna el proyecto
    if (createDto.coordinadorId && createDto.coordinadorId !== userId) {
      await this.notificacionService.notificar(
        TipoNotificacion.PROYECTOS,
        createDto.coordinadorId,
        {
          titulo: `Nuevo proyecto asignado: ${proyectoGuardado.codigo}`,
          descripcion: `Se te ha asignado como Coordinador del proyecto "${proyectoGuardado.nombre}"`,
          entidadTipo: 'Proyecto',
          entidadId: proyectoGuardado.id,
          proyectoId: proyectoGuardado.id,
          urlAccion: `/poi/proyecto/detalles?id=${proyectoGuardado.id}`,
        },
      );
    }

    // Notificar al Scrum Master si se le asigna
    if (createDto.scrumMasterId && createDto.scrumMasterId !== userId && createDto.scrumMasterId !== createDto.coordinadorId) {
      await this.notificacionService.notificar(
        TipoNotificacion.PROYECTOS,
        createDto.scrumMasterId,
        {
          titulo: `Nuevo proyecto asignado: ${proyectoGuardado.codigo}`,
          descripcion: `Se te ha asignado como Scrum Master del proyecto "${proyectoGuardado.nombre}"`,
          entidadTipo: 'Proyecto',
          entidadId: proyectoGuardado.id,
          proyectoId: proyectoGuardado.id,
          urlAccion: `/poi/proyecto/detalles?id=${proyectoGuardado.id}`,
        },
      );
    }

    return proyectoGuardado;
  }

  async findAll(filters?: {
    estado?: ProyectoEstado;
    coordinadorId?: number;
    scrumMasterId?: number;
    accionEstrategicaId?: number;
    activo?: boolean;
    pgdId?: number;
  }): Promise<Proyecto[]> {
    const queryBuilder = this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.coordinador', 'coordinador')
      .leftJoinAndSelect('proyecto.scrumMaster', 'scrumMaster')
      .leftJoinAndSelect('proyecto.accionEstrategica', 'ae')
      .orderBy('proyecto.createdAt', 'DESC');

    if (filters?.estado) {
      queryBuilder.andWhere('proyecto.estado = :estado', { estado: filters.estado });
    }

    if (filters?.coordinadorId) {
      queryBuilder.andWhere('proyecto.coordinadorId = :coordinadorId', { coordinadorId: filters.coordinadorId });
    }

    if (filters?.scrumMasterId) {
      queryBuilder.andWhere('proyecto.scrumMasterId = :scrumMasterId', { scrumMasterId: filters.scrumMasterId });
    }

    if (filters?.accionEstrategicaId) {
      queryBuilder.andWhere('proyecto.accionEstrategicaId = :accionEstrategicaId', { accionEstrategicaId: filters.accionEstrategicaId });
    }

    // Filtrar por PGD a través de la cadena: Proyecto -> AE -> OEGD -> OGD -> PGD
    if (filters?.pgdId) {
      queryBuilder
        .leftJoin('ae.oegd', 'oegd')
        .leftJoin('oegd.ogd', 'ogd')
        .andWhere('ogd.pgdId = :pgdId', { pgdId: filters.pgdId });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('proyecto.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Proyecto> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { id },
      relations: [
        'coordinador',
        'scrumMaster',
        'patrocinador',
        'accionEstrategica',
        'subproyectos',
      ],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    return proyecto;
  }

  async findByCodigo(codigo: string): Promise<Proyecto> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { codigo },
      relations: ['coordinador', 'scrumMaster', 'patrocinador'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con código ${codigo} no encontrado`);
    }

    return proyecto;
  }

  async update(id: number, updateDto: UpdateProyectoDto, userId?: number): Promise<Proyecto> {
    const proyecto = await this.findOne(id);

    // Capturar valores anteriores para notificaciones
    const coordinadorAnterior = proyecto.coordinadorId;
    const scrumMasterAnterior = proyecto.scrumMasterId;

    if (updateDto.fechaInicio && updateDto.fechaFin) {
      if (new Date(updateDto.fechaFin) < new Date(updateDto.fechaInicio)) {
        throw new BadRequestException('La fecha de fin debe ser mayor o igual a la fecha de inicio');
      }
    }

    // Nota: null significa "limpiar el campo", undefined significa "no enviado, usar existente"
    const aniosAValidar = updateDto.anios ?? proyecto.anios;
    const accionEstrategicaIdAValidar = updateDto.accionEstrategicaId ?? proyecto.accionEstrategicaId;

    // Determinar fechas efectivas: null = limpiar, undefined = usar existente
    const fechaInicioEfectiva = updateDto.fechaInicio === null
      ? undefined
      : (updateDto.fechaInicio !== undefined ? updateDto.fechaInicio : (proyecto.fechaInicio ?? undefined));
    const fechaFinEfectiva = updateDto.fechaFin === null
      ? undefined
      : (updateDto.fechaFin !== undefined ? updateDto.fechaFin : (proyecto.fechaFin ?? undefined));

    // Validar que los años seleccionados estén dentro del rango del PGD
    await this.validateAniosEnRangoPGD(
      accionEstrategicaIdAValidar,
      aniosAValidar,
    );

    // Validar que las fechas estén dentro del rango del PGD
    await this.validateFechasEnRangoPGD(
      accionEstrategicaIdAValidar,
      fechaInicioEfectiva,
      fechaFinEfectiva,
    );

    // Validar que las fechas estén dentro del rango de años seleccionados
    if (aniosAValidar && (fechaInicioEfectiva || fechaFinEfectiva)) {
      this.validateFechasEnRangoAnios(
        aniosAValidar,
        fechaInicioEfectiva,
        fechaFinEfectiva,
      );
    }

    // Desestructurar para manejar fechas por separado
    const { fechaInicio: updateFechaInicio, fechaFin: updateFechaFin, ...restUpdateDto } = updateDto;

    // Preparar datos para la actualización, convirtiendo fechas apropiadamente
    const updateData: Partial<Proyecto> = {
      ...restUpdateDto,
      updatedBy: userId,
    };

    // Manejar fechaInicio: null = limpiar, undefined = no cambiar, string = convertir a Date
    if (updateFechaInicio !== undefined) {
      updateData.fechaInicio = updateFechaInicio ? this.parseDateString(updateFechaInicio) : (null as any);
    }
    // Manejar fechaFin: null = limpiar, undefined = no cambiar, string = convertir a Date
    if (updateFechaFin !== undefined) {
      updateData.fechaFin = updateFechaFin ? this.parseDateString(updateFechaFin) : (null as any);
    }

    // Usar update() del repositorio para evitar problemas con relaciones
    // TypeORM prioriza las relaciones sobre los campos de ID cuando se usa save()
    // Por eso usamos update() que trabaja directamente con los campos
    await this.proyectoRepository.update(id, updateData);

    // Recargar el proyecto con las relaciones actualizadas
    const saved = await this.findOne(id);

    // Notificar al nuevo coordinador si cambió
    if (updateDto.coordinadorId && updateDto.coordinadorId !== coordinadorAnterior && updateDto.coordinadorId !== userId) {
      await this.notificacionService.notificar(
        TipoNotificacion.PROYECTOS,
        updateDto.coordinadorId,
        {
          titulo: `Asignado como Coordinador: ${proyecto.codigo}`,
          descripcion: `Se te ha asignado como Coordinador del proyecto "${proyecto.nombre}"`,
          entidadTipo: 'Proyecto',
          entidadId: proyecto.id,
          proyectoId: proyecto.id,
          urlAccion: `/poi/proyecto/detalles?id=${proyecto.id}`,
        },
      );
    }

    // Notificar al nuevo Scrum Master si cambió
    if (updateDto.scrumMasterId && updateDto.scrumMasterId !== scrumMasterAnterior && updateDto.scrumMasterId !== userId) {
      await this.notificacionService.notificar(
        TipoNotificacion.PROYECTOS,
        updateDto.scrumMasterId,
        {
          titulo: `Asignado como Scrum Master: ${proyecto.codigo}`,
          descripcion: `Se te ha asignado como Scrum Master del proyecto "${proyecto.nombre}"`,
          entidadTipo: 'Proyecto',
          entidadId: proyecto.id,
          proyectoId: proyecto.id,
          urlAccion: `/poi/proyecto/detalles?id=${proyecto.id}`,
        },
      );
    }

    return saved;
  }

  async cambiarEstado(id: number, cambiarEstadoDto: CambiarEstadoProyectoDto, userId?: number): Promise<Proyecto> {
    const proyecto = await this.findOne(id);
    const estadoAnterior = proyecto.estado;

    // Validar transiciones de estado permitidas
    const transicionesPermitidas: Record<ProyectoEstado, ProyectoEstado[]> = {
      [ProyectoEstado.PENDIENTE]: [ProyectoEstado.EN_PLANIFICACION, ProyectoEstado.CANCELADO],
      [ProyectoEstado.EN_PLANIFICACION]: [ProyectoEstado.EN_DESARROLLO, ProyectoEstado.CANCELADO],
      [ProyectoEstado.EN_DESARROLLO]: [ProyectoEstado.FINALIZADO, ProyectoEstado.CANCELADO],
      [ProyectoEstado.FINALIZADO]: [],
      [ProyectoEstado.CANCELADO]: [],
    };

    if (!transicionesPermitidas[proyecto.estado]?.includes(cambiarEstadoDto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${proyecto.estado} a ${cambiarEstadoDto.estado}`,
      );
    }

    proyecto.estado = cambiarEstadoDto.estado;
    proyecto.updatedBy = userId;
    const proyectoActualizado = await this.proyectoRepository.save(proyecto);

    // Notificar al equipo sobre el cambio de estado
    const destinatarios: number[] = [];
    if (proyecto.coordinadorId && proyecto.coordinadorId !== userId) {
      destinatarios.push(proyecto.coordinadorId);
    }
    if (proyecto.scrumMasterId && proyecto.scrumMasterId !== userId && proyecto.scrumMasterId !== proyecto.coordinadorId) {
      destinatarios.push(proyecto.scrumMasterId);
    }

    if (destinatarios.length > 0) {
      const mensajeEstado = cambiarEstadoDto.estado === ProyectoEstado.FINALIZADO
        ? 'ha sido finalizado'
        : cambiarEstadoDto.estado === ProyectoEstado.CANCELADO
        ? 'ha sido cancelado'
        : `ha cambiado a estado ${cambiarEstadoDto.estado}`;

      await this.notificacionService.notificarMultiples(
        TipoNotificacion.PROYECTOS,
        destinatarios,
        {
          titulo: `Estado de proyecto actualizado: ${proyecto.codigo}`,
          descripcion: `El proyecto "${proyecto.nombre}" ${mensajeEstado}`,
          entidadTipo: 'Proyecto',
          entidadId: proyecto.id,
          proyectoId: proyecto.id,
          urlAccion: `/poi/proyecto/detalles?id=${proyecto.id}`,
        },
      );
    }

    return proyectoActualizado;
  }

  async remove(id: number, userId?: number): Promise<Proyecto> {
    const proyecto = await this.findOne(id);
    proyecto.activo = false;
    proyecto.updatedBy = userId;
    return this.proyectoRepository.save(proyecto);
  }

  async findByAccionEstrategica(accionEstrategicaId: number): Promise<Proyecto[]> {
    return this.proyectoRepository.find({
      where: { accionEstrategicaId, activo: true },
      order: { codigo: 'ASC' },
    });
  }
}
