import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { HistoriaUsuario } from '../../historias-usuario/entities/historia-usuario.entity';
import { Tarea } from '../../tareas/entities/tarea.entity';
import { Subtarea } from '../../subtareas/entities/subtarea.entity';
import { HuEstado } from '../../historias-usuario/enums/historia-usuario.enum';
import { TareaEstado, TareaTipo } from '../../tareas/enums/tarea.enum';
import {
  TableroScrumResponseDto,
  ColumnaTableroScrumDto,
  HistoriaUsuarioTableroDto,
} from '../dto/tablero-scrum-response.dto';
import {
  TableroKanbanResponseDto,
  ColumnaTableroKanbanDto,
  TareaKanbanTableroDto,
} from '../dto/tablero-kanban-response.dto';

@Injectable()
export class TableroService {
  private readonly columnasScrum: { estado: HuEstado; nombre: string }[] = [
    { estado: HuEstado.POR_HACER, nombre: 'Por hacer' },
    { estado: HuEstado.EN_PROGRESO, nombre: 'En progreso' },
    { estado: HuEstado.FINALIZADO, nombre: 'Finalizado' },
  ];

  private readonly columnasKanban: { estado: TareaEstado; nombre: string }[] = [
    { estado: TareaEstado.POR_HACER, nombre: 'Por Hacer' },
    { estado: TareaEstado.EN_PROGRESO, nombre: 'En Progreso' },
    { estado: TareaEstado.EN_REVISION, nombre: 'En Revisión' },
    { estado: TareaEstado.FINALIZADO, nombre: 'Finalizado' },
  ];

  constructor(
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectRepository(HistoriaUsuario)
    private readonly historiaUsuarioRepository: Repository<HistoriaUsuario>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Subtarea)
    private readonly subtareaRepository: Repository<Subtarea>,
  ) {}

  async getTableroScrum(sprintId: number): Promise<TableroScrumResponseDto> {
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint con ID ${sprintId} no encontrado`);
    }

    // Get all historias for this sprint with their tareas
    const historias = await this.historiaUsuarioRepository.find({
      where: { sprintId, activo: true },
      relations: ['asignado'],
      order: { prioridad: 'ASC', ordenBacklog: 'ASC' },
    });

    // Get all tareas for these historias
    const historiaIds = historias.map((h) => h.id);
    const tareas = historiaIds.length > 0
      ? await this.tareaRepository.find({
          where: historiaIds.map((id) => ({ historiaUsuarioId: id, activo: true })),
          relations: ['asignado'],
        })
      : [];

    // Group tareas by historia
    const tareasByHistoria = new Map<number, typeof tareas>();
    tareas.forEach((t) => {
      const existing = tareasByHistoria.get(t.historiaUsuarioId) || [];
      existing.push(t);
      tareasByHistoria.set(t.historiaUsuarioId, existing);
    });

    // Build columnas
    const columnas: ColumnaTableroScrumDto[] = this.columnasScrum.map((col) => {
      const historiasEnColumna = historias.filter((h) => h.estado === col.estado);
      const historiasDto: HistoriaUsuarioTableroDto[] = historiasEnColumna.map((h) => {
        const tareasHistoria = tareasByHistoria.get(h.id) || [];
        const tareasCompletadas = tareasHistoria.filter(
          (t) => t.estado === TareaEstado.FINALIZADO,
        ).length;

        return {
          id: h.id,
          codigo: h.codigo,
          titulo: h.titulo,
          rol: h.rol,
          quiero: h.quiero,
          para: h.para,
          prioridad: h.prioridad,
          estimacion: h.estimacion,
          storyPoints: h.storyPoints,
          estado: h.estado,
          // asignadoA ahora es un array de IDs de responsables
          asignadoA: h.asignadoA || [],
          tareas: tareasHistoria.map((t) => ({
            id: t.id,
            codigo: t.codigo,
            nombre: t.nombre,
            descripcion: t.descripcion,
            estado: t.estado,
            prioridad: t.prioridad,
            asignadoA: t.asignadoA,
            asignado: t.asignado
              ? {
                  id: t.asignado.id,
                  nombre: t.asignado.nombre,
                }
              : undefined,
            horasEstimadas: t.horasEstimadas,
            horasReales: t.horasReales,
            // evidenciaUrl eliminado - usar endpoint GET /tareas/:id/evidencias
            validada: t.validada,
          })),
          tareasCompletadas,
          tareasTotal: tareasHistoria.length,
          progreso:
            tareasHistoria.length > 0
              ? Math.round((tareasCompletadas / tareasHistoria.length) * 100)
              : 0,
        };
      });

      return {
        estado: col.estado,
        nombre: col.nombre,
        historias: historiasDto,
        totalHistorias: historiasEnColumna.length,
        totalStoryPoints: historiasEnColumna.reduce(
          (sum, h) => sum + (h.storyPoints || 0),
          0,
        ),
      };
    });

    // Calculate statistics
    const totalHistorias = historias.length;
    const historiasCompletadas = historias.filter(
      (h) => h.estado === HuEstado.FINALIZADO,
    ).length;
    const totalStoryPoints = historias.reduce(
      (sum, h) => sum + (h.storyPoints || 0),
      0,
    );
    const storyPointsCompletados = historias
      .filter((h) => h.estado === HuEstado.FINALIZADO)
      .reduce((sum, h) => sum + (h.storyPoints || 0), 0);

    return {
      sprint: {
        id: sprint.id,
        nombre: sprint.nombre,
        sprintGoal: sprint.sprintGoal,
        estado: sprint.estado,
        fechaInicio: sprint.fechaInicio,
        fechaFin: sprint.fechaFin,
        capacidadEquipo: sprint.capacidadEquipo,
      },
      columnas,
      estadisticas: {
        totalHistorias,
        historiasCompletadas,
        totalStoryPoints,
        storyPointsCompletados,
        progreso:
          totalStoryPoints > 0
            ? Math.round((storyPointsCompletados / totalStoryPoints) * 100)
            : 0,
        velocidad: storyPointsCompletados,
      },
    };
  }

  async getTableroKanban(actividadId: number): Promise<TableroKanbanResponseDto> {
    // Get actividad info - we'll query from tareas since actividad is in POI module
    const tareas = await this.tareaRepository.find({
      where: { actividadId, tipo: TareaTipo.KANBAN, activo: true },
      relations: ['asignado'],
      order: { prioridad: 'ASC', createdAt: 'DESC' },
    });

    // Get all subtareas for these tareas
    const tareaIds = tareas.map((t) => t.id);
    const subtareas = tareaIds.length > 0
      ? await this.subtareaRepository.find({
          where: tareaIds.map((id) => ({ tareaId: id, activo: true })),
          relations: ['responsable'],
        })
      : [];

    // Group subtareas by tarea
    const subtareasByTarea = new Map<number, typeof subtareas>();
    subtareas.forEach((st) => {
      const existing = subtareasByTarea.get(st.tareaId) || [];
      existing.push(st);
      subtareasByTarea.set(st.tareaId, existing);
    });

    // Build columnas
    const columnas: ColumnaTableroKanbanDto[] = this.columnasKanban.map((col) => {
      const tareasEnColumna = tareas.filter((t) => t.estado === col.estado);
      const tareasDto: TareaKanbanTableroDto[] = tareasEnColumna.map((t) => {
        const subtareasTarea = subtareasByTarea.get(t.id) || [];
        const subtareasCompletadas = subtareasTarea.filter(
          (st) => st.estado === TareaEstado.FINALIZADO,
        ).length;

        return {
          id: t.id,
          codigo: t.codigo,
          nombre: t.nombre,
          descripcion: t.descripcion,
          estado: t.estado,
          prioridad: t.prioridad,
          asignadoA: t.asignadoA,
          asignado: t.asignado
            ? {
                id: t.asignado.id,
                nombre: t.asignado.nombre,
              }
            : undefined,
          horasEstimadas: t.horasEstimadas,
          horasReales: t.horasReales,
          // evidenciaUrl eliminado - usar endpoint GET /tareas/:id/evidencias
          subtareas: subtareasTarea.map((st) => ({
            id: st.id,
            codigo: st.codigo,
            nombre: st.nombre,
            estado: st.estado,
            prioridad: st.prioridad,
            responsableId: st.responsableId,
            responsable: st.responsable
              ? {
                  id: st.responsable.id,
                  nombre: st.responsable.nombre,
                }
              : undefined,
            horasEstimadas: st.horasEstimadas,
            horasReales: st.horasReales,
          })),
          subtareasCompletadas,
          subtareasTotal: subtareasTarea.length,
          progreso:
            subtareasTarea.length > 0
              ? Math.round((subtareasCompletadas / subtareasTarea.length) * 100)
              : 0,
        };
      });

      return {
        estado: col.estado,
        nombre: col.nombre,
        tareas: tareasDto,
        totalTareas: tareasEnColumna.length,
      };
    });

    // Calculate statistics
    const totalTareas = tareas.length;
    const tareasCompletadas = tareas.filter(
      (t) => t.estado === TareaEstado.FINALIZADO,
    ).length;
    const tareasEnProgreso = tareas.filter(
      (t) => t.estado === TareaEstado.EN_PROGRESO,
    ).length;
    const tareasPendientes = tareas.filter(
      (t) => t.estado === TareaEstado.POR_HACER,
    ).length;
    const horasEstimadas = tareas.reduce(
      (sum, t) => sum + (Number(t.horasEstimadas) || 0),
      0,
    );
    const horasReales = tareas.reduce(
      (sum, t) => sum + (Number(t.horasReales) || 0),
      0,
    );

    return {
      actividad: {
        id: actividadId,
        codigo: '',
        nombre: '',
        descripcion: '',
        fechaInicio: null,
        fechaFin: null,
      },
      columnas,
      estadisticas: {
        totalTareas,
        tareasCompletadas,
        tareasEnProgreso,
        tareasPendientes,
        horasEstimadas,
        horasReales,
        progreso:
          totalTareas > 0
            ? Math.round((tareasCompletadas / totalTareas) * 100)
            : 0,
        throughput: tareasCompletadas,
        leadTime: 0,
      },
    };
  }
}
