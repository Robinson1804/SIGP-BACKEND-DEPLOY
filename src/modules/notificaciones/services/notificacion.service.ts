import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { TipoNotificacion } from '../enums/tipo-notificacion.enum';
import { ConteoResponseDto } from '../dto/conteo-response.dto';
import { NotificacionesGateway } from '../gateways/notificaciones.gateway';

interface FindAllFilters {
  leida?: boolean;
  tipo?: TipoNotificacion;
  page?: number;
  limit?: number;
}

interface NotificarData {
  titulo: string;
  descripcion: string;
  entidadTipo?: string;
  entidadId?: number;
  proyectoId?: number;
  urlAccion?: string;
  observacion?: string; // Observación/comentario de PMO o PATROCINADOR
}

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @Inject(forwardRef(() => NotificacionesGateway))
    private readonly gateway: NotificacionesGateway,
  ) {}

  async findAll(
    usuarioId: number,
    filters: FindAllFilters = {},
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { leida, tipo, page = 1, limit = 20 } = filters;

    const queryBuilder = this.notificacionRepository
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.proyecto', 'proyecto')
      .where('n.destinatarioId = :usuarioId', { usuarioId });

    if (leida !== undefined) {
      queryBuilder.andWhere('n.leida = :leida', { leida });
    }

    if (tipo) {
      queryBuilder.andWhere('n.tipo = :tipo', { tipo });
    }

    queryBuilder
      .orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [notificaciones, total] = await queryBuilder.getManyAndCount();

    // Enriquecer notificaciones con datos actuales del proyecto
    const data = notificaciones.map((n) => {
      const result: any = { ...n };
      // Si hay proyecto asociado, agregar nombre y código actual
      if (n.proyecto) {
        result.entidadNombre = n.proyecto.nombre;
        result.proyectoCodigo = n.proyecto.codigo;
        result.proyectoNombre = n.proyecto.nombre;
      }
      // Limpiar el objeto proyecto para no enviar datos innecesarios
      delete result.proyecto;
      return result;
    });

    return { data, total, page, limit };
  }

  async findOne(id: number, usuarioId: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id, destinatarioId: usuarioId },
    });

    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notificacion;
  }

  async getConteo(usuarioId: number): Promise<ConteoResponseDto> {
    const notificaciones = await this.notificacionRepository.find({
      where: { destinatarioId: usuarioId, leida: false },
      select: ['tipo'],
    });

    const porTipo = {
      Proyectos: 0,
      Sprints: 0,
      Retrasos: 0,
      Validaciones: 0,
      Aprobaciones: 0,
      Tareas: 0,
      Documentos: 0,
      Sistema: 0,
    };

    notificaciones.forEach((n) => {
      if (porTipo[n.tipo] !== undefined) {
        porTipo[n.tipo]++;
      }
    });

    return {
      total: notificaciones.length,
      porTipo,
    };
  }

  async marcarLeida(id: number, usuarioId: number): Promise<Notificacion> {
    const notificacion = await this.findOne(id, usuarioId);

    if (!notificacion.leida) {
      notificacion.leida = true;
      notificacion.fechaLeida = new Date();
      await this.notificacionRepository.save(notificacion);
    }

    return notificacion;
  }

  async marcarTodasLeidas(usuarioId: number): Promise<{ actualizadas: number }> {
    const result = await this.notificacionRepository.update(
      { destinatarioId: usuarioId, leida: false },
      { leida: true, fechaLeida: new Date() },
    );

    return { actualizadas: result.affected || 0 };
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const notificacion = await this.findOne(id, usuarioId);
    await this.notificacionRepository.remove(notificacion);
  }

  /**
   * Método para crear notificaciones desde otros módulos.
   * Uso:
   * ```typescript
   * await notificacionService.notificar(
   *   TipoNotificacion.PROYECTOS,
   *   coordinadorId,
   *   {
   *     titulo: 'Nuevo proyecto asignado',
   *     descripcion: `Se te ha asignado el proyecto ${proyecto.nombre}`,
   *     entidadTipo: 'Proyecto',
   *     entidadId: proyecto.id,
   *     proyectoId: proyecto.id,
   *     urlAccion: `/proyectos/${proyecto.id}`,
   *   }
   * );
   * ```
   */
  async notificar(
    tipo: TipoNotificacion,
    destinatarioId: number,
    data: NotificarData,
  ): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      tipo,
      destinatarioId,
      titulo: data.titulo,
      descripcion: data.descripcion,
      entidadTipo: data.entidadTipo,
      entidadId: data.entidadId,
      proyectoId: data.proyectoId,
      urlAccion: data.urlAccion,
      observacion: data.observacion,
    });

    const saved = await this.notificacionRepository.save(notificacion);

    // Emitir via WebSocket si el gateway esta disponible
    if (this.gateway) {
      this.gateway.emitToUser(destinatarioId, saved);
      // Actualizar conteo
      const conteo = await this.getConteo(destinatarioId);
      this.gateway.emitCountUpdate(destinatarioId, conteo);
    }

    return saved;
  }

  /**
   * Método para enviar notificaciones a múltiples destinatarios.
   */
  async notificarMultiples(
    tipo: TipoNotificacion,
    destinatarioIds: number[],
    data: NotificarData,
  ): Promise<Notificacion[]> {
    const notificaciones = destinatarioIds.map((destinatarioId) =>
      this.notificacionRepository.create({
        tipo,
        destinatarioId,
        titulo: data.titulo,
        descripcion: data.descripcion,
        entidadTipo: data.entidadTipo,
        entidadId: data.entidadId,
        proyectoId: data.proyectoId,
        urlAccion: data.urlAccion,
      }),
    );

    const saved = await this.notificacionRepository.save(notificaciones);

    // Emitir via WebSocket a cada destinatario
    if (this.gateway) {
      for (const notificacion of saved) {
        this.gateway.emitToUser(notificacion.destinatarioId, notificacion);
        const conteo = await this.getConteo(notificacion.destinatarioId);
        this.gateway.emitCountUpdate(notificacion.destinatarioId, conteo);
      }
    }

    return saved;
  }

  /**
   * Emitir evento de tarea actualizada (para tablero Kanban)
   */
  emitTaskUpdate(proyectoId: number, event: string, data: any): void {
    if (this.gateway) {
      this.gateway.emitTaskUpdate(proyectoId, event, data);
    }
  }

  /**
   * Emitir evento de sprint actualizado
   */
  emitSprintUpdate(proyectoId: number, data: any): void {
    if (this.gateway) {
      this.gateway.emitSprintUpdate(proyectoId, data);
    }
  }
}
