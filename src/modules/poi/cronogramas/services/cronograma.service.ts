import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cronograma } from '../entities/cronograma.entity';
import { CreateCronogramaDto } from '../dto/create-cronograma.dto';
import { UpdateCronogramaDto } from '../dto/update-cronograma.dto';
import { AprobarCronogramaDto } from '../dto/aprobar-cronograma.dto';
import { CronogramaEstado } from '../enums/cronograma.enum';
import { NotificacionService } from '../../../notificaciones/services/notificacion.service';
import { TipoNotificacion } from '../../../notificaciones/enums/tipo-notificacion.enum';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { Role } from '../../../../common/constants/roles.constant';

@Injectable()
export class CronogramaService {
  constructor(
    @InjectRepository(Cronograma)
    private readonly cronogramaRepository: Repository<Cronograma>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @Inject(forwardRef(() => NotificacionService))
    private readonly notificacionService: NotificacionService,
  ) {}

  /**
   * Obtiene usuarios con rol PMO o PATROCINADOR para notificaciones
   */
  private async getAprobadores(): Promise<{ pmoUsers: Usuario[]; patrocinadorUsers: Usuario[] }> {
    const pmoUsers = await this.usuarioRepository.find({
      where: { rol: Role.PMO, activo: true },
    });
    const patrocinadorUsers = await this.usuarioRepository.find({
      where: { rol: Role.PATROCINADOR, activo: true },
    });
    return { pmoUsers, patrocinadorUsers };
  }

  /**
   * Genera el siguiente código de cronograma en formato CR-XXX
   * La secuencia es GLOBAL (no por proyecto)
   */
  private async generateNextCodigo(): Promise<string> {
    const cronogramas = await this.cronogramaRepository.find({
      select: ['codigo'],
    });

    let maxNumber = 0;
    for (const cronograma of cronogramas) {
      // Soportar formatos: CR-001, CR-#001 (legacy)
      const match = cronograma.codigo?.match(/^CR-#?(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    return `CR-${String(nextNumber).padStart(3, '0')}`;
  }

  async create(createDto: CreateCronogramaDto, userId?: number): Promise<Cronograma> {
    // Validar que proyectoId esté definido
    if (!createDto.proyectoId) {
      throw new BadRequestException('El proyectoId es requerido para crear un cronograma');
    }

    // Validar que el proyecto no tenga ya un cronograma (relación 1:1)
    const existingForProject = await this.cronogramaRepository.findOne({
      where: { proyectoId: createDto.proyectoId, activo: true },
    });

    if (existingForProject) {
      throw new ConflictException(
        `El proyecto ya tiene un cronograma activo (${existingForProject.codigo}). Un proyecto solo puede tener un cronograma.`,
      );
    }

    // Generar codigo automaticamente si no se proporciona o no tiene formato correcto
    let codigo = createDto.codigo;
    if (!codigo || !codigo.match(/^CR-\d{3}$/)) {
      codigo = await this.generateNextCodigo();
    }

    // Verificar que el código no exista globalmente
    const existingCodigo = await this.cronogramaRepository.findOne({
      where: { codigo },
    });

    if (existingCodigo) {
      // Si el código ya existe, generar uno nuevo
      codigo = await this.generateNextCodigo();
    }

    // Generar fechas por defecto (hoy + 1 año)
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const cronograma = this.cronogramaRepository.create({
      ...createDto,
      codigo,
      fechaInicio: createDto.fechaInicio || now,
      fechaFin: createDto.fechaFin || oneYearLater,
      version: createDto.version || 1,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.cronogramaRepository.save(cronograma);
  }

  async findAll(filters?: {
    proyectoId?: number;
    estado?: CronogramaEstado;
    activo?: boolean;
  }): Promise<Cronograma[]> {
    const queryBuilder = this.cronogramaRepository
      .createQueryBuilder('cronograma')
      .orderBy('cronograma.createdAt', 'DESC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('cronograma.proyectoId = :proyectoId', {
        proyectoId: filters.proyectoId,
      });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('cronograma.estado = :estado', { estado: filters.estado });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('cronograma.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<Cronograma[]> {
    try {
      const cronogramas = await this.cronogramaRepository.find({
        where: { proyectoId, activo: true },
        relations: ['tareas'],
        order: { version: 'DESC' },
      });

      // Filtrar tareas inactivas (soft-deleted) - crear copia para no afectar la entidad
      return cronogramas.map(cronograma => ({
        ...cronograma,
        tareas: cronograma.tareas ? cronograma.tareas.filter(t => t.activo === true) : [],
      })) as Cronograma[];
    } catch (error) {
      console.error('Error in findByProyecto:', error);
      // Fallback sin relaciones si hay error
      return this.cronogramaRepository.find({
        where: { proyectoId, activo: true },
        order: { version: 'DESC' },
      });
    }
  }

  /**
   * Obtiene el cronograma sin filtrar tareas (uso interno para operaciones de escritura)
   */
  private async findOneInternal(id: number): Promise<Cronograma> {
    const cronograma = await this.cronogramaRepository.findOne({
      where: { id },
      relations: ['proyecto', 'tareas'],
    });

    if (!cronograma) {
      throw new NotFoundException(`Cronograma con ID ${id} no encontrado`);
    }

    return cronograma;
  }

  /**
   * Obtiene el cronograma filtrando tareas inactivas (uso para lectura/API)
   */
  async findOne(id: number): Promise<Cronograma> {
    const cronograma = await this.findOneInternal(id);

    // Filtrar tareas inactivas (soft-deleted) - crear copia para no afectar la entidad
    return {
      ...cronograma,
      tareas: cronograma.tareas ? cronograma.tareas.filter(t => t.activo === true) : [],
    } as Cronograma;
  }

  // Estados en los que se permite editar el cronograma
  private readonly ESTADOS_EDITABLES = [CronogramaEstado.BORRADOR, CronogramaEstado.RECHAZADO];

  /**
   * Valida que el cronograma esté en un estado que permita ediciones
   */
  private validarCronogramaEditable(cronograma: Cronograma): void {
    if (!this.ESTADOS_EDITABLES.includes(cronograma.estado)) {
      throw new BadRequestException(
        `No se puede modificar el cronograma en estado "${cronograma.estado}". ` +
        `Solo se permite editar en estados: ${this.ESTADOS_EDITABLES.join(', ')}.`
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateCronogramaDto,
    userId?: number,
  ): Promise<Cronograma> {
    const cronograma = await this.findOneInternal(id);

    // Validar que el cronograma permita ediciones
    this.validarCronogramaEditable(cronograma);

    Object.assign(cronograma, updateDto, { updatedBy: userId });

    return this.cronogramaRepository.save(cronograma);
  }

  async cambiarEstado(
    id: number,
    estado: CronogramaEstado,
    userId?: number,
  ): Promise<Cronograma> {
    const cronograma = await this.findOneInternal(id);
    cronograma.estado = estado;
    cronograma.updatedBy = userId;
    return this.cronogramaRepository.save(cronograma);
  }

  async remove(id: number, userId?: number): Promise<Cronograma> {
    const cronograma = await this.findOneInternal(id);

    // Validar que el cronograma permita ediciones
    this.validarCronogramaEditable(cronograma);

    cronograma.activo = false;
    cronograma.updatedBy = userId;
    return this.cronogramaRepository.save(cronograma);
  }

  /**
   * Aprobar o rechazar un cronograma
   * Sistema de aprobación dual: PMO y PATROCINADOR deben aprobar
   * @param userRole - Rol del usuario que aprueba (PMO o PATROCINADOR)
   */
  async aprobar(
    id: number,
    dto: AprobarCronogramaDto,
    userId: number,
    userRole?: string,
  ): Promise<Cronograma> {
    const cronograma = await this.findOneInternal(id);

    // Validar que el cronograma esté en estado En revisión
    if (cronograma.estado !== CronogramaEstado.EN_REVISION) {
      throw new BadRequestException(
        `Solo se pueden aprobar cronogramas en estado "En revisión". Estado actual: ${cronograma.estado}`,
      );
    }

    // Si se rechaza, el comentario es obligatorio
    if (!dto.aprobado && !dto.comentario?.trim()) {
      throw new BadRequestException(
        'Debe proporcionar un comentario para rechazar el cronograma',
      );
    }

    cronograma.updatedBy = userId;

    if (dto.aprobado) {
      // Registrar aprobación según el rol
      const rolAprobador = userRole === Role.PMO || userRole === Role.ADMIN ? 'PMO' : 'Patrocinador';

      if (userRole === Role.PMO || userRole === Role.ADMIN) {
        if (cronograma.aprobadoPorPmo) {
          throw new BadRequestException('El PMO ya ha aprobado este cronograma');
        }
        cronograma.aprobadoPorPmo = true;
        cronograma.fechaAprobacionPmo = new Date();
      } else if (userRole === Role.PATROCINADOR) {
        if (cronograma.aprobadoPorPatrocinador) {
          throw new BadRequestException('El Patrocinador ya ha aprobado este cronograma');
        }
        cronograma.aprobadoPorPatrocinador = true;
        cronograma.fechaAprobacionPatrocinador = new Date();
      }

      // Verificar si ambos han aprobado para cambiar estado a APROBADO
      const aprobacionCompleta = cronograma.aprobadoPorPmo && cronograma.aprobadoPorPatrocinador;

      if (aprobacionCompleta) {
        cronograma.estado = CronogramaEstado.APROBADO;
      }

      // Notificar al SCRUM_MASTER individualmente sobre esta aprobación
      await this.notificarAprobacionIndividual(
        cronograma,
        rolAprobador,
        true, // aprobado
        aprobacionCompleta,
        dto.comentario, // observación/comentario del aprobador
      );
    } else {
      // Rechazar: volver a estado BORRADOR y resetear aprobaciones
      const rolRechazador = userRole === Role.PMO || userRole === Role.ADMIN ? 'PMO' : 'Patrocinador';

      cronograma.estado = CronogramaEstado.BORRADOR;
      cronograma.aprobadoPorPmo = false;
      cronograma.aprobadoPorPatrocinador = false;
      cronograma.fechaAprobacionPmo = null;
      cronograma.fechaAprobacionPatrocinador = null;
      cronograma.comentarioRechazo = dto.comentario || null;

      // Notificar al SCRUM_MASTER individualmente sobre el rechazo
      await this.notificarAprobacionIndividual(
        cronograma,
        rolRechazador,
        false, // rechazado
        false, // no aplica para rechazos
        dto.comentario,
      );
    }

    return this.cronogramaRepository.save(cronograma);
  }

  /**
   * Enviar cronograma a revisión (cambiar de Borrador a En revisión)
   * Envía notificaciones a PMO y PATROCINADOR para que validen
   */
  async enviarARevision(id: number, userId: number): Promise<Cronograma> {
    const cronograma = await this.findOneInternal(id);

    if (cronograma.estado !== CronogramaEstado.BORRADOR) {
      throw new BadRequestException(
        `Solo se pueden enviar a revisión cronogramas en estado Borrador. Estado actual: ${cronograma.estado}`,
      );
    }

    // Cambiar estado y resetear aprobaciones previas
    cronograma.estado = CronogramaEstado.EN_REVISION;
    cronograma.aprobadoPorPmo = false;
    cronograma.aprobadoPorPatrocinador = false;
    cronograma.fechaAprobacionPmo = null;
    cronograma.fechaAprobacionPatrocinador = null;
    cronograma.comentarioRechazo = null;
    cronograma.updatedBy = userId;

    const saved = await this.cronogramaRepository.save(cronograma);

    // Enviar notificaciones a PMO y PATROCINADOR
    try {
      const { pmoUsers, patrocinadorUsers } = await this.getAprobadores();

      const notificationData = {
        titulo: `Cronograma pendiente de aprobación: ${cronograma.nombre}`,
        descripcion: `El cronograma del proyecto "${cronograma.proyecto?.nombre || 'Sin nombre'}" requiere su revisión y aprobación.`,
        entidadTipo: 'Cronograma',
        entidadId: cronograma.id,
        proyectoId: cronograma.proyectoId,
        urlAccion: `/poi/proyecto/detalles?id=${cronograma.proyectoId}&tab=Cronograma`,
      };

      // Notificar a todos los PMO (tipo VALIDACIONES porque deben validar)
      for (const pmoUser of pmoUsers) {
        await this.notificacionService.notificar(
          TipoNotificacion.VALIDACIONES,
          pmoUser.id,
          notificationData,
        );
      }

      // Notificar a todos los PATROCINADOR (tipo VALIDACIONES porque deben validar)
      for (const patrocinadorUser of patrocinadorUsers) {
        await this.notificacionService.notificar(
          TipoNotificacion.VALIDACIONES,
          patrocinadorUser.id,
          notificationData,
        );
      }
    } catch (error) {
      console.error('Error sending review notifications:', error);
      // No lanzar error, la notificación no es crítica
    }

    return saved;
  }

  /**
   * Notifica al SCRUM_MASTER/COORDINADOR sobre aprobación o rechazo individual
   * Se llama cada vez que PMO o PATROCINADOR aprueba/rechaza
   */
  private async notificarAprobacionIndividual(
    cronograma: Cronograma,
    rolAprobador: string,
    aprobado: boolean,
    aprobacionCompleta: boolean,
    comentario?: string,
  ): Promise<void> {
    let titulo: string;
    let descripcion: string;

    if (aprobado) {
      if (aprobacionCompleta) {
        titulo = `Cronograma aprobado completamente: ${cronograma.nombre}`;
        descripcion = `El Cronograma ha sido aprobado por PMO y Patrocinador.`;
      } else {
        titulo = `Cronograma aprobado por ${rolAprobador}: ${cronograma.nombre}`;
        const pendiente = rolAprobador === 'PMO' ? 'Patrocinador' : 'PMO';
        descripcion = `El ${rolAprobador} ha aprobado el cronograma. Pendiente aprobación de ${pendiente}.`;
      }
    } else {
      titulo = `Cronograma rechazado por ${rolAprobador}: ${cronograma.nombre}`;
      descripcion = comentario || `El ${rolAprobador} ha rechazado el cronograma. Requiere correcciones.`;
    }

    const notificationData = {
      titulo,
      descripcion,
      entidadTipo: 'Cronograma',
      entidadId: cronograma.id,
      proyectoId: cronograma.proyectoId,
      urlAccion: `/poi/proyecto/detalles?id=${cronograma.proyectoId}&tab=Cronograma`,
      observacion: comentario, // Observación/comentario del aprobador
    };

    // Recopilar destinatarios únicos (SCRUM_MASTER y COORDINADOR)
    const destinatarios = new Set<number>();
    if (cronograma.proyecto?.scrumMasterId) {
      destinatarios.add(cronograma.proyecto.scrumMasterId);
    }
    if (cronograma.proyecto?.coordinadorId) {
      destinatarios.add(cronograma.proyecto.coordinadorId);
    }

    // Enviar notificación a cada destinatario
    // Usar APROBACIONES para que aparezca en la sección de Aprobaciones del SCRUM_MASTER
    for (const destinatarioId of destinatarios) {
      try {
        await this.notificacionService.notificar(
          TipoNotificacion.APROBACIONES,
          destinatarioId,
          notificationData,
        );
      } catch (error) {
        console.error('Error sending individual approval notification:', error);
      }
    }
  }
}
