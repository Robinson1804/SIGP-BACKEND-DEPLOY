import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Sprint } from '../entities/sprint.entity';
import { HistoriaUsuario } from '../../historias-usuario/entities/historia-usuario.entity';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { CerrarSprintDto } from '../dto/cerrar-sprint.dto';
import { SprintEstado } from '../enums/sprint.enum';
import { HuEstado } from '../../historias-usuario/enums/historia-usuario.enum';
import {
  BurndownResponseDto,
  SprintMetricasResponseDto,
  VelocidadProyectoResponseDto,
} from '../dto/sprint-response.dto';
import { HistorialCambioService } from '../../common/services/historial-cambio.service';
import { HistorialEntidadTipo, HistorialAccion } from '../../common/enums/historial-cambio.enum';
import { NotificacionService } from '../../../notificaciones/services/notificacion.service';
import { TipoNotificacion } from '../../../notificaciones/enums/tipo-notificacion.enum';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectRepository(HistoriaUsuario)
    private readonly huRepository: Repository<HistoriaUsuario>,
    private readonly historialCambioService: HistorialCambioService,
    @Inject(forwardRef(() => NotificacionService))
    private readonly notificacionService: NotificacionService,
  ) {}

  async create(createDto: CreateSprintDto, userId?: number): Promise<Sprint> {
    // Map frontend field names to entity field names
    const sprint = this.sprintRepository.create({
      proyectoId: createDto.proyectoId,
      nombre: createDto.nombre,
      sprintGoal: createDto.objetivo || createDto.sprintGoal,
      fechaInicio: createDto.fechaInicio,
      fechaFin: createDto.fechaFin,
      capacidadEquipo: createDto.velocidadPlanificada || createDto.capacidadEquipo,
      estado: createDto.estado || SprintEstado.POR_HACER,
      createdBy: userId,
      updatedBy: userId,
    });

    const sprintGuardado = await this.sprintRepository.save(sprint);

    // Registrar creacion en historial
    if (userId) {
      await this.historialCambioService.registrarCreacion(
        HistorialEntidadTipo.SPRINT,
        sprintGuardado.id,
        userId,
        { nombre: sprintGuardado.nombre },
      );
    }

    return sprintGuardado;
  }

  async findAll(filters?: {
    proyectoId?: number;
    estado?: SprintEstado;
    activo?: boolean;
  }): Promise<Sprint[]> {
    const queryBuilder = this.sprintRepository
      .createQueryBuilder('sprint')
      .orderBy('sprint.fechaInicio', 'DESC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('sprint.proyectoId = :proyectoId', {
        proyectoId: filters.proyectoId,
      });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('sprint.estado = :estado', { estado: filters.estado });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('sprint.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<Sprint[]> {
    return this.sprintRepository.find({
      where: { proyectoId, activo: true },
      order: { fechaInicio: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Sprint> {
    const sprint = await this.sprintRepository.findOne({
      where: { id },
      relations: ['proyecto'],
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint con ID ${id} no encontrado`);
    }

    return sprint;
  }

  async update(id: number, updateDto: UpdateSprintDto, userId?: number): Promise<Sprint> {
    const sprint = await this.findOne(id);

    if (sprint.estado === SprintEstado.FINALIZADO) {
      throw new BadRequestException('No se puede modificar un sprint completado');
    }

    // Clonar valores anteriores para comparacion
    const valoresAnteriores = {
      nombre: sprint.nombre,
      sprintGoal: sprint.sprintGoal,
      fechaInicio: sprint.fechaInicio,
      fechaFin: sprint.fechaFin,
    };

    Object.assign(sprint, updateDto, { updatedBy: userId });

    const sprintActualizado = await this.sprintRepository.save(sprint);

    // Registrar cambios en historial
    if (userId) {
      await this.historialCambioService.registrarCambiosMultiples(
        HistorialEntidadTipo.SPRINT,
        id,
        valoresAnteriores,
        updateDto,
        userId,
      );
    }

    return sprintActualizado;
  }

  async iniciar(id: number, userId?: number): Promise<Sprint> {
    const sprint = await this.findOne(id);
    const estadoAnterior = sprint.estado;

    if (sprint.estado !== SprintEstado.POR_HACER) {
      throw new BadRequestException('Solo se puede iniciar un sprint en estado "Por hacer"');
    }

    // Check if there's already an active sprint for this project
    const activeSprint = await this.sprintRepository.findOne({
      where: {
        proyectoId: sprint.proyectoId,
        estado: SprintEstado.EN_PROGRESO,
        activo: true,
      },
    });

    if (activeSprint) {
      throw new ConflictException(
        `Ya existe un sprint activo (${activeSprint.nombre}) para este proyecto`,
      );
    }

    sprint.estado = SprintEstado.EN_PROGRESO;
    sprint.fechaInicioReal = new Date();
    sprint.updatedBy = userId;

    const sprintIniciado = await this.sprintRepository.save(sprint);

    // Registrar inicio en historial
    if (userId) {
      await this.historialCambioService.registrarCambio({
        entidadTipo: HistorialEntidadTipo.SPRINT,
        entidadId: id,
        accion: HistorialAccion.INICIO,
        campoModificado: 'estado',
        valorAnterior: estadoAnterior,
        valorNuevo: SprintEstado.EN_PROGRESO,
        usuarioId: userId,
      });
    }

    // Notificar al equipo sobre el inicio del sprint
    await this.notificarEquipoSprint(sprint, 'iniciado');

    // Emitir evento WebSocket para actualizar dashboards
    this.notificacionService.emitSprintUpdate(sprint.proyectoId, {
      event: 'sprint_started',
      sprintId: sprint.id,
      nombre: sprint.nombre,
    });

    return sprintIniciado;
  }

  async cerrar(id: number, cerrarDto: CerrarSprintDto, userId?: number): Promise<Sprint> {
    const sprint = await this.findOne(id);
    const estadoAnterior = sprint.estado;

    if (sprint.estado !== SprintEstado.EN_PROGRESO) {
      throw new BadRequestException('Solo se puede cerrar un sprint "En progreso"');
    }

    // Manejar HUs no completadas
    const husNoCompletadas = await this.huRepository.find({
      where: {
        sprintId: id,
        activo: true,
        estado: Not(HuEstado.FINALIZADO),
      },
    });

    if (husNoCompletadas.length > 0 && cerrarDto.accionHUsPendientes) {
      if (cerrarDto.accionHUsPendientes === 'mover_siguiente') {
        // Buscar próximo sprint planificado
        const siguienteSprint = await this.sprintRepository.findOne({
          where: {
            proyectoId: sprint.proyectoId,
            estado: SprintEstado.POR_HACER,
            activo: true,
          },
          order: { fechaInicio: 'ASC' },
        });

        if (siguienteSprint) {
          // Mover HUs al siguiente sprint
          await this.huRepository.update(
            { id: In(husNoCompletadas.map((hu) => hu.id)) },
            { sprintId: siguienteSprint.id, updatedBy: userId },
          );
        } else {
          // Si no hay siguiente sprint, devolver al backlog
          await this.huRepository.update(
            { id: In(husNoCompletadas.map((hu) => hu.id)) },
            { sprintId: null, updatedBy: userId },
          );
        }
      } else if (cerrarDto.accionHUsPendientes === 'devolver_backlog') {
        // Devolver al backlog (sprintId = null)
        await this.huRepository.update(
          { id: In(husNoCompletadas.map((hu) => hu.id)) },
          { sprintId: null, updatedBy: userId },
        );
      }
    }

    sprint.estado = SprintEstado.FINALIZADO;
    sprint.fechaFinReal = new Date();
    sprint.updatedBy = userId;

    if (cerrarDto.linkEvidencia) {
      sprint.linkEvidencia = cerrarDto.linkEvidencia;
    }

    const sprintCerrado = await this.sprintRepository.save(sprint);

    // Registrar cierre en historial
    if (userId) {
      await this.historialCambioService.registrarCambio({
        entidadTipo: HistorialEntidadTipo.SPRINT,
        entidadId: id,
        accion: HistorialAccion.CIERRE,
        campoModificado: 'estado',
        valorAnterior: estadoAnterior,
        valorNuevo: SprintEstado.FINALIZADO,
        usuarioId: userId,
      });
    }

    // Notificar al equipo sobre el cierre del sprint
    await this.notificarEquipoSprint(sprint, 'cerrado');

    // Emitir evento WebSocket para actualizar dashboards
    this.notificacionService.emitSprintUpdate(sprint.proyectoId, {
      event: 'sprint_closed',
      sprintId: sprint.id,
      nombre: sprint.nombre,
    });

    // Verificar si todos los sprints del proyecto están finalizados
    await this.verificarSprintsCompletados(sprint.proyectoId);

    return sprintCerrado;
  }

  /**
   * Notifica al equipo del proyecto sobre eventos del sprint
   */
  private async notificarEquipoSprint(
    sprint: Sprint,
    evento: 'iniciado' | 'cerrado',
  ): Promise<void> {
    const proyecto = sprint.proyecto;
    if (!proyecto) return;

    const destinatarios: number[] = [];
    if (proyecto.coordinadorId) destinatarios.push(proyecto.coordinadorId);
    if (proyecto.scrumMasterId && proyecto.scrumMasterId !== proyecto.coordinadorId) {
      destinatarios.push(proyecto.scrumMasterId);
    }

    if (destinatarios.length === 0) return;

    const titulo = evento === 'iniciado'
      ? `Sprint iniciado: ${sprint.nombre}`
      : `Sprint cerrado: ${sprint.nombre}`;
    const descripcion = evento === 'iniciado'
      ? `El sprint "${sprint.nombre}" del proyecto ${proyecto.nombre} ha iniciado.`
      : `El sprint "${sprint.nombre}" del proyecto ${proyecto.nombre} ha sido cerrado.`;

    await this.notificacionService.notificarMultiples(
      TipoNotificacion.SPRINTS,
      destinatarios,
      {
        titulo,
        descripcion,
        entidadTipo: 'Sprint',
        entidadId: sprint.id,
        proyectoId: proyecto.id,
        urlAccion: `/poi/proyectos/${proyecto.id}/sprints/${sprint.id}`,
      },
    );
  }

  /**
   * Verifica si todos los sprints del proyecto están finalizados
   * y envía una notificación al equipo preguntando si desea finalizar el proyecto
   */
  private async verificarSprintsCompletados(proyectoId: number): Promise<void> {
    // Contar sprints no finalizados (Por hacer o En progreso)
    const sprintsNoFinalizados = await this.sprintRepository.count({
      where: {
        proyectoId,
        estado: In([SprintEstado.POR_HACER, SprintEstado.EN_PROGRESO]),
        activo: true,
      },
    });

    // Si hay sprints pendientes, no hacer nada
    if (sprintsNoFinalizados > 0) {
      return;
    }

    // Contar total de sprints finalizados para confirmar que hay al menos uno
    const sprintsFinalizados = await this.sprintRepository.count({
      where: {
        proyectoId,
        estado: SprintEstado.FINALIZADO,
        activo: true,
      },
    });

    // Si no hay sprints finalizados, no tiene sentido notificar
    if (sprintsFinalizados === 0) {
      return;
    }

    // Obtener el proyecto para la notificación
    const proyecto = await this.sprintRepository.manager
      .createQueryBuilder()
      .select(['p.id', 'p.codigo', 'p.nombre', 'p.coordinador_id', 'p.scrum_master_id', 'p.estado'])
      .from('poi.proyectos', 'p')
      .where('p.id = :proyectoId', { proyectoId })
      .getRawOne();

    if (!proyecto || proyecto.p_estado === 'Finalizado') {
      return; // El proyecto ya está finalizado
    }

    // Notificar al Coordinador y Scrum Master
    const destinatarios: number[] = [];
    if (proyecto.p_coordinador_id) destinatarios.push(proyecto.p_coordinador_id);
    if (proyecto.p_scrum_master_id && proyecto.p_scrum_master_id !== proyecto.p_coordinador_id) {
      destinatarios.push(proyecto.p_scrum_master_id);
    }

    if (destinatarios.length === 0) {
      return;
    }

    await this.notificacionService.notificarMultiples(
      TipoNotificacion.PROYECTOS,
      destinatarios,
      {
        titulo: `¿Finalizar proyecto ${proyecto.p_codigo}?`,
        descripcion: `Todos los sprints del proyecto "${proyecto.p_nombre}" han sido completados. ¿Desea marcar el proyecto como Finalizado?`,
        entidadTipo: 'Proyecto',
        entidadId: proyectoId,
        proyectoId: proyectoId,
        urlAccion: `/poi/proyectos/${proyectoId}`,
      },
    );
  }

  async remove(id: number, userId?: number): Promise<void> {
    const sprint = await this.findOne(id);

    if (sprint.estado === SprintEstado.EN_PROGRESO) {
      throw new BadRequestException('No se puede eliminar un sprint "En progreso"');
    }

    // Desvincular las historias de usuario del sprint antes de eliminar
    await this.huRepository.update(
      { sprintId: id },
      { sprintId: null },
    );

    // Registrar eliminacion en historial antes de borrar
    if (userId) {
      await this.historialCambioService.registrarEliminacion(
        HistorialEntidadTipo.SPRINT,
        id,
        userId,
      );
    }

    // Eliminar definitivamente de la base de datos
    await this.sprintRepository.remove(sprint);
  }

  async getBurndown(id: number): Promise<BurndownResponseDto> {
    const sprint = await this.findOne(id);

    // Get total story points for HUs in this sprint
    const spResult = await this.sprintRepository.manager
      .createQueryBuilder()
      .select('COALESCE(SUM(hu.story_points), 0)', 'totalSP')
      .from('agile.historias_usuario', 'hu')
      .where('hu.sprint_id = :sprintId', { sprintId: id })
      .andWhere('hu.activo = true')
      .getRawOne();

    const totalStoryPoints = parseInt(spResult?.totalSP || '0', 10);

    // Calculate days
    const fechaInicio = sprint.fechaInicio ? new Date(sprint.fechaInicio) : new Date();
    const fechaFin = sprint.fechaFin ? new Date(sprint.fechaFin) : new Date();
    const diasTotales = Math.ceil(
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
    );

    const dias: { fecha: string; spRestantes: number; spIdeal: number }[] = [];
    const spPorDia = totalStoryPoints / diasTotales;

    for (let i = 0; i <= diasTotales; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);

      // For now, calculate ideal line; real data would come from daily snapshots
      const spIdeal = Math.max(0, totalStoryPoints - spPorDia * i);

      dias.push({
        fecha: fecha.toISOString().split('T')[0],
        spRestantes: totalStoryPoints, // Would be calculated from actual data
        spIdeal: Math.round(spIdeal * 100) / 100,
      });
    }

    return {
      sprintId: id,
      totalStoryPoints,
      dias,
    };
  }

  async getMetricas(id: number): Promise<SprintMetricasResponseDto> {
    const sprint = await this.findOne(id);

    // Calculate days
    const fechaInicio = sprint.fechaInicio ? new Date(sprint.fechaInicio) : new Date();
    const fechaFin = sprint.fechaFin ? new Date(sprint.fechaFin) : new Date();
    const hoy = new Date();

    const diasTotales = Math.ceil(
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
    );
    const diasTranscurridos = Math.max(
      0,
      Math.ceil((hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const diasRestantes = Math.max(0, diasTotales - diasTranscurridos);

    // Get HU statistics
    const stats = await this.sprintRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'totalHUs')
      .addSelect("SUM(CASE WHEN hu.estado = 'Finalizado' THEN 1 ELSE 0 END)", 'husCompletadas')
      .addSelect(
        "SUM(CASE WHEN hu.estado = 'En progreso' THEN 1 ELSE 0 END)",
        'husEnProgreso',
      )
      .addSelect(
        "SUM(CASE WHEN hu.estado = 'Por hacer' THEN 1 ELSE 0 END)",
        'husPendientes',
      )
      .addSelect('COALESCE(SUM(hu.story_points), 0)', 'totalSP')
      .addSelect(
        "COALESCE(SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.story_points ELSE 0 END), 0)",
        'spCompletados',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN hu.estado = 'En progreso' THEN hu.story_points ELSE 0 END), 0)",
        'spEnProgreso',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN hu.estado = 'Por hacer' THEN hu.story_points ELSE 0 END), 0)",
        'spPendientes',
      )
      .from('agile.historias_usuario', 'hu')
      .where('hu.sprint_id = :sprintId', { sprintId: id })
      .andWhere('hu.activo = true')
      .getRawOne();

    const totalHUs = parseInt(stats?.totalHUs || '0', 10);
    const husCompletadas = parseInt(stats?.husCompletadas || '0', 10);
    const husEnProgreso = parseInt(stats?.husEnProgreso || '0', 10);
    const husPendientes = parseInt(stats?.husPendientes || '0', 10);
    const totalStoryPoints = parseInt(stats?.totalSP || '0', 10);
    const storyPointsCompletados = parseInt(stats?.spCompletados || '0', 10);
    const storyPointsEnProgreso = parseInt(stats?.spEnProgreso || '0', 10);
    const storyPointsPendientes = parseInt(stats?.spPendientes || '0', 10);

    const velocidad = storyPointsCompletados;
    const porcentajeAvanceHUs = totalHUs > 0 ? (husCompletadas / totalHUs) * 100 : 0;
    const porcentajeAvanceSP =
      totalStoryPoints > 0 ? (storyPointsCompletados / totalStoryPoints) * 100 : 0;

    return {
      sprintId: id,
      nombre: sprint.nombre,
      diasTotales,
      diasTranscurridos,
      diasRestantes,
      totalHUs,
      husCompletadas,
      husEnProgreso,
      husPendientes,
      totalStoryPoints,
      storyPointsCompletados,
      storyPointsEnProgreso,
      storyPointsPendientes,
      velocidad,
      porcentajeAvanceHUs: Math.round(porcentajeAvanceHUs * 100) / 100,
      porcentajeAvanceSP: Math.round(porcentajeAvanceSP * 100) / 100,
    };
  }

  async getVelocidadProyecto(proyectoId: number): Promise<VelocidadProyectoResponseDto> {
    // Obtener sprints completados del proyecto ordenados por fecha de fin
    const sprintsCompletados = await this.sprintRepository.find({
      where: {
        proyectoId,
        estado: SprintEstado.FINALIZADO,
        activo: true,
      },
      order: { fechaFinReal: 'DESC' },
      take: 10, // Últimos 10 sprints para análisis
    });

    if (sprintsCompletados.length === 0) {
      return {
        proyectoId,
        velocidadPromedio: 0,
        velocidadUltimoSprint: 0,
        sprintsAnalizados: 0,
        historial: [],
      };
    }

    // Calcular story points completados por cada sprint
    const historial: {
      sprintId: number;
      nombre: string;
      storyPointsCompletados: number;
      fechaFin: Date;
    }[] = [];

    for (const sprint of sprintsCompletados) {
      const stats = await this.sprintRepository.manager
        .createQueryBuilder()
        .select("COALESCE(SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.story_points ELSE 0 END), 0)", 'spCompletados')
        .from('agile.historias_usuario', 'hu')
        .where('hu.sprint_id = :sprintId', { sprintId: sprint.id })
        .andWhere('hu.activo = true')
        .getRawOne();

      historial.push({
        sprintId: sprint.id,
        nombre: sprint.nombre,
        storyPointsCompletados: parseInt(stats?.spCompletados || '0', 10),
        fechaFin: sprint.fechaFinReal || sprint.fechaFin,
      });
    }

    // Calcular velocidad promedio (últimos 5 sprints o menos)
    const sprintsParaPromedio = historial.slice(0, 5);
    const totalSP = sprintsParaPromedio.reduce((sum, s) => sum + s.storyPointsCompletados, 0);
    const velocidadPromedio = sprintsParaPromedio.length > 0
      ? Math.round((totalSP / sprintsParaPromedio.length) * 100) / 100
      : 0;

    const velocidadUltimoSprint = historial.length > 0 ? historial[0].storyPointsCompletados : 0;

    return {
      proyectoId,
      velocidadPromedio,
      velocidadUltimoSprint,
      sprintsAnalizados: sprintsParaPromedio.length,
      historial,
    };
  }
}
