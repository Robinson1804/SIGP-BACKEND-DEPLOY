import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TareaCronograma } from '../entities/tarea-cronograma.entity';
import { DependenciaCronograma } from '../entities/dependencia-cronograma.entity';
import { TipoDependencia } from '../enums/cronograma.enum';

interface TareaConCPM {
  id: number;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  duracion: number; // en días
  earlyStart: number; // ES
  earlyFinish: number; // EF
  lateStart: number; // LS
  lateFinish: number; // LF
  holgura: number; // Float = LS - ES = LF - EF
  enRutaCritica: boolean;
  tieneConflicto: boolean;
  conflictoDescripcion?: string;
}

interface ResultadoRutaCritica {
  tareasCriticas: number[];
  tareasConConflicto: number[];
  duracionTotal: number;
  fechaFinProyecto: Date;
  detalle: TareaConCPM[];
}

@Injectable()
export class RutaCriticaService {
  constructor(
    @InjectRepository(TareaCronograma)
    private readonly tareaRepository: Repository<TareaCronograma>,
    @InjectRepository(DependenciaCronograma)
    private readonly dependenciaRepository: Repository<DependenciaCronograma>,
  ) {}

  /**
   * Calcula la ruta crítica de un cronograma usando el método CPM
   */
  async calcularRutaCritica(cronogramaId: number): Promise<ResultadoRutaCritica> {
    // Obtener todas las tareas activas del cronograma
    const tareas = await this.tareaRepository.find({
      where: { cronogramaId, activo: true },
      order: { fechaInicio: 'ASC' },
    });

    if (tareas.length === 0) {
      return {
        tareasCriticas: [],
        tareasConConflicto: [],
        duracionTotal: 0,
        fechaFinProyecto: new Date(),
        detalle: [],
      };
    }

    // Obtener todas las dependencias
    const dependencias = await this.dependenciaRepository.find({
      where: { cronogramaId },
    });

    // Construir mapa de tareas y calcular duraciones
    const tareasMap = new Map<number, TareaConCPM>();
    const fechaBaseProyecto = new Date(
      Math.min(...tareas.map((t) => t.fechaInicio.getTime())),
    );

    for (const tarea of tareas) {
      const duracion = this.calcularDuracionDias(tarea.fechaInicio, tarea.fechaFin);
      const diasDesdeInicio = this.calcularDuracionDias(fechaBaseProyecto, tarea.fechaInicio);

      tareasMap.set(tarea.id, {
        id: tarea.id,
        nombre: tarea.nombre,
        fechaInicio: tarea.fechaInicio,
        fechaFin: tarea.fechaFin,
        duracion,
        earlyStart: diasDesdeInicio,
        earlyFinish: diasDesdeInicio + duracion,
        lateStart: Infinity,
        lateFinish: Infinity,
        holgura: 0,
        enRutaCritica: false,
        tieneConflicto: false,
      });
    }

    // Construir grafos de predecesores y sucesores
    const predecesores = new Map<number, { tareaId: number; tipo: TipoDependencia; lag: number }[]>();
    const sucesores = new Map<number, { tareaId: number; tipo: TipoDependencia; lag: number }[]>();

    for (const dep of dependencias) {
      if (!predecesores.has(dep.tareaDestinoId)) {
        predecesores.set(dep.tareaDestinoId, []);
      }
      predecesores.get(dep.tareaDestinoId)!.push({
        tareaId: dep.tareaOrigenId,
        tipo: dep.tipo,
        lag: dep.lag,
      });

      if (!sucesores.has(dep.tareaOrigenId)) {
        sucesores.set(dep.tareaOrigenId, []);
      }
      sucesores.get(dep.tareaOrigenId)!.push({
        tareaId: dep.tareaDestinoId,
        tipo: dep.tipo,
        lag: dep.lag,
      });
    }

    // Forward pass: calcular ES y EF
    const tareasOrdenadas = this.ordenTopologico(tareas, dependencias);

    for (const tareaId of tareasOrdenadas) {
      const tarea = tareasMap.get(tareaId)!;
      const preds = predecesores.get(tareaId) || [];

      for (const pred of preds) {
        const tareaPred = tareasMap.get(pred.tareaId);
        if (!tareaPred) continue;

        let nuevoES: number;

        switch (pred.tipo) {
          case TipoDependencia.FS: // Finish-to-Start
            nuevoES = tareaPred.earlyFinish + pred.lag;
            break;
          case TipoDependencia.SS: // Start-to-Start
            nuevoES = tareaPred.earlyStart + pred.lag;
            break;
          case TipoDependencia.FF: // Finish-to-Finish
            nuevoES = tareaPred.earlyFinish + pred.lag - tarea.duracion;
            break;
          case TipoDependencia.SF: // Start-to-Finish
            nuevoES = tareaPred.earlyStart + pred.lag - tarea.duracion;
            break;
          default:
            nuevoES = tareaPred.earlyFinish + pred.lag;
        }

        if (nuevoES > tarea.earlyStart) {
          tarea.earlyStart = nuevoES;
          tarea.earlyFinish = nuevoES + tarea.duracion;
        }

        // Detectar conflictos
        if (nuevoES > tarea.earlyStart && nuevoES < 0) {
          tarea.tieneConflicto = true;
          tarea.conflictoDescripcion = `Conflicto de fechas con tarea predecesora ${tareaPred.nombre}`;
        }
      }
    }

    // Calcular duración total del proyecto
    const duracionTotal = Math.max(...Array.from(tareasMap.values()).map((t) => t.earlyFinish));
    const fechaFinProyecto = this.agregarDias(fechaBaseProyecto, duracionTotal);

    // Backward pass: calcular LS y LF
    for (const tareaId of [...tareasOrdenadas].reverse()) {
      const tarea = tareasMap.get(tareaId)!;
      const sucs = sucesores.get(tareaId) || [];

      if (sucs.length === 0) {
        // Tarea sin sucesores: LF = duración del proyecto
        tarea.lateFinish = duracionTotal;
        tarea.lateStart = tarea.lateFinish - tarea.duracion;
      } else {
        for (const suc of sucs) {
          const tareaSuc = tareasMap.get(suc.tareaId);
          if (!tareaSuc) continue;

          let nuevoLF: number;

          switch (suc.tipo) {
            case TipoDependencia.FS:
              nuevoLF = tareaSuc.lateStart - suc.lag;
              break;
            case TipoDependencia.SS:
              nuevoLF = tareaSuc.lateStart - suc.lag + tarea.duracion;
              break;
            case TipoDependencia.FF:
              nuevoLF = tareaSuc.lateFinish - suc.lag;
              break;
            case TipoDependencia.SF:
              nuevoLF = tareaSuc.lateFinish - suc.lag + tarea.duracion;
              break;
            default:
              nuevoLF = tareaSuc.lateStart - suc.lag;
          }

          if (nuevoLF < tarea.lateFinish) {
            tarea.lateFinish = nuevoLF;
            tarea.lateStart = tarea.lateFinish - tarea.duracion;
          }
        }
      }
    }

    // Calcular holgura y determinar ruta crítica
    const tareasCriticas: number[] = [];
    const tareasConConflicto: number[] = [];

    for (const tarea of tareasMap.values()) {
      tarea.holgura = tarea.lateStart - tarea.earlyStart;

      // Tarea está en ruta crítica si holgura es 0 (o muy cercana a 0)
      if (Math.abs(tarea.holgura) < 0.001) {
        tarea.enRutaCritica = true;
        tareasCriticas.push(tarea.id);
      }

      // Detectar conflictos adicionales
      if (tarea.lateStart < tarea.earlyStart) {
        tarea.tieneConflicto = true;
        tarea.conflictoDescripcion = 'La tarea no puede completarse a tiempo según las dependencias';
        if (!tareasConConflicto.includes(tarea.id)) {
          tareasConConflicto.push(tarea.id);
        }
      }
    }

    return {
      tareasCriticas,
      tareasConConflicto,
      duracionTotal,
      fechaFinProyecto,
      detalle: Array.from(tareasMap.values()),
    };
  }

  /**
   * Recalcula las fechas de las tareas basándose en las dependencias
   */
  async recalcularFechas(cronogramaId: number): Promise<TareaCronograma[]> {
    const resultado = await this.calcularRutaCritica(cronogramaId);
    const tareasActualizadas: TareaCronograma[] = [];

    // Obtener la fecha base del proyecto
    const tareas = await this.tareaRepository.find({
      where: { cronogramaId, activo: true },
    });

    if (tareas.length === 0) return [];

    const fechaBaseProyecto = new Date(
      Math.min(...tareas.map((t) => t.fechaInicio.getTime())),
    );

    // Actualizar fechas basadas en el cálculo
    for (const detalle of resultado.detalle) {
      const tarea = tareas.find((t) => t.id === detalle.id);
      if (!tarea) continue;

      const nuevaFechaInicio = this.agregarDias(fechaBaseProyecto, detalle.earlyStart);
      const nuevaFechaFin = this.agregarDias(fechaBaseProyecto, detalle.earlyFinish);

      // Solo actualizar si hay diferencia significativa
      if (
        this.calcularDuracionDias(tarea.fechaInicio, nuevaFechaInicio) !== 0 ||
        this.calcularDuracionDias(tarea.fechaFin, nuevaFechaFin) !== 0
      ) {
        tarea.fechaInicio = nuevaFechaInicio;
        tarea.fechaFin = nuevaFechaFin;
        await this.tareaRepository.save(tarea);
        tareasActualizadas.push(tarea);
      }
    }

    return tareasActualizadas;
  }

  /**
   * Orden topológico usando algoritmo de Kahn
   */
  private ordenTopologico(
    tareas: TareaCronograma[],
    dependencias: DependenciaCronograma[],
  ): number[] {
    const resultado: number[] = [];
    const gradoEntrada = new Map<number, number>();
    const adjacencia = new Map<number, number[]>();

    // Inicializar
    for (const tarea of tareas) {
      gradoEntrada.set(tarea.id, 0);
      adjacencia.set(tarea.id, []);
    }

    // Construir grafo
    for (const dep of dependencias) {
      if (gradoEntrada.has(dep.tareaDestinoId)) {
        gradoEntrada.set(
          dep.tareaDestinoId,
          gradoEntrada.get(dep.tareaDestinoId)! + 1,
        );
      }
      if (adjacencia.has(dep.tareaOrigenId)) {
        adjacencia.get(dep.tareaOrigenId)!.push(dep.tareaDestinoId);
      }
    }

    // Cola con tareas sin predecesores
    const cola: number[] = [];
    for (const [tareaId, grado] of gradoEntrada) {
      if (grado === 0) {
        cola.push(tareaId);
      }
    }

    // Ordenar por fecha de inicio para tareas sin dependencias
    cola.sort((a, b) => {
      const tareaA = tareas.find((t) => t.id === a);
      const tareaB = tareas.find((t) => t.id === b);
      if (!tareaA || !tareaB) return 0;
      return tareaA.fechaInicio.getTime() - tareaB.fechaInicio.getTime();
    });

    // Procesar
    while (cola.length > 0) {
      const tareaId = cola.shift()!;
      resultado.push(tareaId);

      for (const sucesor of adjacencia.get(tareaId) || []) {
        const nuevoGrado = gradoEntrada.get(sucesor)! - 1;
        gradoEntrada.set(sucesor, nuevoGrado);

        if (nuevoGrado === 0) {
          cola.push(sucesor);
        }
      }
    }

    // Si hay ciclo, agregar tareas faltantes al final
    for (const tarea of tareas) {
      if (!resultado.includes(tarea.id)) {
        resultado.push(tarea.id);
      }
    }

    return resultado;
  }

  /**
   * Calcula la duración en días entre dos fechas
   */
  private calcularDuracionDias(inicio: Date, fin: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((fin.getTime() - inicio.getTime()) / msPerDay);
  }

  /**
   * Agrega días a una fecha
   */
  private agregarDias(fecha: Date, dias: number): Date {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
  }
}
