/**
 * Dashboard Gerencial Service
 *
 * Servicios para vision ejecutiva del dashboard con KPIs mejorados
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Proyecto } from '../../poi/proyectos/entities/proyecto.entity';
import { Actividad } from '../../poi/actividades/entities/actividad.entity';
import { Sprint } from '../../agile/sprints/entities/sprint.entity';
import { HistoriaUsuario } from '../../agile/historias-usuario/entities/historia-usuario.entity';
import { Tarea } from '../../agile/tareas/entities/tarea.entity';
import { Personal } from '../../rrhh/personal/entities/personal.entity';
import { Asignacion } from '../../rrhh/asignaciones/entities/asignacion.entity';
import { ProyectoEstado } from '../../poi/proyectos/enums/proyecto-estado.enum';
import { ActividadEstado } from '../../poi/actividades/enums/actividad-estado.enum';
import { SprintEstado } from '../../agile/sprints/enums/sprint.enum';
import { TareaEstado } from '../../agile/tareas/enums/tarea.enum';
import {
  KpisGerencialesDto,
  KpiConVariacionDto,
  ProyectoActivoDto,
  ProyectosActivosResponseDto,
  ActividadActivaDto,
  ActividadesActivasResponseDto,
  SprintTimelineDto,
  SprintsTimelineResponseDto,
  SaludProyectosDetalladaDto,
  ProyectoSaludDetalleDto,
} from '../dto/dashboard-gerencial.dto';
import {
  EventoActividadDto,
  ActividadRecienteResponseDto,
  CargaDesarrolladorDto,
  CargaEquipoResponseDto,
} from '../dto/dashboard-proyecto-extendido.dto';
import {
  CfdDataPointDto,
  CfdResponseDto,
  TendenciaMetricaDto,
  TendenciasMetricasResponseDto,
} from '../dto/dashboard-actividad-extendido.dto';

@Injectable()
export class DashboardGerencialService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectRepository(HistoriaUsuario)
    private readonly huRepository: Repository<HistoriaUsuario>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
  ) {}

  /**
   * Obtener KPIs gerenciales con variación vs periodo anterior
   */
  async getKpisConVariacion(): Promise<KpisGerencialesDto> {
    const hoy = new Date();
    const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    const [proyectos, actividades, sprintsActivos, tareasDelDia] =
      await Promise.all([
        this.getKpiProyectos(inicioMesActual, inicioMesAnterior, finMesAnterior),
        this.getKpiActividades(inicioMesActual, inicioMesAnterior, finMesAnterior),
        this.getKpiSprints(inicioMesActual, inicioMesAnterior, finMesAnterior),
        this.getKpiTareasDelDia(hoy),
      ]);

    return { proyectos, actividades, sprintsActivos, tareasDelDia };
  }

  private async getKpiProyectos(
    inicioMesActual: Date,
    inicioMesAnterior: Date,
    finMesAnterior: Date,
  ): Promise<KpiConVariacionDto> {
    const proyectos = await this.proyectoRepository.find({
      where: { activo: true },
      select: ['id', 'estado', 'fechaFin', 'createdAt'],
    });

    const hoy = new Date();
    const total = proyectos.length;
    const enCurso = proyectos.filter(
      (p) =>
        p.estado === ProyectoEstado.EN_DESARROLLO ||
        p.estado === ProyectoEstado.EN_PLANIFICACION,
    ).length;
    const finalizados = proyectos.filter(
      (p) => p.estado === ProyectoEstado.FINALIZADO,
    ).length;
    const atrasados = proyectos.filter(
      (p) =>
        p.estado === ProyectoEstado.EN_DESARROLLO &&
        p.fechaFin &&
        new Date(p.fechaFin) < hoy,
    ).length;

    // Proyectos del mes anterior
    const proyectosMesAnterior = proyectos.filter(
      (p) => new Date(p.createdAt) <= finMesAnterior,
    ).length;

    const variacion = proyectosMesAnterior > 0
      ? Math.round(((total - proyectosMesAnterior) / proyectosMesAnterior) * 100)
      : 0;

    return {
      valor: total,
      variacion,
      tendencia: variacion > 0 ? 'up' : variacion < 0 ? 'down' : 'stable',
      detalles: { enCurso, finalizados, atrasados },
    };
  }

  private async getKpiActividades(
    inicioMesActual: Date,
    inicioMesAnterior: Date,
    finMesAnterior: Date,
  ): Promise<KpiConVariacionDto> {
    const actividades = await this.actividadRepository.find({
      where: { activo: true },
      select: ['id', 'estado', 'createdAt'],
    });

    const total = actividades.length;
    const enCurso = actividades.filter(
      (a) => a.estado === ActividadEstado.EN_EJECUCION,
    ).length;
    const finalizados = actividades.filter(
      (a) => a.estado === ActividadEstado.FINALIZADO,
    ).length;
    const pendientes = actividades.filter(
      (a) => a.estado === ActividadEstado.PENDIENTE,
    ).length;

    const actividadesMesAnterior = actividades.filter(
      (a) => new Date(a.createdAt) <= finMesAnterior,
    ).length;

    const variacion = actividadesMesAnterior > 0
      ? Math.round(((total - actividadesMesAnterior) / actividadesMesAnterior) * 100)
      : 0;

    return {
      valor: total,
      variacion,
      tendencia: variacion > 0 ? 'up' : variacion < 0 ? 'down' : 'stable',
      detalles: { enCurso, finalizados, pendientes },
    };
  }

  private async getKpiSprints(
    inicioMesActual: Date,
    inicioMesAnterior: Date,
    finMesAnterior: Date,
  ): Promise<KpiConVariacionDto> {
    const sprints = await this.sprintRepository.find({
      where: { activo: true },
      select: ['id', 'estado', 'createdAt'],
    });

    const activos = sprints.filter(
      (s) => s.estado === SprintEstado.EN_PROGRESO,
    ).length;
    const planificados = sprints.filter(
      (s) => s.estado === SprintEstado.POR_HACER,
    ).length;
    const completados = sprints.filter(
      (s) => s.estado === SprintEstado.FINALIZADO,
    ).length;

    // Comparar con sprints activos el mes anterior (simplificado)
    const activosAnterior = sprints.filter(
      (s) =>
        s.estado === SprintEstado.EN_PROGRESO &&
        new Date(s.createdAt) <= finMesAnterior,
    ).length;

    const variacion = activosAnterior > 0
      ? Math.round(((activos - activosAnterior) / activosAnterior) * 100)
      : 0;

    return {
      valor: activos,
      variacion,
      tendencia: variacion > 0 ? 'up' : variacion < 0 ? 'down' : 'stable',
      detalles: {
        enCurso: activos,
        pendientes: planificados,
        finalizados: completados,
      },
    };
  }

  private async getKpiTareasDelDia(hoy: Date): Promise<KpiConVariacionDto> {
    const inicioHoy = new Date(hoy);
    inicioHoy.setHours(0, 0, 0, 0);
    const finHoy = new Date(hoy);
    finHoy.setHours(23, 59, 59, 999);

    // Tareas completadas hoy
    const tareasCompletadasHoy = await this.tareaRepository
      .createQueryBuilder('t')
      .where('t.activo = true')
      .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
      .andWhere('t.updatedAt BETWEEN :inicio AND :fin', {
        inicio: inicioHoy,
        fin: finHoy,
      })
      .getCount();

    // Tareas en progreso
    const tareasEnProgreso = await this.tareaRepository.count({
      where: {
        activo: true,
        estado: TareaEstado.EN_PROGRESO,
      },
    });

    // Comparar con ayer
    const inicioAyer = new Date(inicioHoy);
    inicioAyer.setDate(inicioAyer.getDate() - 1);
    const finAyer = new Date(finHoy);
    finAyer.setDate(finAyer.getDate() - 1);

    const tareasCompletadasAyer = await this.tareaRepository
      .createQueryBuilder('t')
      .where('t.activo = true')
      .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
      .andWhere('t.updatedAt BETWEEN :inicio AND :fin', {
        inicio: inicioAyer,
        fin: finAyer,
      })
      .getCount();

    const variacion = tareasCompletadasAyer > 0
      ? Math.round(((tareasCompletadasHoy - tareasCompletadasAyer) / tareasCompletadasAyer) * 100)
      : 0;

    return {
      valor: tareasCompletadasHoy,
      variacion,
      tendencia: variacion > 0 ? 'up' : variacion < 0 ? 'down' : 'stable',
      detalles: {
        finalizados: tareasCompletadasHoy,
        enCurso: tareasEnProgreso,
      },
    };
  }

  /**
   * Obtener lista paginada de proyectos activos con metricas
   */
  async getProyectosActivos(
    page: number = 1,
    limit: number = 10,
  ): Promise<ProyectosActivosResponseDto> {
    const skip = (page - 1) * limit;

    const [proyectos, total] = await this.proyectoRepository.findAndCount({
      where: {
        activo: true,
        estado: In([ProyectoEstado.EN_DESARROLLO, ProyectoEstado.EN_PLANIFICACION]),
      },
      relations: ['coordinador'],
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    const data: ProyectoActivoDto[] = [];

    for (const proyecto of proyectos) {
      // Obtener sprint activo
      const sprintActivo = await this.sprintRepository.findOne({
        where: {
          proyectoId: proyecto.id,
          activo: true,
          estado: SprintEstado.EN_PROGRESO,
        },
        select: ['id', 'nombre'],
      });

      // Calcular story points
      const spResult = await this.huRepository
        .createQueryBuilder('hu')
        .select('SUM(hu.storyPoints)', 'total')
        .addSelect(
          "SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.storyPoints ELSE 0 END)",
          'completados',
        )
        .innerJoin('hu.sprint', 'sprint')
        .where('sprint.proyectoId = :proyectoId', { proyectoId: proyecto.id })
        .andWhere('hu.activo = true')
        .getRawOne();

      const storyPointsTotal = parseInt(spResult?.total || '0', 10);
      const storyPointsCompletados = parseInt(spResult?.completados || '0', 10);
      const porcentajeAvance = storyPointsTotal > 0
        ? Math.round((storyPointsCompletados / storyPointsTotal) * 100)
        : 0;

      // Calcular salud
      const salud = this.calcularSaludProyecto(proyecto);

      // Proxima fecha importante (fin de sprint activo)
      let proximaFecha: string | null = null;
      if (sprintActivo) {
        const sprint = await this.sprintRepository.findOne({
          where: { id: sprintActivo.id },
          select: ['fechaFin'],
        });
        if (sprint?.fechaFin) {
          proximaFecha = sprint.fechaFin;
        }
      }

      data.push({
        id: proyecto.id,
        codigo: proyecto.codigo || `PRY-${proyecto.id}`,
        nombre: proyecto.nombre,
        sprintActual: sprintActivo
          ? { id: sprintActivo.id, nombre: sprintActivo.nombre }
          : null,
        storyPointsCompletados,
        storyPointsTotal,
        porcentajeAvance,
        estado: proyecto.estado,
        salud,
        proximaFecha,
        coordinadorNombre: proyecto.coordinador
          ? `${proyecto.coordinador.nombres} ${proyecto.coordinador.apellidos}`
          : null,
      });
    }

    return { data, total, page, limit };
  }

  private calcularSaludProyecto(proyecto: Proyecto): 'verde' | 'amarillo' | 'rojo' {
    if (!proyecto.fechaInicio || !proyecto.fechaFin) {
      return 'amarillo';
    }

    const hoy = new Date();
    const fechaInicio = new Date(proyecto.fechaInicio);
    const fechaFin = new Date(proyecto.fechaFin);

    if (hoy > fechaFin) {
      return 'rojo';
    }

    const tiempoTotal = fechaFin.getTime() - fechaInicio.getTime();
    const tiempoTranscurrido = hoy.getTime() - fechaInicio.getTime();

    if (tiempoTotal <= 0) {
      return 'verde';
    }

    const porcentajeTiempo = (tiempoTranscurrido / tiempoTotal) * 100;

    if (porcentajeTiempo > 100) {
      return 'rojo';
    } else if (porcentajeTiempo > 85) {
      return 'amarillo';
    }

    return 'verde';
  }

  /**
   * Obtener lista paginada de actividades activas con metricas Kanban
   */
  async getActividadesActivas(
    page: number = 1,
    limit: number = 10,
  ): Promise<ActividadesActivasResponseDto> {
    const skip = (page - 1) * limit;

    const [actividades, total] = await this.actividadRepository.findAndCount({
      where: {
        activo: true,
        estado: In([ActividadEstado.EN_EJECUCION, ActividadEstado.PENDIENTE]),
      },
      relations: ['coordinador'],
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    const data: ActividadActivaDto[] = [];
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    for (const actividad of actividades) {
      // Contar tareas
      const tareasTotal = await this.tareaRepository.count({
        where: { actividadId: actividad.id, activo: true },
      });

      // Tareas completadas este mes
      const tareasCompletadasMes = await this.tareaRepository
        .createQueryBuilder('t')
        .where('t.actividadId = :actividadId', { actividadId: actividad.id })
        .andWhere('t.activo = true')
        .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
        .andWhere('t.updatedAt >= :inicioMes', { inicioMes })
        .getCount();

      // Calcular Lead Time promedio (simplificado)
      const leadTimeResult = await this.tareaRepository
        .createQueryBuilder('t')
        .select('AVG(EXTRACT(EPOCH FROM (t.updatedAt - t.createdAt)) / 86400)', 'leadTime')
        .where('t.actividadId = :actividadId', { actividadId: actividad.id })
        .andWhere('t.activo = true')
        .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
        .getRawOne();

      const leadTimePromedio = Math.round(parseFloat(leadTimeResult?.leadTime || '0') * 10) / 10;

      // Throughput semanal
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - 7);
      const throughputSemanal = await this.tareaRepository
        .createQueryBuilder('t')
        .where('t.actividadId = :actividadId', { actividadId: actividad.id })
        .andWhere('t.activo = true')
        .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
        .andWhere('t.updatedAt >= :inicio', { inicio: inicioSemana })
        .getCount();

      // Calcular progreso basado en tareas
      const tareasFinalizadas = await this.tareaRepository.count({
        where: {
          actividadId: actividad.id,
          activo: true,
          estado: TareaEstado.FINALIZADO,
        },
      });
      const progreso = tareasTotal > 0
        ? Math.round((tareasFinalizadas / tareasTotal) * 100)
        : 0;

      data.push({
        id: actividad.id,
        codigo: actividad.codigo || `ACT-${actividad.id}`,
        nombre: actividad.nombre,
        tareasTotal,
        tareasCompletadasMes,
        leadTimePromedio,
        throughputSemanal,
        coordinadorNombre: actividad.coordinador
          ? `${actividad.coordinador.nombres} ${actividad.coordinador.apellidos}`
          : null,
        estado: actividad.estado,
        progreso,
      });
    }

    return { data, total, page, limit };
  }

  /**
   * Obtener timeline de sprints para visualizacion Gantt
   */
  async getSprintsTimeline(meses: number = 3): Promise<SprintsTimelineResponseDto> {
    const hoy = new Date();
    const rangoInicio = new Date(hoy);
    rangoInicio.setMonth(rangoInicio.getMonth() - 1);
    rangoInicio.setDate(1);

    const rangoFin = new Date(hoy);
    rangoFin.setMonth(rangoFin.getMonth() + meses);

    const sprints = await this.sprintRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.proyecto', 'p')
      .where('s.activo = true')
      .andWhere('p.activo = true')
      .andWhere('s.fechaFin >= :rangoInicio', { rangoInicio })
      .andWhere('s.fechaInicio <= :rangoFin', { rangoFin })
      .orderBy('s.fechaInicio', 'ASC')
      .getMany();

    const data: SprintTimelineDto[] = [];

    for (const sprint of sprints) {
      // Calcular story points
      const spResult = await this.huRepository
        .createQueryBuilder('hu')
        .select('SUM(hu.storyPoints)', 'total')
        .addSelect(
          "SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.storyPoints ELSE 0 END)",
          'completados',
        )
        .where('hu.sprintId = :sprintId', { sprintId: sprint.id })
        .andWhere('hu.activo = true')
        .getRawOne();

      const storyPointsTotal = parseInt(spResult?.total || '0', 10);
      const storyPointsCompletados = parseInt(spResult?.completados || '0', 10);
      const progreso = storyPointsTotal > 0
        ? Math.round((storyPointsCompletados / storyPointsTotal) * 100)
        : 0;

      data.push({
        id: sprint.id,
        nombre: sprint.nombre,
        proyectoId: sprint.proyectoId,
        proyectoNombre: sprint.proyecto?.nombre || '',
        proyectoCodigo: sprint.proyecto?.codigo || `PRY-${sprint.proyectoId}`,
        fechaInicio: sprint.fechaInicio || '',
        fechaFin: sprint.fechaFin || '',
        estado: sprint.estado as 'Por hacer' | 'En progreso' | 'Finalizado',
        progreso,
        storyPointsCompletados,
        storyPointsTotal,
      });
    }

    return {
      data,
      rangoInicio: rangoInicio.toISOString().split('T')[0],
      rangoFin: rangoFin.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener salud de proyectos con detalle
   */
  async getSaludProyectosDetallada(): Promise<SaludProyectosDetalladaDto> {
    const proyectos = await this.proyectoRepository.find({
      where: {
        activo: true,
        estado: In([ProyectoEstado.EN_DESARROLLO, ProyectoEstado.EN_PLANIFICACION]),
      },
      select: ['id', 'codigo', 'nombre', 'fechaInicio', 'fechaFin', 'estado'],
    });

    const verde: ProyectoSaludDetalleDto[] = [];
    const amarillo: ProyectoSaludDetalleDto[] = [];
    const rojo: ProyectoSaludDetalleDto[] = [];

    const hoy = new Date();

    for (const proyecto of proyectos) {
      const salud = this.calcularSaludProyecto(proyecto);
      let razon = '';

      if (salud === 'verde') {
        razon = 'En tiempo';
      } else if (salud === 'amarillo') {
        if (!proyecto.fechaInicio || !proyecto.fechaFin) {
          razon = 'Sin fechas definidas';
        } else {
          razon = 'Cerca del plazo limite';
        }
      } else {
        razon = 'Fuera de plazo';
      }

      const detalle: ProyectoSaludDetalleDto = {
        id: proyecto.id,
        codigo: proyecto.codigo || `PRY-${proyecto.id}`,
        nombre: proyecto.nombre,
        salud,
        razon,
      };

      if (salud === 'verde') verde.push(detalle);
      else if (salud === 'amarillo') amarillo.push(detalle);
      else rojo.push(detalle);
    }

    return {
      verde,
      amarillo,
      rojo,
      resumen: {
        verde: verde.length,
        amarillo: amarillo.length,
        rojo: rojo.length,
      },
    };
  }

  /**
   * Obtener actividad reciente de un proyecto (feed de eventos)
   */
  async getActividadReciente(
    proyectoId: number,
    limit: number = 20,
  ): Promise<ActividadRecienteResponseDto> {
    const eventos: EventoActividadDto[] = [];

    // Obtener sprints del proyecto
    const sprints = await this.sprintRepository.find({
      where: { proyectoId, activo: true },
      select: ['id'],
    });
    const sprintIds = sprints.map((s) => s.id);

    if (sprintIds.length > 0) {
      // Tareas completadas recientemente
      const tareasCompletadas = await this.tareaRepository
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.asignado', 'asignado')
        .leftJoinAndSelect('t.historiaUsuario', 'hu')
        .where('hu.sprintId IN (:...sprintIds)', { sprintIds })
        .andWhere('t.activo = true')
        .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
        .orderBy('t.updatedAt', 'DESC')
        .take(limit)
        .getMany();

      for (const tarea of tareasCompletadas) {
        eventos.push({
          id: tarea.id,
          tipo: 'tarea_completada',
          titulo: `Tarea completada: ${tarea.nombre}`,
          descripcion: `La tarea fue marcada como finalizada`,
          usuarioId: tarea.asignado?.id || null,
          usuarioNombre: tarea.asignado
            ? `${tarea.asignado.nombre} ${tarea.asignado.apellido}`
            : null,
          timestamp: tarea.updatedAt,
          entidadTipo: 'Tarea',
          entidadId: tarea.id,
        });
      }

      // Historias de usuario movidas/completadas
      const husRecientes = await this.huRepository
        .createQueryBuilder('hu')
        .leftJoinAndSelect('hu.sprint', 'sprint')
        .where('hu.sprintId IN (:...sprintIds)', { sprintIds })
        .andWhere('hu.activo = true')
        .orderBy('hu.updatedAt', 'DESC')
        .take(limit)
        .getMany();

      for (const hu of husRecientes) {
        const esCompletada = hu.estado === 'Finalizado';
        eventos.push({
          id: hu.id + 100000, // Offset to avoid ID collision
          tipo: esCompletada ? 'hu_completada' : 'hu_movida',
          titulo: esCompletada
            ? `Historia completada: ${hu.titulo}`
            : `Historia actualizada: ${hu.titulo}`,
          descripcion: `Estado: ${hu.estado}`,
          usuarioId: null,
          usuarioNombre: null,
          timestamp: hu.updatedAt,
          entidadTipo: 'HistoriaUsuario',
          entidadId: hu.id,
        });
      }
    }

    // Sprints del proyecto (iniciados/completados)
    const sprintsRecientes = await this.sprintRepository.find({
      where: { proyectoId, activo: true },
      order: { updatedAt: 'DESC' },
      take: 5,
    });

    for (const sprint of sprintsRecientes) {
      if (sprint.estado === SprintEstado.EN_PROGRESO) {
        eventos.push({
          id: sprint.id + 200000,
          tipo: 'sprint_iniciado',
          titulo: `Sprint iniciado: ${sprint.nombre}`,
          descripcion: `El sprint ha comenzado`,
          usuarioId: null,
          usuarioNombre: null,
          timestamp: sprint.fechaInicio,
          entidadTipo: 'Sprint',
          entidadId: sprint.id,
        });
      } else if (sprint.estado === SprintEstado.FINALIZADO) {
        eventos.push({
          id: sprint.id + 300000,
          tipo: 'sprint_completado',
          titulo: `Sprint completado: ${sprint.nombre}`,
          descripcion: `El sprint ha finalizado`,
          usuarioId: null,
          usuarioNombre: null,
          timestamp: sprint.fechaFin,
          entidadTipo: 'Sprint',
          entidadId: sprint.id,
        });
      }
    }

    // Ordenar por timestamp descendente y limitar
    eventos.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
    const eventosLimitados = eventos.slice(0, limit);

    return {
      data: eventosLimitados,
      total: eventos.length,
    };
  }

  /**
   * Obtener carga de trabajo del equipo de un proyecto
   */
  async getCargaEquipo(proyectoId: number): Promise<CargaEquipoResponseDto> {
    // Obtener asignaciones del proyecto
    const asignaciones = await this.asignacionRepository.find({
      where: { proyectoId, activo: true },
      relations: ['personal'],
    });

    // Obtener sprints del proyecto
    const sprints = await this.sprintRepository.find({
      where: { proyectoId, activo: true },
      select: ['id'],
    });
    const sprintIds = sprints.map((s) => s.id);

    const desarrolladores: CargaDesarrolladorDto[] = [];
    let totalStoryPointsGlobal = 0;
    let totalTareasCompletadas = 0;

    for (const asignacion of asignaciones) {
      if (!asignacion.personal) continue;

      const personalId = asignacion.personal.id;

      // Contar tareas asignadas a este desarrollador en el proyecto
      let tareasAsignadas = 0;
      let tareasEnProgreso = 0;
      let tareasCompletadas = 0;

      if (sprintIds.length > 0) {
        const tareasStats = await this.tareaRepository
          .createQueryBuilder('t')
          .select('t.estado', 'estado')
          .addSelect('COUNT(*)', 'cantidad')
          .innerJoin('t.historiaUsuario', 'hu')
          .where('hu.sprintId IN (:...sprintIds)', { sprintIds })
          .andWhere('t.asignadoId = :personalId', { personalId })
          .andWhere('t.activo = true')
          .groupBy('t.estado')
          .getRawMany();

        for (const stat of tareasStats) {
          const cantidad = parseInt(stat.cantidad, 10);
          tareasAsignadas += cantidad;
          if (stat.estado === TareaEstado.EN_PROGRESO) {
            tareasEnProgreso = cantidad;
          } else if (stat.estado === TareaEstado.FINALIZADO) {
            tareasCompletadas = cantidad;
          }
        }
      }

      // Calcular story points (del sprint activo si existe)
      let storyPointsAsignados = 0;
      let storyPointsCompletados = 0;

      if (sprintIds.length > 0) {
        // Story points de tareas asignadas al desarrollador
        const spResult = await this.huRepository
          .createQueryBuilder('hu')
          .select('SUM(hu.storyPoints)', 'total')
          .addSelect(
            "SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.storyPoints ELSE 0 END)",
            'completados',
          )
          .innerJoin('hu.tareas', 't')
          .where('hu.sprintId IN (:...sprintIds)', { sprintIds })
          .andWhere('t.asignadoId = :personalId', { personalId })
          .andWhere('hu.activo = true')
          .getRawOne();

        storyPointsAsignados = parseInt(spResult?.total || '0', 10);
        storyPointsCompletados = parseInt(spResult?.completados || '0', 10);
      }

      totalStoryPointsGlobal += storyPointsAsignados;
      totalTareasCompletadas += tareasCompletadas;

      // Calcular porcentaje de carga (basado en tareas en progreso vs capacidad)
      const capacidadMaxima = 10; // Tareas máximas por desarrollador
      const porcentajeCarga = Math.min(
        Math.round((tareasEnProgreso / capacidadMaxima) * 100),
        100,
      );

      desarrolladores.push({
        personalId,
        nombre: `${asignacion.personal.nombres} ${asignacion.personal.apellidos}`,
        rol: asignacion.rolEquipo || 'Desarrollador',
        avatar: undefined,
        tareasAsignadas,
        tareasEnProgreso,
        tareasCompletadas,
        storyPointsAsignados,
        storyPointsCompletados,
        porcentajeCarga,
      });
    }

    // Calcular promedio de tareas completadas
    const promedioTareasCompletadas =
      desarrolladores.length > 0
        ? Math.round(totalTareasCompletadas / desarrolladores.length)
        : 0;

    // Ordenar por carga descendente
    desarrolladores.sort((a, b) => b.porcentajeCarga - a.porcentajeCarga);

    return {
      data: desarrolladores,
      promedioTareasCompletadas,
      totalStoryPoints: totalStoryPointsGlobal,
    };
  }

  /**
   * Obtener datos para CFD (Cumulative Flow Diagram) de una actividad
   */
  async getCfdData(actividadId: number, dias: number = 30): Promise<CfdResponseDto> {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - dias);

    // Obtener todas las tareas de la actividad con sus cambios de estado
    const tareas = await this.tareaRepository.find({
      where: { actividadId, activo: true },
      select: ['id', 'estado', 'createdAt', 'updatedAt'],
    });

    // Generar datos por cada dia en el rango
    const data: CfdDataPointDto[] = [];
    const fechaActual = new Date(inicio);

    while (fechaActual <= hoy) {
      // Contar tareas en cada estado para este dia
      let porHacer = 0;
      let enProgreso = 0;
      let enRevision = 0;
      let finalizado = 0;

      for (const tarea of tareas) {
        const createdAt = new Date(tarea.createdAt);

        // Solo contar si la tarea existia en esta fecha
        if (createdAt <= fechaActual) {
          // Determinar estado en la fecha actual (simplificado: usar estado actual)
          // En una implementacion real, habria que consultar el historial de cambios
          if (tarea.estado === TareaEstado.POR_HACER) porHacer++;
          else if (tarea.estado === TareaEstado.EN_PROGRESO) enProgreso++;
          else if (tarea.estado === TareaEstado.EN_REVISION) enRevision++;
          else if (tarea.estado === TareaEstado.FINALIZADO) finalizado++;
        }
      }

      data.push({
        fecha: fechaActual.toISOString().split('T')[0],
        porHacer,
        enProgreso,
        enRevision,
        finalizado,
        total: porHacer + enProgreso + enRevision + finalizado,
      });

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return {
      data,
      actividadId,
      periodoInicio: inicio.toISOString().split('T')[0],
      periodoFin: hoy.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener tendencias de metricas Kanban de una actividad
   */
  async getTendenciasMetricas(
    actividadId: number,
    semanas: number = 8,
  ): Promise<TendenciasMetricasResponseDto> {
    const data: TendenciaMetricaDto[] = [];
    const hoy = new Date();

    // Calcular metricas por cada semana
    for (let i = semanas - 1; i >= 0; i--) {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(inicioSemana.getDate() - (i * 7) - 7);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6);

      // Tareas completadas en la semana (throughput)
      const tareasCompletadas = await this.tareaRepository
        .createQueryBuilder('t')
        .where('t.actividadId = :actividadId', { actividadId })
        .andWhere('t.activo = true')
        .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
        .andWhere('t.updatedAt BETWEEN :inicio AND :fin', {
          inicio: inicioSemana,
          fin: finSemana,
        })
        .getCount();

      // Lead Time promedio de tareas completadas en la semana
      const leadTimeResult = await this.tareaRepository
        .createQueryBuilder('t')
        .select('AVG(EXTRACT(EPOCH FROM (t.updatedAt - t.createdAt)) / 86400)', 'leadTime')
        .where('t.actividadId = :actividadId', { actividadId })
        .andWhere('t.activo = true')
        .andWhere('t.estado = :estado', { estado: TareaEstado.FINALIZADO })
        .andWhere('t.updatedAt BETWEEN :inicio AND :fin', {
          inicio: inicioSemana,
          fin: finSemana,
        })
        .getRawOne();

      const leadTime = Math.round((parseFloat(leadTimeResult?.leadTime || '0')) * 10) / 10;

      // WIP promedio en la semana (tareas no finalizadas)
      const wipPromedio = await this.tareaRepository.count({
        where: {
          actividadId,
          activo: true,
          estado: In([TareaEstado.EN_PROGRESO, TareaEstado.EN_REVISION]),
        },
      });

      data.push({
        periodo: `Semana ${semanas - i}`,
        periodoLabel: `Sem ${semanas - i}`,
        leadTime,
        cycleTime: leadTime * 0.7, // Estimacion: cycle time es ~70% del lead time
        throughput: tareasCompletadas,
        wipPromedio,
      });
    }

    // Calcular promedios
    const totalLeadTime = data.reduce((sum, d) => sum + d.leadTime, 0);
    const totalCycleTime = data.reduce((sum, d) => sum + d.cycleTime, 0);
    const totalThroughput = data.reduce((sum, d) => sum + d.throughput, 0);

    const promedioLeadTime = data.length > 0 ? Math.round((totalLeadTime / data.length) * 10) / 10 : 0;
    const promedioCycleTime = data.length > 0 ? Math.round((totalCycleTime / data.length) * 10) / 10 : 0;
    const promedioThroughput = data.length > 0 ? Math.round((totalThroughput / data.length) * 10) / 10 : 0;

    // Calcular tendencias comparando primera y ultima mitad
    const mitad = Math.floor(data.length / 2);
    const primeraMitad = data.slice(0, mitad);
    const segundaMitad = data.slice(mitad);

    const calcularTendencia = (
      primero: number[],
      segundo: number[],
      invertido: boolean = false,
    ): 'mejorando' | 'empeorando' | 'estable' => {
      const promP = primero.reduce((a, b) => a + b, 0) / primero.length;
      const promS = segundo.reduce((a, b) => a + b, 0) / segundo.length;
      const diff = ((promS - promP) / (promP || 1)) * 100;

      if (Math.abs(diff) < 5) return 'estable';
      if (invertido) {
        return diff < 0 ? 'mejorando' : 'empeorando';
      }
      return diff > 0 ? 'mejorando' : 'empeorando';
    };

    return {
      data,
      actividadId,
      promedios: {
        leadTime: promedioLeadTime,
        cycleTime: promedioCycleTime,
        throughput: promedioThroughput,
      },
      tendencias: {
        leadTime: calcularTendencia(
          primeraMitad.map((d) => d.leadTime),
          segundaMitad.map((d) => d.leadTime),
          true, // Menor lead time es mejor
        ),
        cycleTime: calcularTendencia(
          primeraMitad.map((d) => d.cycleTime),
          segundaMitad.map((d) => d.cycleTime),
          true, // Menor cycle time es mejor
        ),
        throughput: calcularTendencia(
          primeraMitad.map((d) => d.throughput),
          segundaMitad.map((d) => d.throughput),
          false, // Mayor throughput es mejor
        ),
      },
    };
  }
}
