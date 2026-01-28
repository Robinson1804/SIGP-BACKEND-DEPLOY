import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HistoriaUsuario } from '../entities/historia-usuario.entity';
import { CriterioAceptacion } from '../entities/criterio-aceptacion.entity';
import { HuDependencia } from '../entities/hu-dependencia.entity';
import { HuRequerimiento } from '../entities/hu-requerimiento.entity';
import { CreateHistoriaUsuarioDto } from '../dto/create-historia-usuario.dto';
import { UpdateHistoriaUsuarioDto } from '../dto/update-historia-usuario.dto';
import { CambiarEstadoHuDto } from '../dto/cambiar-estado-hu.dto';
import { MoverSprintDto } from '../dto/mover-sprint.dto';
import { AsignarHuDto } from '../dto/asignar-hu.dto';
import { AgregarDependenciaDto } from '../dto/agregar-dependencia.dto';
import { ReordenarBacklogDto } from '../dto/reordenar-backlog.dto';
import { VincularRequerimientoDto } from '../dto/vincular-requerimiento.dto';
import { ValidarHuDto } from '../dto/validar-hu.dto';
import { HuPrioridad, HuEstado } from '../enums/historia-usuario.enum';
import { HistorialCambioService } from '../../common/services/historial-cambio.service';
import { HistorialEntidadTipo, HistorialAccion } from '../../common/enums/historial-cambio.enum';
import { EpicaService } from '../../epicas/services/epica.service';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Tarea } from '../../tareas/entities/tarea.entity';
import { TareaTipo, TareaEstado } from '../../tareas/enums/tarea.enum';
import { NotificacionService } from '../../../notificaciones/services/notificacion.service';
import { TipoNotificacion } from '../../../notificaciones/enums/tipo-notificacion.enum';
import { HuEvidenciaPdfService } from './hu-evidencia-pdf.service';
import { MinioService } from '../../../storage/services/minio.service';

@Injectable()
export class HistoriaUsuarioService {
  private readonly logger = new Logger(HistoriaUsuarioService.name);

  constructor(
    @InjectRepository(HistoriaUsuario)
    private readonly huRepository: Repository<HistoriaUsuario>,
    @InjectRepository(CriterioAceptacion)
    private readonly criterioRepository: Repository<CriterioAceptacion>,
    @InjectRepository(HuDependencia)
    private readonly dependenciaRepository: Repository<HuDependencia>,
    @InjectRepository(HuRequerimiento)
    private readonly huRequerimientoRepository: Repository<HuRequerimiento>,
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    private readonly historialCambioService: HistorialCambioService,
    private readonly epicaService: EpicaService,
    @Inject(forwardRef(() => NotificacionService))
    private readonly notificacionService: NotificacionService,
    private readonly huEvidenciaPdfService: HuEvidenciaPdfService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Valida que las fechas de la HU estén dentro del rango del sprint
   */
  private async validarFechasContraSprint(
    sprintId: number | null | undefined,
    fechaInicio: string | null | undefined,
    fechaFin: string | null | undefined,
  ): Promise<void> {
    // Si no hay sprint asignado, no hay validación de fechas
    if (!sprintId) return;

    // Si no hay fechas en la HU, no hay nada que validar
    if (!fechaInicio && !fechaFin) return;

    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId, activo: true },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint con ID ${sprintId} no encontrado`);
    }

    // Si el sprint no tiene fechas definidas, no se puede validar
    if (!sprint.fechaInicio || !sprint.fechaFin) {
      return;
    }

    const sprintInicio = new Date(sprint.fechaInicio);
    const sprintFin = new Date(sprint.fechaFin);

    if (fechaInicio) {
      const huInicio = new Date(fechaInicio);
      if (huInicio < sprintInicio || huInicio > sprintFin) {
        throw new BadRequestException(
          `La fecha de inicio de la HU (${fechaInicio}) debe estar dentro del rango del sprint (${sprint.fechaInicio} - ${sprint.fechaFin})`,
        );
      }
    }

    if (fechaFin) {
      const huFin = new Date(fechaFin);
      if (huFin < sprintInicio || huFin > sprintFin) {
        throw new BadRequestException(
          `La fecha de fin de la HU (${fechaFin}) debe estar dentro del rango del sprint (${sprint.fechaInicio} - ${sprint.fechaFin})`,
        );
      }
    }

    // Validar que fecha inicio no sea mayor que fecha fin
    if (fechaInicio && fechaFin) {
      const huInicio = new Date(fechaInicio);
      const huFin = new Date(fechaFin);
      if (huInicio > huFin) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser mayor que la fecha de fin',
        );
      }
    }
  }

  /**
   * Genera el siguiente código de HU para un proyecto
   * Formato: HU-XXX donde XXX es el número secuencial
   */
  async getNextCodigo(proyectoId: number): Promise<string> {
    const historias = await this.huRepository.find({
      where: { proyectoId },
      select: ['codigo'],
    });

    let maxNum = 0;
    for (const historia of historias) {
      const match = historia.codigo.match(/HU-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    const nextNum = String(maxNum + 1).padStart(3, '0');
    return `HU-${nextNum}`;
  }

  async create(createDto: CreateHistoriaUsuarioDto, userId?: number): Promise<HistoriaUsuario> {
    const existing = await this.huRepository.findOne({
      where: { proyectoId: createDto.proyectoId, codigo: createDto.codigo },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una HU con el código ${createDto.codigo} en este proyecto`,
      );
    }

    // Validar fechas contra rango del sprint (si aplica)
    await this.validarFechasContraSprint(
      createDto.sprintId,
      createDto.fechaInicio,
      createDto.fechaFin,
    );

    const { criteriosAceptacion, ...huData } = createDto;

    const hu = this.huRepository.create({
      ...huData,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedHu = await this.huRepository.save(hu);

    // Create criterios de aceptación if provided
    if (criteriosAceptacion && criteriosAceptacion.length > 0) {
      const criterios = criteriosAceptacion.map((c, index) =>
        this.criterioRepository.create({
          ...c,
          historiaUsuarioId: savedHu.id,
          orden: c.orden ?? index + 1,
        }),
      );
      await this.criterioRepository.save(criterios);
    }

    // Registrar creacion en historial
    if (userId) {
      await this.historialCambioService.registrarCreacion(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        savedHu.id,
        userId,
        { codigo: savedHu.codigo, titulo: savedHu.titulo },
      );
    }

    // Recalcular estado de la épica si la HU pertenece a una
    if (savedHu.epicaId) {
      await this.epicaService.recalcularEstado(savedHu.epicaId, userId);
    }

    return this.findOne(savedHu.id);
  }

  async findAll(filters?: {
    proyectoId?: number;
    epicaId?: number;
    sprintId?: number;
    estado?: HuEstado;
    prioridad?: HuPrioridad;
    asignadoA?: number;
    enBacklog?: boolean;
    activo?: boolean;
  }): Promise<HistoriaUsuario[]> {
    const queryBuilder = this.huRepository
      .createQueryBuilder('hu')
      .leftJoinAndSelect('hu.epica', 'epica')
      .leftJoinAndSelect('hu.sprint', 'sprint')
      .leftJoinAndSelect('hu.requerimiento', 'requerimiento')
      .orderBy('hu.ordenBacklog', 'ASC')
      .addOrderBy('hu.prioridad', 'ASC')
      .addOrderBy('hu.createdAt', 'DESC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('hu.proyectoId = :proyectoId', {
        proyectoId: filters.proyectoId,
      });
    }

    if (filters?.epicaId) {
      queryBuilder.andWhere('hu.epicaId = :epicaId', { epicaId: filters.epicaId });
    }

    if (filters?.sprintId) {
      queryBuilder.andWhere('hu.sprintId = :sprintId', { sprintId: filters.sprintId });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('hu.estado = :estado', { estado: filters.estado });
    }

    if (filters?.prioridad) {
      queryBuilder.andWhere('hu.prioridad = :prioridad', { prioridad: filters.prioridad });
    }

    if (filters?.asignadoA) {
      queryBuilder.andWhere('hu.asignadoA = :asignadoA', { asignadoA: filters.asignadoA });
    }

    if (filters?.enBacklog === true) {
      queryBuilder.andWhere('hu.sprintId IS NULL');
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('hu.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<HistoriaUsuario[]> {
    return this.huRepository.find({
      where: { proyectoId, activo: true },
      relations: ['epica', 'sprint'],
      order: { ordenBacklog: 'ASC', prioridad: 'ASC' },
    });
  }

  async findBySprint(sprintId: number): Promise<HistoriaUsuario[]> {
    return this.huRepository.find({
      where: { sprintId, activo: true },
      relations: ['epica'],
      order: { prioridad: 'ASC', ordenBacklog: 'ASC' },
    });
  }

  async findByEpica(epicaId: number): Promise<HistoriaUsuario[]> {
    return this.huRepository.find({
      where: { epicaId, activo: true },
      relations: ['sprint'],
      order: { prioridad: 'ASC', ordenBacklog: 'ASC' },
    });
  }

  async findOne(id: number): Promise<HistoriaUsuario> {
    const hu = await this.huRepository
      .createQueryBuilder('hu')
      .leftJoinAndSelect('hu.proyecto', 'proyecto')
      .leftJoinAndSelect('hu.epica', 'epica')
      .leftJoinAndSelect('hu.sprint', 'sprint')
      .leftJoinAndSelect('hu.creador', 'creador')
      .leftJoinAndSelect('hu.requerimiento', 'requerimiento')
      .leftJoinAndSelect('hu.criteriosAceptacion', 'criterios', 'criterios.activo = :activo', { activo: true })
      .leftJoinAndSelect('hu.dependencias', 'dependencias')
      .leftJoinAndSelect('dependencias.dependeDe', 'dependeDe')
      .where('hu.id = :id', { id })
      .getOne();

    if (!hu) {
      throw new NotFoundException(`Historia de Usuario con ID ${id} no encontrada`);
    }

    return hu;
  }

  async update(
    id: number,
    updateDto: UpdateHistoriaUsuarioDto,
    userId?: number,
  ): Promise<HistoriaUsuario> {
    console.log('=== UPDATE HISTORIA SERVICE ===');
    console.log('ID:', id);
    console.log('UpdateDTO recibido:', JSON.stringify(updateDto, null, 2));
    console.log('asignadoA en DTO:', updateDto.asignadoA, 'tipo:', typeof updateDto.asignadoA);

    const hu = await this.findOne(id);
    console.log('asignadoA actual en BD:', hu.asignadoA);

    // Bloquear edición si HU está en revisión o finalizada
    if (hu.estado === HuEstado.EN_REVISION) {
      throw new BadRequestException(
        'No se puede editar una Historia de Usuario que está en revisión. Espere a que sea validada o rechazada.',
      );
    }
    if (hu.estado === HuEstado.FINALIZADO) {
      throw new BadRequestException(
        'No se puede editar una Historia de Usuario que ya ha sido validada y finalizada.',
      );
    }

    // Clonar valores anteriores para comparacion
    const valoresAnteriores = {
      titulo: hu.titulo,
      rol: hu.rol,
      quiero: hu.quiero,
      para: hu.para,
      estado: hu.estado,
      prioridad: hu.prioridad,
      storyPoints: hu.storyPoints,
      epicaId: hu.epicaId,
      sprintId: hu.sprintId,
      asignadoA: hu.asignadoA,
      ordenBacklog: hu.ordenBacklog,
    };

    // Validar fechas contra rango del sprint (si aplica)
    // Usar valores nuevos si se proporcionan, sino los existentes
    const sprintIdFinal = 'sprintId' in updateDto ? updateDto.sprintId : hu.sprintId;
    const fechaInicioFinal = 'fechaInicio' in updateDto ? updateDto.fechaInicio : hu.fechaInicio;
    const fechaFinFinal = 'fechaFin' in updateDto ? updateDto.fechaFin : hu.fechaFin;

    await this.validarFechasContraSprint(sprintIdFinal, fechaInicioFinal, fechaFinFinal);

    const { criteriosAceptacion, ...huData } = updateDto;

    // Validación: No se puede establecer "Finalizado" manualmente
    if ('estado' in huData && huData.estado === HuEstado.FINALIZADO) {
      throw new BadRequestException(
        'El estado "Finalizado" no se puede seleccionar manualmente. ' +
        'La Historia de Usuario pasará a "Finalizado" automáticamente cuando el documento de evidencias sea validado.',
      );
    }

    // Construir objeto de actualización
    const updateFields: Partial<HistoriaUsuario> = {
      updatedBy: userId,
    };

    // Campos que pueden ser null (asignadoA se maneja aparte como array)
    const nullableFields = ['epicaId', 'sprintId', 'storyPoints', 'prioridad', 'rol', 'quiero', 'para', 'fechaInicio', 'fechaFin', 'requerimientoId'] as const;
    for (const field of nullableFields) {
      if (field in huData) {
        (updateFields as any)[field] = (huData as any)[field] ?? null;
      }
    }

    // Campos no-null
    if ('titulo' in huData) updateFields.titulo = huData.titulo;
    if ('estado' in huData) updateFields.estado = huData.estado;
    if ('codigo' in huData) updateFields.codigo = (huData as any).codigo;

    // Campo asignadoA ahora es un array de IDs
    if ('asignadoA' in huData) {
      // Asegurar que sea un array
      const asignadoValue = huData.asignadoA;
      if (Array.isArray(asignadoValue)) {
        updateFields.asignadoA = asignadoValue;
      } else if (asignadoValue !== null && asignadoValue !== undefined) {
        // Si llega un solo valor, convertirlo a array
        updateFields.asignadoA = [asignadoValue];
      } else {
        updateFields.asignadoA = [];
      }
      console.log('=== ASIGNADO_A UPDATE (array) ===');
      console.log('asignadoA a guardar:', updateFields.asignadoA);
    }

    // Compatibilidad: si viene 'responsables' usarlo para asignadoA
    if ('responsables' in huData && !('asignadoA' in huData)) {
      updateFields.asignadoA = (huData as any).responsables || [];
      console.log('=== RESPONSABLES -> ASIGNADO_A ===');
      console.log('asignadoA desde responsables:', updateFields.asignadoA);
    }

    // Actualizar con query builder para evitar problemas con TypeORM
    await this.huRepository
      .createQueryBuilder()
      .update()
      .set(updateFields)
      .where('id = :id', { id })
      .execute();

    // Update criterios if provided
    if (criteriosAceptacion !== undefined) {
      await this.criterioRepository.delete({ historiaUsuarioId: id });
      if (criteriosAceptacion.length > 0) {
        const criterios = criteriosAceptacion.map((c, index) =>
          this.criterioRepository.create({
            ...c,
            historiaUsuarioId: id,
            orden: c.orden ?? index + 1,
          }),
        );
        await this.criterioRepository.save(criterios);
      }
    }

    // Registrar cambios en historial
    if (userId) {
      await this.historialCambioService.registrarCambiosMultiples(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        id,
        valoresAnteriores,
        huData,
        userId,
      );
    }

    // Verificar los valores guardados
    const verifyResult = await this.huRepository.query(
      'SELECT asignado_a FROM agile.historias_usuario WHERE id = $1',
      [id]
    );
    console.log('Verificación BD - asignado_a:', verifyResult[0]?.asignado_a);

    // Recalcular estado de épica(s) si cambió estado o epicaId
    const epicaAnterior = valoresAnteriores.epicaId;
    const epicaNueva = updateFields.epicaId ?? hu.epicaId;
    const estadoCambio = 'estado' in huData && valoresAnteriores.estado !== huData.estado;
    const epicaCambio = 'epicaId' in huData && epicaAnterior !== huData.epicaId;

    if (estadoCambio || epicaCambio) {
      // Recalcular épica anterior si cambió de épica
      if (epicaCambio && epicaAnterior) {
        await this.epicaService.recalcularEstado(epicaAnterior, userId);
      }
      // Recalcular épica actual
      if (epicaNueva) {
        await this.epicaService.recalcularEstado(epicaNueva, userId);
      }
    }

    // Re-fetch using findOne to get relations
    return this.findOne(id);
  }

  async cambiarEstado(
    id: number,
    cambiarEstadoDto: CambiarEstadoHuDto,
    userId?: number,
  ): Promise<HistoriaUsuario> {
    const hu = await this.findOne(id);
    const estadoAnterior = hu.estado;

    // Validación: No se puede seleccionar "Finalizado" manualmente
    // El estado "Finalizado" solo se alcanza cuando el PDF de evidencias está validado
    if (cambiarEstadoDto.estado === HuEstado.FINALIZADO) {
      throw new BadRequestException(
        'El estado "Finalizado" no se puede seleccionar manualmente. ' +
        'La Historia de Usuario pasará a "Finalizado" automáticamente cuando el documento de evidencias sea validado.',
      );
    }

    hu.estado = cambiarEstadoDto.estado;
    hu.updatedBy = userId;

    const huActualizada = await this.huRepository.save(hu);

    // Registrar cambio de estado en historial
    if (userId && estadoAnterior !== cambiarEstadoDto.estado) {
      await this.historialCambioService.registrarCambioEstado(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        id,
        estadoAnterior,
        cambiarEstadoDto.estado,
        userId,
      );
    }

    // Recalcular estado de la épica si la HU pertenece a una
    if (huActualizada.epicaId) {
      await this.epicaService.recalcularEstado(huActualizada.epicaId, userId);
    }

    return huActualizada;
  }

  async moverASprint(
    id: number,
    moverDto: MoverSprintDto,
    userId?: number,
  ): Promise<HistoriaUsuario> {
    const hu = await this.findOne(id);
    const sprintAnterior = hu.sprintId;

    hu.sprintId = moverDto.sprintId || null;
    hu.updatedBy = userId;

    const huActualizada = await this.huRepository.save(hu);

    // Registrar movimiento en historial
    if (userId && sprintAnterior !== hu.sprintId) {
      await this.historialCambioService.registrarMovimiento(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        id,
        'sprintId',
        sprintAnterior,
        hu.sprintId,
        userId,
      );
    }

    return huActualizada;
  }

  async asignar(id: number, asignarDto: AsignarHuDto, userId?: number): Promise<HistoriaUsuario> {
    const hu = await this.findOne(id);
    const asignadoAnterior = [...(hu.asignadoA || [])];

    // asignadoA ahora es un array, el DTO puede enviar un solo número o un array
    const nuevoAsignadoA = Array.isArray(asignarDto.asignadoA)
      ? asignarDto.asignadoA
      : asignarDto.asignadoA ? [asignarDto.asignadoA] : [];

    hu.asignadoA = nuevoAsignadoA;
    hu.updatedBy = userId;

    const huActualizada = await this.huRepository.save(hu);

    // Registrar asignacion en historial (comparar como strings para simplificar)
    if (userId && JSON.stringify(asignadoAnterior) !== JSON.stringify(hu.asignadoA)) {
      await this.historialCambioService.registrarAsignacion(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        id,
        asignadoAnterior.length > 0 ? asignadoAnterior[0] : null,
        hu.asignadoA.length > 0 ? hu.asignadoA[0] : null,
        userId,
      );
    }

    return huActualizada;
  }

  async agregarDependencia(
    id: number,
    agregarDto: AgregarDependenciaDto,
    userId?: number,
  ): Promise<HuDependencia> {
    const hu = await this.findOne(id);

    // Check that dependeDe exists
    const dependeDe = await this.huRepository.findOne({
      where: { id: agregarDto.dependeDeId, activo: true },
    });

    if (!dependeDe) {
      throw new NotFoundException(
        `Historia de Usuario con ID ${agregarDto.dependeDeId} no encontrada`,
      );
    }

    // Check no self-reference
    if (id === agregarDto.dependeDeId) {
      throw new BadRequestException('Una HU no puede depender de sí misma');
    }

    // Check no duplicate
    const existing = await this.dependenciaRepository.findOne({
      where: {
        historiaUsuarioId: id,
        dependeDeId: agregarDto.dependeDeId,
      },
    });

    if (existing) {
      throw new ConflictException('Esta dependencia ya existe');
    }

    const dependencia = this.dependenciaRepository.create({
      historiaUsuarioId: id,
      dependeDeId: agregarDto.dependeDeId,
      tipoDependencia: agregarDto.tipoDependencia,
      notas: agregarDto.notas,
    });

    return this.dependenciaRepository.save(dependencia);
  }

  async eliminarDependencia(id: number, dependenciaId: number): Promise<void> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: dependenciaId, historiaUsuarioId: id },
    });

    if (!dependencia) {
      throw new NotFoundException(`Dependencia con ID ${dependenciaId} no encontrada`);
    }

    await this.dependenciaRepository.remove(dependencia);
  }

  async reordenarBacklog(
    proyectoId: number,
    reordenarDto: ReordenarBacklogDto,
    userId?: number,
  ): Promise<void> {
    for (const item of reordenarDto.orden) {
      await this.huRepository.update(
        { id: item.huId, proyectoId },
        { ordenBacklog: item.ordenBacklog, updatedBy: userId },
      );
    }
  }

  async getBacklog(proyectoId: number): Promise<any> {
    const hus = await this.huRepository.find({
      where: { proyectoId, activo: true },
      relations: ['epica', 'sprint'],
      order: { ordenBacklog: 'ASC', prioridad: 'ASC' },
    });

    const backlog = hus.filter((hu) => !hu.sprintId);
    const husEnSprints = hus.filter((hu) => hu.sprintId);

    // Group by sprint
    const sprintMap = new Map();
    for (const hu of husEnSprints) {
      if (!sprintMap.has(hu.sprintId)) {
        sprintMap.set(hu.sprintId, {
          id: hu.sprint.id,
          nombre: hu.sprint.nombre,
          estado: hu.sprint.estado,
          fechaInicio: hu.sprint.fechaInicio,
          fechaFin: hu.sprint.fechaFin,
          storyPoints: 0,
          historias: [],
        });
      }
      const sprint = sprintMap.get(hu.sprintId);
      sprint.historias.push(hu);
      sprint.storyPoints += hu.storyPoints || 0;
    }

    // Get unique epicas
    const epicasMap = new Map();
    for (const hu of hus) {
      if (hu.epica && !epicasMap.has(hu.epicaId)) {
        epicasMap.set(hu.epicaId, {
          id: hu.epica.id,
          codigo: hu.epica.codigo,
          nombre: hu.epica.nombre,
          color: hu.epica.color,
        });
      }
    }

    const totalStoryPoints = hus.reduce((sum, hu) => sum + (hu.storyPoints || 0), 0);

    return {
      epicas: Array.from(epicasMap.values()),
      sprints: Array.from(sprintMap.values()),
      backlog,
      metricas: {
        totalHUs: hus.length,
        husEnBacklog: backlog.length,
        husEnSprints: husEnSprints.length,
        totalStoryPoints,
      },
    };
  }

  async remove(id: number, userId?: number): Promise<void> {
    const hu = await this.findOne(id);
    const epicaId = hu.epicaId;

    // Registrar eliminacion en historial antes de borrar
    if (userId) {
      await this.historialCambioService.registrarEliminacion(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        id,
        userId,
      );
    }

    // Eliminar definitivamente de la base de datos
    // Los criterios de aceptación y dependencias se eliminan por CASCADE
    await this.huRepository.remove(hu);

    // Recalcular estado de la épica después de eliminar la HU
    if (epicaId) {
      await this.epicaService.recalcularEstado(epicaId, userId);
    }
  }

  async vincularRequerimiento(
    id: number,
    vincularDto: VincularRequerimientoDto,
    userId?: number,
  ): Promise<HuRequerimiento> {
    // Verify Historia de Usuario exists
    const hu = await this.huRepository.findOne({
      where: { id, activo: true },
    });

    if (!hu) {
      throw new NotFoundException(`Historia de Usuario con ID ${id} no encontrada`);
    }

    // Check for duplicate
    const existing = await this.huRequerimientoRepository.findOne({
      where: {
        historiaUsuarioId: id,
        requerimientoId: vincularDto.requerimientoId,
      },
    });

    if (existing) {
      throw new ConflictException('Este requerimiento ya está vinculado a esta Historia de Usuario');
    }

    const huRequerimiento = this.huRequerimientoRepository.create({
      historiaUsuarioId: id,
      requerimientoId: vincularDto.requerimientoId,
      notas: vincularDto.notas,
    });

    return this.huRequerimientoRepository.save(huRequerimiento);
  }

  async obtenerRequerimientos(id: number): Promise<HuRequerimiento[]> {
    // Verify Historia de Usuario exists
    const hu = await this.huRepository.findOne({
      where: { id, activo: true },
    });

    if (!hu) {
      throw new NotFoundException(`Historia de Usuario con ID ${id} no encontrada`);
    }

    return this.huRequerimientoRepository.find({
      where: { historiaUsuarioId: id },
      relations: ['requerimiento'],
      order: { createdAt: 'DESC' },
    });
  }

  async desvincularRequerimiento(id: number, requerimientoId: number): Promise<void> {
    const huRequerimiento = await this.huRequerimientoRepository.findOne({
      where: { historiaUsuarioId: id, requerimientoId },
    });

    if (!huRequerimiento) {
      throw new NotFoundException('Vinculación no encontrada');
    }

    await this.huRequerimientoRepository.remove(huRequerimiento);
  }

  /**
   * Valida (aprueba o rechaza) una Historia de Usuario en estado "En revisión"
   * Solo puede ser ejecutado por SCRUM_MASTER
   *
   * Si aprueba: HU pasa a "Finalizado"
   * Si rechaza: HU y todas sus tareas vuelven a "En progreso"
   */
  async validarHu(
    id: number,
    validarDto: ValidarHuDto,
    userId: number,
  ): Promise<HistoriaUsuario> {
    // Obtener la HU con el proyecto
    const hu = await this.huRepository.findOne({
      where: { id, activo: true },
      relations: ['proyecto'],
    });

    if (!hu) {
      throw new NotFoundException(`Historia de Usuario con ID ${id} no encontrada`);
    }

    // Validar que la HU esté en estado "En revisión"
    if (hu.estado !== HuEstado.EN_REVISION) {
      throw new BadRequestException(
        `Solo se pueden validar Historias de Usuario en estado "En revisión". ` +
        `Estado actual: "${hu.estado}"`,
      );
    }

    const estadoAnterior = hu.estado;
    const proyectoNombre = hu.proyecto?.nombre || 'Proyecto';

    if (validarDto.aprobado) {
      // === APROBAR ===
      // Cambiar estado a "Finalizado"
      hu.estado = HuEstado.FINALIZADO;
      hu.updatedBy = userId;

      await this.huRepository.save(hu);

      // Registrar cambio de estado en historial
      await this.historialCambioService.registrarCambioEstado(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        id,
        estadoAnterior,
        HuEstado.FINALIZADO,
        userId,
      );

      // Notificar a los asignados de la HU
      if (hu.asignadoA && hu.asignadoA.length > 0) {
        const destinatarios = hu.asignadoA.map(a => parseInt(a.toString(), 10)).filter(n => !isNaN(n));
        if (destinatarios.length > 0) {
          await this.notificacionService.notificarMultiples(
            TipoNotificacion.APROBACIONES,
            destinatarios,
            {
              titulo: `HU Aprobada: ${hu.codigo}`,
              descripcion: `La Historia de Usuario "${hu.titulo}" ha sido aprobada y marcada como Finalizada.`,
              entidadTipo: 'HistoriaUsuario',
              entidadId: hu.id,
              proyectoId: hu.proyectoId,
              urlAccion: `/poi/proyecto/detalles?tab=Backlog`,
              observacion: validarDto.observacion,
            },
          );
        }
      }

      console.log(`[HU-${hu.codigo}] APROBADA → Estado cambiado a "Finalizado"`);
    } else {
      // === RECHAZAR ===
      // Cambiar estado de HU a "En progreso"
      hu.estado = HuEstado.EN_PROGRESO;
      hu.updatedBy = userId;

      await this.huRepository.save(hu);

      // Registrar cambio de estado en historial
      await this.historialCambioService.registrarCambioEstado(
        HistorialEntidadTipo.HISTORIA_USUARIO,
        id,
        estadoAnterior,
        HuEstado.EN_PROGRESO,
        userId,
      );

      // Cambiar todas las tareas SCRUM de la HU a "En progreso"
      const tareas = await this.tareaRepository.find({
        where: {
          historiaUsuarioId: id,
          activo: true,
          tipo: TareaTipo.SCRUM,
          estado: TareaEstado.FINALIZADO,
        },
      });

      for (const tarea of tareas) {
        const tareaEstadoAnterior = tarea.estado;
        tarea.estado = TareaEstado.EN_PROGRESO;
        tarea.updatedBy = userId;
        await this.tareaRepository.save(tarea);

        // Registrar cambio de estado de tarea
        await this.historialCambioService.registrarCambioEstado(
          HistorialEntidadTipo.TAREA,
          tarea.id,
          tareaEstadoAnterior,
          TareaEstado.EN_PROGRESO,
          userId,
        );
      }

      // Notificar a los asignados de la HU sobre el rechazo
      if (hu.asignadoA && hu.asignadoA.length > 0) {
        const destinatarios = hu.asignadoA.map(a => parseInt(a.toString(), 10)).filter(n => !isNaN(n));
        if (destinatarios.length > 0) {
          await this.notificacionService.notificarMultiples(
            TipoNotificacion.APROBACIONES,
            destinatarios,
            {
              titulo: `HU Rechazada: ${hu.codigo}`,
              descripcion: `La Historia de Usuario "${hu.titulo}" ha sido rechazada. Se requieren correcciones en las evidencias.`,
              entidadTipo: 'HistoriaUsuario',
              entidadId: hu.id,
              proyectoId: hu.proyectoId,
              urlAccion: `/poi/proyecto/detalles?tab=Backlog`,
              observacion: validarDto.observacion || 'Por favor revise las evidencias y vuelva a subir.',
            },
          );
        }
      }

      console.log(`[HU-${hu.codigo}] RECHAZADA → Estado cambiado a "En progreso" (${tareas.length} tareas también)`);
    }

    // Recalcular estado de la épica si la HU pertenece a una
    if (hu.epicaId) {
      await this.epicaService.recalcularEstado(hu.epicaId, userId);
    }

    return this.findOne(id);
  }

  /**
   * Regenera el PDF de evidencias para una Historia de Usuario en estado "En revisión"
   * Útil cuando se necesita actualizar el formato del PDF o agregar información faltante
   */
  async regenerarPdf(id: number): Promise<{ url: string; mensaje: string }> {
    // Obtener la HU con el proyecto y sprint
    const hu = await this.huRepository.findOne({
      where: { id, activo: true },
      relations: ['proyecto', 'sprint'],
    });

    if (!hu) {
      throw new NotFoundException(`Historia de Usuario con ID ${id} no encontrada`);
    }

    // Validar que la HU esté en estado "En revisión"
    if (hu.estado !== HuEstado.EN_REVISION) {
      throw new BadRequestException(
        `Solo se puede regenerar el PDF de Historias de Usuario en estado "En revisión". ` +
        `Estado actual: "${hu.estado}"`,
      );
    }

    this.logger.log(`Regenerando PDF de evidencias para HU ${hu.codigo}...`);

    try {
      // Generar nuevo PDF
      const pdfBuffer = await this.huEvidenciaPdfService.generateEvidenciasPdf(
        id,
        { codigo: hu.proyecto?.codigo || '', nombre: hu.proyecto?.nombre || '' },
        hu.sprint ? { nombre: hu.sprint.nombre } : null,
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

      // Generar URL de descarga (7 días de validez)
      const pdfUrl = await this.minioService.getPresignedGetUrl(bucketName, objectKey, 7 * 24 * 60 * 60);

      // Actualizar HU con nueva URL del PDF
      await this.huRepository.update(id, {
        documentoEvidenciasUrl: pdfUrl,
      });

      this.logger.log(`PDF regenerado exitosamente para HU ${hu.codigo}: ${objectKey}`);

      return {
        url: pdfUrl,
        mensaje: `PDF de evidencias regenerado exitosamente para la Historia de Usuario ${hu.codigo}`,
      };
    } catch (error) {
      this.logger.error(`Error regenerando PDF para HU ${hu.codigo}:`, error);
      throw new BadRequestException(
        `Error al regenerar el PDF de evidencias: ${error.message}`,
      );
    }
  }
}
