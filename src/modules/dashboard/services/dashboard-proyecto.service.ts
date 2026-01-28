import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../../poi/proyectos/entities/proyecto.entity';
import { Sprint } from '../../agile/sprints/entities/sprint.entity';
import { HistoriaUsuario } from '../../agile/historias-usuario/entities/historia-usuario.entity';
import { Tarea } from '../../agile/tareas/entities/tarea.entity';
import { Asignacion } from '../../rrhh/asignaciones/entities/asignacion.entity';
import { SprintEstado } from '../../agile/sprints/enums/sprint.enum';
import { TareaTipo } from '../../agile/tareas/enums/tarea.enum';
import {
  DashboardProyectoDto,
  BurndownPointDto,
  VelocidadSprintDto,
  EquipoMiembroDto,
} from '../dto/dashboard-proyecto.dto';

@Injectable()
export class DashboardProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectRepository(HistoriaUsuario)
    private readonly historiaUsuarioRepository: Repository<HistoriaUsuario>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
  ) {}

  async getDashboard(proyectoId: number): Promise<DashboardProyectoDto> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { id: proyectoId },
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${proyectoId} no encontrado`);
    }

    const [
      sprintActual,
      burndown,
      velocidadHistorica,
      historiasUsuario,
      tareas,
      equipo,
    ] = await Promise.all([
      this.getSprintActual(proyectoId),
      this.getBurndown(proyectoId),
      this.getVelocidad(proyectoId),
      this.getHistoriasUsuarioStats(proyectoId),
      this.getTareasStats(proyectoId),
      this.getEquipo(proyectoId),
    ]);

    const salud = this.calcularSaludProyecto(proyecto);

    return {
      proyecto: {
        id: proyecto.id,
        codigo: proyecto.codigo,
        nombre: proyecto.nombre,
        estado: proyecto.estado,
        fechaInicio: proyecto.fechaInicio,
        fechaFin: proyecto.fechaFin,
        progreso: await this.calcularProgreso(proyectoId),
        salud,
      },
      sprintActual,
      burndown,
      velocidadHistorica,
      historiasUsuario,
      tareas,
      equipo,
    };
  }

  private async getSprintActual(proyectoId: number) {
    const sprint = await this.sprintRepository.findOne({
      where: { proyectoId, estado: SprintEstado.EN_PROGRESO, activo: true },
    });

    if (!sprint) {
      return null;
    }

    // Calcular puntos comprometidos y completados
    const stats = await this.historiaUsuarioRepository
      .createQueryBuilder('hu')
      .select('COALESCE(SUM(hu.storyPoints), 0)', 'totalSP')
      .addSelect(
        "COALESCE(SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.storyPoints ELSE 0 END), 0)",
        'completadosSP',
      )
      .where('hu.sprintId = :sprintId', { sprintId: sprint.id })
      .andWhere('hu.activo = true')
      .getRawOne();

    const puntosComprometidos = parseInt(stats?.totalSP || '0', 10);
    const puntosCompletados = parseInt(stats?.completadosSP || '0', 10);
    const progreso =
      puntosComprometidos > 0
        ? Math.round((puntosCompletados / puntosComprometidos) * 100)
        : 0;

    return {
      id: sprint.id,
      nombre: sprint.nombre,
      fechaInicio: sprint.fechaInicio,
      fechaFin: sprint.fechaFin,
      progreso,
      puntosComprometidos,
      puntosCompletados,
    };
  }

  async getBurndown(proyectoId: number): Promise<BurndownPointDto[]> {
    const sprint = await this.sprintRepository.findOne({
      where: { proyectoId, estado: SprintEstado.EN_PROGRESO, activo: true },
    });

    if (!sprint) {
      return [];
    }

    // Obtener total de SP del sprint
    const stats = await this.historiaUsuarioRepository
      .createQueryBuilder('hu')
      .select('COALESCE(SUM(hu.storyPoints), 0)', 'totalSP')
      .where('hu.sprintId = :sprintId', { sprintId: sprint.id })
      .andWhere('hu.activo = true')
      .getRawOne();

    const totalSP = parseInt(stats?.totalSP || '0', 10);

    const fechaInicio = sprint.fechaInicio ? new Date(sprint.fechaInicio) : new Date();
    const fechaFin = sprint.fechaFin ? new Date(sprint.fechaFin) : new Date();
    const hoy = new Date();
    const diasTotales = Math.ceil(
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
    );

    const burndown: BurndownPointDto[] = [];
    const spPorDia = totalSP / Math.max(diasTotales, 1);

    for (let i = 0; i <= diasTotales; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);

      const puntosIdeales = Math.max(0, totalSP - spPorDia * i);

      // Puntos restantes reales (simplificado - en producción se usarían snapshots diarios)
      let puntosRestantes = totalSP;
      if (fecha <= hoy) {
        // Calcular SP no completados hasta esa fecha
        const completados = await this.historiaUsuarioRepository
          .createQueryBuilder('hu')
          .select('COALESCE(SUM(hu.storyPoints), 0)', 'sp')
          .where('hu.sprintId = :sprintId', { sprintId: sprint.id })
          .andWhere("hu.estado = 'Finalizado'")
          .andWhere('hu.activo = true')
          .andWhere('hu.updatedAt <= :fecha', { fecha })
          .getRawOne();

        puntosRestantes = totalSP - parseInt(completados?.sp || '0', 10);
      }

      burndown.push({
        fecha: fecha.toISOString().split('T')[0],
        puntosRestantes: Math.round(puntosRestantes * 100) / 100,
        puntosIdeales: Math.round(puntosIdeales * 100) / 100,
      });
    }

    return burndown;
  }

  async getVelocidad(proyectoId: number): Promise<VelocidadSprintDto[]> {
    const sprints = await this.sprintRepository.find({
      where: { proyectoId, estado: SprintEstado.FINALIZADO, activo: true },
      order: { fechaFin: 'ASC' },
      take: 10,
    });

    const velocidad: VelocidadSprintDto[] = [];

    for (const sprint of sprints) {
      const stats = await this.historiaUsuarioRepository
        .createQueryBuilder('hu')
        .select(
          "COALESCE(SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.storyPoints ELSE 0 END), 0)",
          'sp',
        )
        .where('hu.sprintId = :sprintId', { sprintId: sprint.id })
        .andWhere('hu.activo = true')
        .getRawOne();

      velocidad.push({
        sprint: sprint.nombre,
        puntos: parseInt(stats?.sp || '0', 10),
      });
    }

    return velocidad;
  }

  private async getHistoriasUsuarioStats(proyectoId: number) {
    const historias = await this.historiaUsuarioRepository.find({
      where: { proyectoId, activo: true },
      select: ['id', 'estado'],
    });

    const porEstado: Record<string, number> = {};
    for (const hu of historias) {
      porEstado[hu.estado] = (porEstado[hu.estado] || 0) + 1;
    }

    return {
      total: historias.length,
      porEstado,
    };
  }

  private async getTareasStats(proyectoId: number) {
    // Obtener tareas de HUs del proyecto
    const tareas = await this.tareaRepository
      .createQueryBuilder('t')
      .innerJoin('t.historiaUsuario', 'hu')
      .where('hu.proyectoId = :proyectoId', { proyectoId })
      .andWhere('t.activo = true')
      .andWhere('t.tipo = :tipo', { tipo: TareaTipo.SCRUM })
      .select(['t.id', 't.estado'])
      .getMany();

    const porEstado: Record<string, number> = {};
    for (const tarea of tareas) {
      porEstado[tarea.estado] = (porEstado[tarea.estado] || 0) + 1;
    }

    return {
      total: tareas.length,
      porEstado,
    };
  }

  private async getEquipo(proyectoId: number): Promise<EquipoMiembroDto[]> {
    const asignaciones = await this.asignacionRepository.find({
      where: { proyectoId, activo: true },
      relations: ['personal'],
    });

    return asignaciones.map((a) => ({
      personalId: a.personalId,
      nombre: a.personal
        ? `${a.personal.nombres} ${a.personal.apellidos}`
        : 'Sin nombre',
      rol: a.rolEquipo || 'Miembro',
      dedicacion: Number(a.porcentajeDedicacion),
    }));
  }

  private async calcularProgreso(proyectoId: number): Promise<number> {
    const stats = await this.historiaUsuarioRepository
      .createQueryBuilder('hu')
      .select('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN hu.estado = 'Finalizado' THEN 1 ELSE 0 END)", 'completadas')
      .where('hu.proyectoId = :proyectoId', { proyectoId })
      .andWhere('hu.activo = true')
      .getRawOne();

    const total = parseInt(stats?.total || '0', 10);
    const completadas = parseInt(stats?.completadas || '0', 10);

    return total > 0 ? Math.round((completadas / total) * 100) : 0;
  }

  private calcularSaludProyecto(proyecto: Proyecto): 'verde' | 'amarillo' | 'rojo' {
    if (!proyecto.fechaInicio || !proyecto.fechaFin) {
      return 'amarillo';
    }

    const hoy = new Date();
    const fechaFin = new Date(proyecto.fechaFin);

    if (hoy > fechaFin) {
      return 'rojo';
    }

    const fechaInicio = new Date(proyecto.fechaInicio);
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
}
