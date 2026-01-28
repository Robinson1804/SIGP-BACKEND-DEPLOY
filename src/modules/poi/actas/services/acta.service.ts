import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Acta } from '../entities/acta.entity';
import { CreateActaReunionDto } from '../dto/create-acta-reunion.dto';
import { CreateActaConstitucionDto } from '../dto/create-acta-constitucion.dto';
import { CreateActaDailyDto } from '../dto/create-acta-daily.dto';
import { AprobarActaDto } from '../dto/aprobar-acta.dto';
import { ActaTipo, ActaEstado } from '../enums/acta.enum';
import { NotificacionService } from '../../../notificaciones/services/notificacion.service';
import { TipoNotificacion } from '../../../notificaciones/enums/tipo-notificacion.enum';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { Role } from '../../../../common/constants/roles.constant';

@Injectable()
export class ActaService {
  constructor(
    @InjectRepository(Acta)
    private readonly actaRepository: Repository<Acta>,
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
   * Genera un código de acta secuencial por tipo para el proyecto
   * Formatos:
   * - Constitución: ACT-CONS-# (ej: ACT-CONS-1)
   * - Reunión: ACT-REU-# (ej: ACT-REU-1, ACT-REU-2)
   * - Daily Meeting: ACT-DAI-# (ej: ACT-DAI-1, ACT-DAI-2)
   */
  private async generateActaCodigo(proyectoId: number, tipo: ActaTipo): Promise<string> {
    // Contar actas del mismo tipo en el proyecto
    const count = await this.actaRepository.count({
      where: { proyectoId, tipo },
    });

    // Prefijo según tipo
    let prefix: string;
    switch (tipo) {
      case ActaTipo.CONSTITUCION:
        prefix = 'ACT-CONS';
        break;
      case ActaTipo.DAILY_MEETING:
        prefix = 'ACT-DAI';
        break;
      case ActaTipo.REUNION:
      default:
        prefix = 'ACT-REU';
        break;
    }

    return `${prefix}-${count + 1}`;
  }

  async createReunion(createDto: CreateActaReunionDto, userId?: number): Promise<Acta> {
    // Auto-generar codigo usando el formato por tipo
    const codigo = await this.generateActaCodigo(createDto.proyectoId, ActaTipo.REUNION);

    const existing = await this.actaRepository.findOne({
      where: { proyectoId: createDto.proyectoId, codigo },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un acta con el código ${codigo} en este proyecto`,
      );
    }

    const acta = this.actaRepository.create({
      ...createDto,
      codigo,
      tipo: ActaTipo.REUNION,
      estado: ActaEstado.BORRADOR,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.actaRepository.save(acta);
  }

  async createConstitucion(createDto: CreateActaConstitucionDto, userId?: number): Promise<Acta> {
    // Verificar si ya existe un acta de constitución para este proyecto
    const existingConstitucion = await this.actaRepository.findOne({
      where: { proyectoId: createDto.proyectoId, tipo: ActaTipo.CONSTITUCION, activo: true },
    });

    if (existingConstitucion) {
      throw new ConflictException(
        `Ya existe un Acta de Constitución para este proyecto`,
      );
    }

    // Auto-generar codigo usando el formato por tipo
    const codigo = await this.generateActaCodigo(createDto.proyectoId, ActaTipo.CONSTITUCION);

    // Generar valores por defecto
    const today = new Date().toISOString().split('T')[0];

    const acta = this.actaRepository.create({
      ...createDto,
      codigo,
      nombre: createDto.nombre || 'Acta de Constitución',
      fecha: createDto.fecha || today,
      tipo: ActaTipo.CONSTITUCION,
      estado: ActaEstado.BORRADOR,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.actaRepository.save(acta);
  }

  async createDaily(createDto: CreateActaDailyDto, userId?: number): Promise<Acta> {
    // Verificar si ya existe un daily para esta fecha en el proyecto
    const existingDaily = await this.actaRepository.findOne({
      where: {
        proyectoId: createDto.proyectoId,
        tipo: ActaTipo.DAILY_MEETING,
        fecha: createDto.fecha as unknown as Date,
      },
    });

    if (existingDaily) {
      throw new ConflictException(
        `Ya existe un Acta de Daily Meeting para esta fecha en este proyecto`,
      );
    }

    // Auto-generar codigo usando el formato por tipo
    const codigo = await this.generateActaCodigo(createDto.proyectoId, ActaTipo.DAILY_MEETING);

    const acta = this.actaRepository.create({
      proyectoId: createDto.proyectoId,
      codigo,
      nombre: createDto.nombre,
      fecha: createDto.fecha,
      horaInicio: createDto.horaInicio,
      horaFin: createDto.horaFin,
      sprintId: createDto.sprintId,
      sprintNombre: createDto.sprintNombre,
      duracionMinutos: createDto.duracionMinutos,
      participantesDaily: createDto.participantesDaily,
      impedimentosGenerales: createDto.impedimentosGenerales,
      notasAdicionales: createDto.notasAdicionales,
      observaciones: createDto.observaciones,
      // El moderador es quien facilita el daily, por defecto el usuario que crea el acta
      moderadorId: createDto.moderadorId ?? userId,
      tipo: ActaTipo.DAILY_MEETING,
      estado: ActaEstado.BORRADOR,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.actaRepository.save(acta);
  }

  async updateDaily(id: number, updateDto: Partial<CreateActaDailyDto>, userId: number): Promise<Acta> {
    const acta = await this.findOne(id);

    if (acta.tipo !== ActaTipo.DAILY_MEETING) {
      throw new BadRequestException('Esta acta no es de tipo Daily Meeting');
    }

    if (acta.estado === ActaEstado.APROBADO) {
      throw new BadRequestException('No se puede editar un acta aprobada');
    }

    // Update only the provided fields
    if (updateDto.nombre !== undefined) acta.nombre = updateDto.nombre;
    if (updateDto.fecha !== undefined) acta.fecha = updateDto.fecha as unknown as Date;
    if (updateDto.horaInicio !== undefined) acta.horaInicio = updateDto.horaInicio;
    if (updateDto.horaFin !== undefined) acta.horaFin = updateDto.horaFin;
    if (updateDto.sprintId !== undefined) acta.sprintId = updateDto.sprintId;
    if (updateDto.sprintNombre !== undefined) acta.sprintNombre = updateDto.sprintNombre;
    if (updateDto.duracionMinutos !== undefined) acta.duracionMinutos = updateDto.duracionMinutos;
    if (updateDto.participantesDaily !== undefined) acta.participantesDaily = updateDto.participantesDaily;
    if (updateDto.impedimentosGenerales !== undefined) acta.impedimentosGenerales = updateDto.impedimentosGenerales;
    if (updateDto.notasAdicionales !== undefined) acta.notasAdicionales = updateDto.notasAdicionales;
    if (updateDto.observaciones !== undefined) acta.observaciones = updateDto.observaciones;
    if (updateDto.moderadorId !== undefined) acta.moderadorId = updateDto.moderadorId;

    acta.updatedBy = userId;

    return this.actaRepository.save(acta);
  }

  async updateReunion(id: number, updateDto: Partial<CreateActaReunionDto>, userId: number): Promise<Acta> {
    const acta = await this.findOne(id);

    if (acta.tipo !== ActaTipo.REUNION) {
      throw new BadRequestException('Esta acta no es de tipo Reunión');
    }

    if (acta.estado === ActaEstado.APROBADO) {
      throw new BadRequestException('No se puede editar un acta aprobada');
    }

    Object.assign(acta, updateDto);
    acta.updatedBy = userId;

    return this.actaRepository.save(acta);
  }

  async updateConstitucion(id: number, updateDto: Partial<CreateActaConstitucionDto>, userId: number): Promise<Acta> {
    const acta = await this.findOne(id);

    if (acta.tipo !== ActaTipo.CONSTITUCION) {
      throw new BadRequestException('Esta acta no es de tipo Constitución');
    }

    if (acta.estado === ActaEstado.APROBADO) {
      throw new BadRequestException('No se puede editar un acta aprobada');
    }

    Object.assign(acta, updateDto);
    acta.updatedBy = userId;

    return this.actaRepository.save(acta);
  }

  async findAll(filters?: {
    proyectoId?: number;
    tipo?: ActaTipo;
    estado?: ActaEstado;
    activo?: boolean;
  }): Promise<Acta[]> {
    const queryBuilder = this.actaRepository
      .createQueryBuilder('acta')
      .orderBy('acta.fecha', 'DESC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('acta.proyectoId = :proyectoId', { proyectoId: filters.proyectoId });
    }

    if (filters?.tipo) {
      queryBuilder.andWhere('acta.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('acta.estado = :estado', { estado: filters.estado });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('acta.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<{ constitucion: Acta | null; reuniones: Acta[]; dailies: Acta[] }> {
    const actas = await this.actaRepository.find({
      where: { proyectoId, activo: true },
      order: { fecha: 'DESC' },
    });

    const constitucion = actas.find((a) => a.tipo === ActaTipo.CONSTITUCION) || null;
    const reuniones = actas.filter((a) => a.tipo === ActaTipo.REUNION);
    const dailies = actas.filter((a) => a.tipo === ActaTipo.DAILY_MEETING);

    return { constitucion, reuniones, dailies };
  }

  async findOne(id: number): Promise<Acta> {
    const acta = await this.actaRepository.findOne({
      where: { id },
      relations: ['proyecto', 'aprobador', 'moderador'],
    });

    if (!acta) {
      throw new NotFoundException(`Acta con ID ${id} no encontrada`);
    }

    return acta;
  }

  async findOneWithProyecto(id: number): Promise<{ acta: Acta; proyecto: { codigo: string; nombre: string } }> {
    const acta = await this.actaRepository.findOne({
      where: { id },
      relations: ['proyecto'],
    });

    if (!acta) {
      throw new NotFoundException(`Acta con ID ${id} no encontrada`);
    }

    return {
      acta,
      proyecto: {
        codigo: acta.proyecto?.codigo || 'N/A',
        nombre: acta.proyecto?.nombre || 'Sin nombre',
      },
    };
  }

  async subirDocumentoFirmado(id: number, documentoUrl: string, userId: number): Promise<Acta> {
    const acta = await this.findOne(id);

    if (acta.estado === ActaEstado.APROBADO) {
      throw new BadRequestException('El acta ya está aprobada');
    }

    acta.documentoFirmadoUrl = documentoUrl;
    acta.documentoFirmadoFecha = new Date();
    acta.estado = ActaEstado.EN_REVISION;
    acta.updatedBy = userId;

    return this.actaRepository.save(acta);
  }

  /**
   * Aprobar o rechazar un acta
   * Para Acta de Constitución: Sistema de aprobación dual (PMO y PATROCINADOR)
   * Para otras actas: Aprobación simple
   * @param userRole - Rol del usuario que aprueba (PMO o PATROCINADOR para constitución)
   */
  async aprobar(id: number, aprobarDto: AprobarActaDto, userId: number, userRole?: string): Promise<Acta> {
    const acta = await this.findOne(id);

    if (acta.estado === ActaEstado.APROBADO) {
      throw new BadRequestException('El acta ya está aprobada');
    }

    // Para Acta de Constitución: aprobación dual
    if (acta.tipo === ActaTipo.CONSTITUCION) {
      return this.aprobarConstitucion(acta, aprobarDto, userId, userRole);
    }

    // Para otras actas: aprobación simple
    if (aprobarDto.aprobado) {
      acta.estado = ActaEstado.APROBADO;
      acta.aprobadoPor = userId;
      acta.fechaAprobacion = new Date();
    } else {
      acta.estado = ActaEstado.RECHAZADO;
      acta.comentarioRechazo = aprobarDto.comentario || null;
    }

    acta.updatedBy = userId;

    return this.actaRepository.save(acta);
  }

  /**
   * Aprobación dual para Acta de Constitución
   * Requiere aprobación de PMO y PATROCINADOR
   * Notifica al SCRUM_MASTER cada vez que uno de ellos aprueba o rechaza
   */
  private async aprobarConstitucion(
    acta: Acta,
    dto: AprobarActaDto,
    userId: number,
    userRole?: string,
  ): Promise<Acta> {
    // Validar que el acta esté en estado En revisión
    if (acta.estado !== ActaEstado.EN_REVISION) {
      throw new BadRequestException(
        `Solo se pueden aprobar actas en estado "En revisión". Estado actual: ${acta.estado}`,
      );
    }

    // Si se rechaza, el comentario es obligatorio
    if (!dto.aprobado && !dto.comentario?.trim()) {
      throw new BadRequestException(
        'Debe proporcionar un comentario para rechazar el acta',
      );
    }

    acta.updatedBy = userId;

    // Determinar quién está aprobando/rechazando
    const rolAprobador = userRole === Role.PMO || userRole === Role.ADMIN ? 'PMO' : 'Patrocinador';

    if (dto.aprobado) {
      // Registrar aprobación según el rol
      if (userRole === Role.PMO || userRole === Role.ADMIN) {
        if (acta.aprobadoPorPmo) {
          throw new BadRequestException('El PMO ya ha aprobado esta acta');
        }
        acta.aprobadoPorPmo = true;
        acta.fechaAprobacionPmo = new Date();
      } else if (userRole === Role.PATROCINADOR) {
        if (acta.aprobadoPorPatrocinador) {
          throw new BadRequestException('El Patrocinador ya ha aprobado esta acta');
        }
        acta.aprobadoPorPatrocinador = true;
        acta.fechaAprobacionPatrocinador = new Date();
      }

      // Verificar si ambos han aprobado para cambiar estado a APROBADO
      if (acta.aprobadoPorPmo && acta.aprobadoPorPatrocinador) {
        acta.estado = ActaEstado.APROBADO;
        acta.aprobadoPor = userId;
        acta.fechaAprobacion = new Date();

        // Notificar al SCRUM_MASTER que el acta fue aprobada completamente
        await this.notificarAprobacionIndividual(acta, rolAprobador, true, true, dto.comentario);
      } else {
        // Notificar al SCRUM_MASTER que uno aprobó (pendiente el otro)
        await this.notificarAprobacionIndividual(acta, rolAprobador, true, false, dto.comentario);
      }
    } else {
      // Rechazar: volver a estado BORRADOR y resetear aprobaciones
      acta.estado = ActaEstado.BORRADOR;
      acta.aprobadoPorPmo = false;
      acta.aprobadoPorPatrocinador = false;
      acta.fechaAprobacionPmo = null;
      acta.fechaAprobacionPatrocinador = null;
      acta.comentarioRechazo = dto.comentario || null;

      // Notificar al SCRUM_MASTER que fue rechazada por PMO o PATROCINADOR
      await this.notificarAprobacionIndividual(acta, rolAprobador, false, false, dto.comentario);
    }

    return this.actaRepository.save(acta);
  }

  /**
   * Notifica al SCRUM_MASTER cuando PMO o PATROCINADOR aprueba/rechaza individualmente
   */
  private async notificarAprobacionIndividual(
    acta: Acta,
    rolAprobador: string,
    aprobado: boolean,
    aprobacionCompleta: boolean,
    comentario?: string,
  ): Promise<void> {
    try {
      let titulo: string;
      let descripcion: string;

      if (aprobado) {
        if (aprobacionCompleta) {
          titulo = `Acta de Constitución aprobada completamente`;
          descripcion = `El Acta de Constitución ha sido aprobada por PMO y Patrocinador. El proyecto puede continuar.`;
        } else {
          titulo = `Acta de Constitución aprobada por ${rolAprobador}`;
          const pendiente = rolAprobador === 'PMO' ? 'Patrocinador' : 'PMO';
          descripcion = `El ${rolAprobador} ha aprobado el Acta de Constitución. Pendiente aprobación de ${pendiente}.`;
        }
      } else {
        titulo = `Acta de Constitución rechazada por ${rolAprobador}`;
        descripcion = comentario || `El ${rolAprobador} ha rechazado el Acta de Constitución. Requiere correcciones.`;
      }

      const notificationData = {
        titulo,
        descripcion,
        entidadTipo: 'ActaConstitucion',
        entidadId: acta.id,
        proyectoId: acta.proyectoId,
        urlAccion: `/poi/proyecto/detalles?id=${acta.proyectoId}&tab=Actas`,
        observacion: comentario, // Observación/comentario del aprobador
      };

      // Recopilar destinatarios únicos (SCRUM_MASTER y COORDINADOR del proyecto)
      const destinatarios = new Set<number>();

      console.log('=== DEBUG notificarAprobacionIndividual ===');
      console.log('acta.id:', acta.id);
      console.log('acta.proyectoId:', acta.proyectoId);
      console.log('acta.proyecto:', acta.proyecto ? 'existe' : 'NO existe');
      console.log('acta.proyecto?.scrumMasterId:', acta.proyecto?.scrumMasterId);
      console.log('acta.proyecto?.coordinadorId:', acta.proyecto?.coordinadorId);

      if (acta.proyecto?.scrumMasterId) {
        destinatarios.add(acta.proyecto.scrumMasterId);
      }
      if (acta.proyecto?.coordinadorId) {
        destinatarios.add(acta.proyecto.coordinadorId);
      }

      console.log('destinatarios:', Array.from(destinatarios));

      // Enviar notificación a cada destinatario (APROBACIONES para que aparezca en esa sección)
      for (const destinatarioId of destinatarios) {
        console.log('Enviando notificacion a usuario:', destinatarioId);
        await this.notificacionService.notificar(
          TipoNotificacion.APROBACIONES,
          destinatarioId,
          notificationData,
        );
        console.log('Notificacion enviada exitosamente a:', destinatarioId);
      }
    } catch (error) {
      console.error('Error sending individual approval notification:', error);
    }
  }

  /**
   * Enviar Acta de Constitución a revisión (cambiar de Borrador a En revisión)
   * Envía notificaciones a PMO y PATROCINADOR para que validen
   */
  async enviarARevision(id: number, userId: number): Promise<Acta> {
    const acta = await this.findOne(id);

    if (acta.tipo !== ActaTipo.CONSTITUCION) {
      throw new BadRequestException(
        'Solo las Actas de Constitución requieren aprobación dual',
      );
    }

    if (acta.estado !== ActaEstado.BORRADOR) {
      throw new BadRequestException(
        `Solo se pueden enviar a revisión actas en estado Borrador. Estado actual: ${acta.estado}`,
      );
    }

    // Cambiar estado y resetear aprobaciones previas
    acta.estado = ActaEstado.EN_REVISION;
    acta.aprobadoPorPmo = false;
    acta.aprobadoPorPatrocinador = false;
    acta.fechaAprobacionPmo = null;
    acta.fechaAprobacionPatrocinador = null;
    acta.comentarioRechazo = null;
    acta.updatedBy = userId;

    const saved = await this.actaRepository.save(acta);

    // Enviar notificaciones a PMO y PATROCINADOR
    try {
      const { pmoUsers, patrocinadorUsers } = await this.getAprobadores();

      const notificationData = {
        titulo: `Acta de Constitución pendiente de aprobación`,
        descripcion: `El Acta de Constitución del proyecto "${acta.proyecto?.nombre || 'Sin nombre'}" requiere su revisión y aprobación.`,
        entidadTipo: 'ActaConstitucion',
        entidadId: acta.id,
        proyectoId: acta.proyectoId,
        urlAccion: `/poi/proyecto/detalles?id=${acta.proyectoId}&tab=Actas`,
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
      console.error('Error sending review notifications for Acta:', error);
      // No lanzar error, la notificación no es crítica
    }

    return saved;
  }

  /**
   * Notifica al SCRUM_MASTER sobre el resultado de la aprobación del Acta
   */
  private async notificarResultadoAprobacion(
    acta: Acta,
    aprobado: boolean,
    comentario?: string,
  ): Promise<void> {
    try {
      const notificationData = {
        titulo: aprobado
          ? `Acta de Constitución aprobada`
          : `Acta de Constitución rechazada`,
        descripcion: aprobado
          ? 'El Acta de Constitución ha sido aprobada por PMO y Patrocinador.'
          : comentario || 'El Acta de Constitución ha sido rechazada y requiere correcciones.',
        entidadTipo: 'ActaConstitucion',
        entidadId: acta.id,
        proyectoId: acta.proyectoId,
        urlAccion: `/poi/proyecto/detalles?id=${acta.proyectoId}&tab=Actas`,
      };

      // Recopilar destinatarios únicos (SCRUM_MASTER y COORDINADOR)
      const destinatarios = new Set<number>();
      if (acta.proyecto?.scrumMasterId) {
        destinatarios.add(acta.proyecto.scrumMasterId);
      }
      if (acta.proyecto?.coordinadorId) {
        destinatarios.add(acta.proyecto.coordinadorId);
      }

      // Enviar notificación a cada destinatario (tipo VALIDACIONES para que aparezca en esa sección)
      for (const destinatarioId of destinatarios) {
        await this.notificacionService.notificar(
          TipoNotificacion.VALIDACIONES,
          destinatarioId,
          notificationData,
        );
      }
    } catch (error) {
      console.error('Error sending approval result notification:', error);
    }
  }

  async remove(id: number, userId?: number): Promise<Acta> {
    const acta = await this.findOne(id);
    acta.activo = false;
    acta.updatedBy = userId;
    return this.actaRepository.save(acta);
  }
}
