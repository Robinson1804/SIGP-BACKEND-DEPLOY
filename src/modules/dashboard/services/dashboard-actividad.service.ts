import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from '../../poi/actividades/entities/actividad.entity';
import { Tarea } from '../../agile/tareas/entities/tarea.entity';
import { Asignacion } from '../../rrhh/asignaciones/entities/asignacion.entity';
import { TareaTipo, TareaEstado } from '../../agile/tareas/enums/tarea.enum';
import {
  DashboardActividadDto,
  MetricasKanbanDto,
  ThroughputSemanalDto,
  EquipoActividadMiembroDto,
} from '../dto/dashboard-actividad.dto';

@Injectable()
export class DashboardActividadService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
  ) {}

  async getDashboard(actividadId: number): Promise<DashboardActividadDto> {
    const actividad = await this.actividadRepository.findOne({
      where: { id: actividadId },
    });

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${actividadId} no encontrada`);
    }

    const [metricasKanban, tareasPorEstado, throughputSemanal, equipo] =
      await Promise.all([
        this.calcularMetricasKanban(actividadId),
        this.getTareasPorEstado(actividadId),
        this.getThroughput(actividadId),
        this.getEquipo(actividadId),
      ]);

    const totalTareas = Object.values(tareasPorEstado).reduce((a, b) => a + b, 0);
    const tareasCompletadas = tareasPorEstado[TareaEstado.FINALIZADO] || 0;
    const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;

    return {
      actividad: {
        id: actividad.id,
        codigo: actividad.codigo,
        nombre: actividad.nombre,
        estado: actividad.estado,
        progreso,
      },
      metricasKanban,
      tareasPorEstado,
      throughputSemanal,
      equipo,
    };
  }

  async calcularMetricasKanban(actividadId: number): Promise<MetricasKanbanDto> {
    const tareasCompletadas = await this.tareaRepository.find({
      where: {
        actividadId,
        tipo: TareaTipo.KANBAN,
        estado: TareaEstado.FINALIZADO,
        activo: true,
      },
      select: ['id', 'createdAt', 'updatedAt', 'fechaInicioProgreso', 'fechaCompletado'],
    });

    // Lead Time: tiempo desde creación hasta completado (promedio en días)
    // Cycle Time: tiempo desde inicio de progreso hasta completado (preciso)
    let leadTimeTotal = 0;
    let cycleTimeTotal = 0;
    let leadTimeCount = 0;
    let cycleTimeCount = 0;

    for (const tarea of tareasCompletadas) {
      const createdAt = new Date(tarea.createdAt);
      // Usar fechaCompletado si está disponible, sino updatedAt (fallback)
      const completedAt = tarea.fechaCompletado
        ? new Date(tarea.fechaCompletado)
        : new Date(tarea.updatedAt);

      // Lead Time: desde creación hasta completado
      const leadTimeDias =
        (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      leadTimeTotal += leadTimeDias;
      leadTimeCount++;

      // Cycle Time preciso: desde inicio de progreso hasta completado
      if (tarea.fechaInicioProgreso) {
        const startedAt = new Date(tarea.fechaInicioProgreso);
        const cycleTimeDias =
          (completedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24);
        cycleTimeTotal += cycleTimeDias;
        cycleTimeCount++;
      } else {
        // Fallback: aproximar cycle time como 70% del lead time
        cycleTimeTotal += leadTimeDias * 0.7;
        cycleTimeCount++;
      }
    }

    const leadTime = leadTimeCount > 0
      ? Math.round((leadTimeTotal / leadTimeCount) * 10) / 10
      : 0;
    const cycleTime = cycleTimeCount > 0
      ? Math.round((cycleTimeTotal / cycleTimeCount) * 10) / 10
      : 0;

    // Throughput: tareas completadas en la última semana
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const tareasUltimaSemana = tareasCompletadas.filter((t) => {
      const completedAt = t.fechaCompletado
        ? new Date(t.fechaCompletado)
        : new Date(t.updatedAt);
      return completedAt >= hace7Dias;
    }).length;

    return {
      leadTime,
      cycleTime,
      throughput: tareasUltimaSemana,
    };
  }

  private async getTareasPorEstado(actividadId: number): Promise<Record<string, number>> {
    const tareas = await this.tareaRepository.find({
      where: { actividadId, tipo: TareaTipo.KANBAN, activo: true },
      select: ['id', 'estado'],
    });

    const porEstado: Record<string, number> = {};
    for (const tarea of tareas) {
      porEstado[tarea.estado] = (porEstado[tarea.estado] || 0) + 1;
    }

    return porEstado;
  }

  async getThroughput(actividadId: number): Promise<ThroughputSemanalDto[]> {
    const hace8Semanas = new Date();
    hace8Semanas.setDate(hace8Semanas.getDate() - 56);

    const tareasCompletadas = await this.tareaRepository.find({
      where: {
        actividadId,
        tipo: TareaTipo.KANBAN,
        estado: TareaEstado.FINALIZADO,
        activo: true,
      },
      select: ['id', 'updatedAt', 'fechaCompletado'],
    });

    // Agrupar por semana
    const semanas: Map<string, number> = new Map();

    for (let i = 0; i < 8; i++) {
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - (7 * (i + 1)));
      const finSemana = new Date();
      finSemana.setDate(finSemana.getDate() - (7 * i));

      const semanaKey = `Semana -${i + 1}`;

      const completadasEnSemana = tareasCompletadas.filter((t) => {
        // Usar fechaCompletado si está disponible, sino updatedAt (fallback)
        const fecha = t.fechaCompletado
          ? new Date(t.fechaCompletado)
          : new Date(t.updatedAt);
        return fecha >= inicioSemana && fecha < finSemana;
      }).length;

      semanas.set(semanaKey, completadasEnSemana);
    }

    // Convertir a array y ordenar
    const throughput: ThroughputSemanalDto[] = [];
    for (let i = 7; i >= 0; i--) {
      const semanaKey = `Semana -${i + 1}`;
      throughput.push({
        semana: semanaKey,
        completadas: semanas.get(semanaKey) || 0,
      });
    }

    return throughput;
  }

  private async getEquipo(actividadId: number): Promise<EquipoActividadMiembroDto[]> {
    const asignaciones = await this.asignacionRepository.find({
      where: { actividadId, activo: true },
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
}
