import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../../poi/proyectos/entities/proyecto.entity';
import { Actividad } from '../../poi/actividades/entities/actividad.entity';
import { Sprint } from '../../agile/sprints/entities/sprint.entity';
import { Tarea } from '../../agile/tareas/entities/tarea.entity';
import { Asignacion } from '../../rrhh/asignaciones/entities/asignacion.entity';
import { Personal } from '../../rrhh/personal/entities/personal.entity';
import { ProyectoEstado } from '../../poi/proyectos/enums/proyecto-estado.enum';
import { ActividadEstado } from '../../poi/actividades/enums/actividad-estado.enum';
import { SprintEstado } from '../../agile/sprints/enums/sprint.enum';
import { TareaEstado } from '../../agile/tareas/enums/tarea.enum';
import {
  DashboardGeneralDto,
  KpisDto,
  SaludProyectosDto,
  AlertaDto,
  RecursoSobrecargaDto,
} from '../dto/dashboard-general.dto';

@Injectable()
export class DashboardGeneralService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
  ) {}

  async getDashboard(): Promise<DashboardGeneralDto> {
    const [kpis, saludProyectos, alertas, recursosConSobrecarga] =
      await Promise.all([
        this.getKpis(),
        this.getSaludProyectos(),
        this.getAlertas(),
        this.getRecursosSobrecargados(),
      ]);

    return {
      kpis,
      saludProyectos,
      alertas,
      recursosConSobrecarga,
    };
  }

  async getKpis(): Promise<KpisDto> {
    const [proyectos, actividades, sprints, tareas] = await Promise.all([
      this.getKpisProyectos(),
      this.getKpisActividades(),
      this.getKpisSprints(),
      this.getKpisTareas(),
    ]);

    return { proyectos, actividades, sprints, tareas };
  }

  private async getKpisProyectos() {
    const proyectos = await this.proyectoRepository.find({
      where: { activo: true },
      select: ['id', 'estado', 'fechaFin'],
    });

    const hoy = new Date();
    const total = proyectos.length;
    const enCurso = proyectos.filter(
      (p) =>
        p.estado === ProyectoEstado.EN_DESARROLLO ||
        p.estado === ProyectoEstado.EN_PLANIFICACION,
    ).length;
    const completados = proyectos.filter(
      (p) => p.estado === ProyectoEstado.FINALIZADO,
    ).length;
    const atrasados = proyectos.filter(
      (p) =>
        p.estado === ProyectoEstado.EN_DESARROLLO &&
        p.fechaFin &&
        new Date(p.fechaFin) < hoy,
    ).length;

    return { total, enCurso, atrasados, completados };
  }

  private async getKpisActividades() {
    const actividades = await this.actividadRepository.find({
      where: { activo: true },
      select: ['id', 'estado'],
    });

    const total = actividades.length;
    const enEjecucion = actividades.filter(
      (a) => a.estado === ActividadEstado.EN_EJECUCION,
    ).length;
    const suspendidas = actividades.filter(
      (a) => a.estado === ActividadEstado.SUSPENDIDO,
    ).length;

    return { total, enEjecucion, suspendidas };
  }

  private async getKpisSprints() {
    const sprints = await this.sprintRepository.find({
      where: { activo: true },
      select: ['id', 'estado'],
    });

    const activos = sprints.filter(
      (s) => s.estado === SprintEstado.EN_PROGRESO,
    ).length;

    // Calcular velocidad promedio de sprints completados
    const velocidadResult = await this.sprintRepository.manager
      .createQueryBuilder()
      .select(
        'AVG(COALESCE(sp_completados.total_sp, 0))',
        'velocidadPromedio',
      )
      .from('agile.sprints', 's')
      .leftJoin(
        (qb) =>
          qb
            .select('hu.sprint_id', 'sprint_id')
            .addSelect(
              "SUM(CASE WHEN hu.estado = 'Finalizado' THEN hu.story_points ELSE 0 END)",
              'total_sp',
            )
            .from('agile.historias_usuario', 'hu')
            .where('hu.activo = true')
            .groupBy('hu.sprint_id'),
        'sp_completados',
        's.id = sp_completados.sprint_id',
      )
      .where("s.estado = 'Finalizado'")
      .andWhere('s.activo = true')
      .getRawOne();

    const velocidadPromedio = Math.round(
      parseFloat(velocidadResult?.velocidadPromedio || '0'),
    );

    return { activos, velocidadPromedio };
  }

  private async getKpisTareas() {
    const tareas = await this.tareaRepository.find({
      where: { activo: true },
      select: ['id', 'estado'],
    });

    const total = tareas.length;
    const enProgreso = tareas.filter(
      (t) => t.estado === TareaEstado.EN_PROGRESO,
    ).length;
    const bloqueadas = tareas.filter(
      (t) => t.estado === TareaEstado.EN_REVISION,
    ).length;

    return { total, enProgreso, bloqueadas };
  }

  async getSaludProyectos(): Promise<SaludProyectosDto> {
    const proyectos = await this.proyectoRepository.find({
      where: { activo: true, estado: ProyectoEstado.EN_DESARROLLO },
      select: ['id', 'fechaInicio', 'fechaFin'],
    });

    let verde = 0;
    let amarillo = 0;
    let rojo = 0;

    const hoy = new Date();

    for (const proyecto of proyectos) {
      const salud = this.calcularSaludProyecto(proyecto, hoy);
      if (salud === 'verde') verde++;
      else if (salud === 'amarillo') amarillo++;
      else rojo++;
    }

    return { verde, amarillo, rojo };
  }

  private calcularSaludProyecto(
    proyecto: Proyecto,
    hoy: Date,
  ): 'verde' | 'amarillo' | 'rojo' {
    if (!proyecto.fechaInicio || !proyecto.fechaFin) {
      return 'amarillo';
    }

    const fechaInicio = new Date(proyecto.fechaInicio);
    const fechaFin = new Date(proyecto.fechaFin);

    // Si ya pasó la fecha de fin
    if (hoy > fechaFin) {
      return 'rojo';
    }

    // Calcular progreso esperado basado en tiempo transcurrido
    const tiempoTotal = fechaFin.getTime() - fechaInicio.getTime();
    const tiempoTranscurrido = hoy.getTime() - fechaInicio.getTime();

    if (tiempoTotal <= 0) {
      return 'verde';
    }

    const porcentajeTiempo = (tiempoTranscurrido / tiempoTotal) * 100;

    // Margen de tolerancia: 15% de retraso
    if (porcentajeTiempo > 100) {
      return 'rojo';
    } else if (porcentajeTiempo > 85) {
      return 'amarillo';
    }

    return 'verde';
  }

  async getAlertas(): Promise<AlertaDto[]> {
    const alertas: AlertaDto[] = [];

    // Proyectos atrasados
    const proyectosAtrasados = await this.proyectoRepository.find({
      where: { activo: true, estado: ProyectoEstado.EN_DESARROLLO },
      select: ['id', 'nombre', 'fechaFin'],
    });

    const hoy = new Date();
    for (const proyecto of proyectosAtrasados) {
      if (proyecto.fechaFin && new Date(proyecto.fechaFin) < hoy) {
        alertas.push({
          tipo: 'PROYECTO_ATRASADO',
          mensaje: `El proyecto "${proyecto.nombre}" ha superado su fecha de fin`,
          entidadTipo: 'Proyecto',
          entidadId: proyecto.id,
          urgencia: 'alta',
        });
      }
    }

    // Sprints que deberían haber terminado
    const sprintsVencidos = await this.sprintRepository.find({
      where: { activo: true, estado: SprintEstado.EN_PROGRESO },
      select: ['id', 'nombre', 'fechaFin', 'proyectoId'],
    });

    for (const sprint of sprintsVencidos) {
      if (sprint.fechaFin && new Date(sprint.fechaFin) < hoy) {
        alertas.push({
          tipo: 'SPRINT_VENCIDO',
          mensaje: `El sprint "${sprint.nombre}" ha superado su fecha de fin`,
          entidadTipo: 'Sprint',
          entidadId: sprint.id,
          urgencia: 'media',
        });
      }
    }

    return alertas;
  }

  async getRecursosSobrecargados(): Promise<RecursoSobrecargaDto[]> {
    // Obtener personal con su dedicación total
    const result = await this.asignacionRepository
      .createQueryBuilder('a')
      .select('a.personalId', 'personalId')
      .addSelect('SUM(a.porcentajeDedicacion)', 'totalDedicacion')
      .where('a.activo = true')
      .andWhere('a.fechaFin IS NULL OR a.fechaFin >= :hoy', { hoy: new Date() })
      .groupBy('a.personalId')
      .having('SUM(a.porcentajeDedicacion) > 100')
      .getRawMany();

    const recursos: RecursoSobrecargaDto[] = [];

    for (const row of result) {
      const personal = await this.personalRepository.findOne({
        where: { id: row.personalId },
        select: ['id', 'nombres', 'apellidos'],
      });

      if (personal) {
        recursos.push({
          personalId: personal.id,
          nombre: `${personal.nombres} ${personal.apellidos}`,
          porcentajeDedicacion: parseFloat(row.totalDedicacion),
        });
      }
    }

    return recursos;
  }
}
