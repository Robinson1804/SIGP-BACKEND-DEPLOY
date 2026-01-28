import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cronograma } from '../entities/cronograma.entity';
import { TareaCronograma } from '../entities/tarea-cronograma.entity';
import { DependenciaCronograma } from '../entities/dependencia-cronograma.entity';
import { TipoDependencia } from '../enums/cronograma.enum';

interface TareaExportacion {
  codigo: string;
  nombre: string;
  fase: string;
  fechaInicio: string;
  fechaFin: string;
  duracion: number;
  porcentajeAvance: number;
  estado: string;
  prioridad: string;
  asignadoA: string;
  dependencias: string;
  esHito: boolean;
}

interface DatosExportacion {
  cronograma: {
    nombre: string;
    codigo: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    version: number;
  };
  tareas: TareaExportacion[];
  resumen: {
    totalTareas: number;
    tareasCompletadas: number;
    porcentajeGeneral: number;
    porFase: Record<string, { total: number; completadas: number }>;
  };
}

@Injectable()
export class ExportacionCronogramaService {
  constructor(
    @InjectRepository(Cronograma)
    private readonly cronogramaRepository: Repository<Cronograma>,
    @InjectRepository(TareaCronograma)
    private readonly tareaRepository: Repository<TareaCronograma>,
    @InjectRepository(DependenciaCronograma)
    private readonly dependenciaRepository: Repository<DependenciaCronograma>,
  ) {}

  /**
   * Obtiene los datos del cronograma formateados para exportación
   */
  async obtenerDatosExportacion(cronogramaId: number): Promise<DatosExportacion> {
    const cronograma = await this.cronogramaRepository.findOne({
      where: { id: cronogramaId },
      relations: ['proyecto'],
    });

    if (!cronograma) {
      throw new NotFoundException(`Cronograma con ID ${cronogramaId} no encontrado`);
    }

    const tareas = await this.tareaRepository.find({
      where: { cronogramaId, activo: true },
      order: { orden: 'ASC', fechaInicio: 'ASC' },
    });

    const dependencias = await this.dependenciaRepository.find({
      where: { cronogramaId },
    });

    // Crear mapa de dependencias por tarea destino
    const dependenciasMap = new Map<number, string[]>();
    for (const dep of dependencias) {
      const tareaOrigen = tareas.find((t) => t.id === dep.tareaOrigenId);
      if (tareaOrigen) {
        if (!dependenciasMap.has(dep.tareaDestinoId)) {
          dependenciasMap.set(dep.tareaDestinoId, []);
        }
        const tipoStr = this.formatearTipoDependencia(dep.tipo);
        const lagStr = dep.lag !== 0 ? `+${dep.lag}d` : '';
        dependenciasMap.get(dep.tareaDestinoId)!.push(`${tareaOrigen.codigo}${tipoStr}${lagStr}`);
      }
    }

    // Formatear tareas
    const tareasExportacion: TareaExportacion[] = tareas.map((tarea) => ({
      codigo: tarea.codigo,
      nombre: tarea.nombre,
      fase: 'General',
      fechaInicio: this.formatearFecha(tarea.fechaInicio),
      fechaFin: this.formatearFecha(tarea.fechaFin),
      duracion: this.calcularDuracionDias(tarea.fechaInicio, tarea.fechaFin),
      porcentajeAvance: Number(tarea.porcentajeAvance) || 0,
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      asignadoA: tarea.asignadoA || 'Sin asignar',
      dependencias: dependenciasMap.get(tarea.id)?.join(', ') || '',
      esHito: false,
    }));

    // Calcular resumen
    const tareasCompletadas = tareas.filter((t) => Number(t.porcentajeAvance) >= 100).length;
    const porcentajeGeneral =
      tareas.length > 0
        ? tareas.reduce((sum, t) => sum + Number(t.porcentajeAvance || 0), 0) / tareas.length
        : 0;

    const porFase: Record<string, { total: number; completadas: number }> = {};
    // Fase ya no se usa, mantener estructura vacía
    porFase['General'] = {
      total: tareas.length,
      completadas: tareas.filter((t) => Number(t.porcentajeAvance) >= 100).length,
    };

    return {
      cronograma: {
        nombre: cronograma.nombre,
        codigo: cronograma.codigo,
        fechaInicio: this.formatearFecha(cronograma.fechaInicio),
        fechaFin: this.formatearFecha(cronograma.fechaFin),
        estado: cronograma.estado,
        version: cronograma.version || 1,
      },
      tareas: tareasExportacion,
      resumen: {
        totalTareas: tareas.length,
        tareasCompletadas,
        porcentajeGeneral: Math.round(porcentajeGeneral * 100) / 100,
        porFase,
      },
    };
  }

  /**
   * Exporta a formato JSON (para frontend o API)
   */
  async exportarJSON(cronogramaId: number): Promise<DatosExportacion> {
    return this.obtenerDatosExportacion(cronogramaId);
  }

  /**
   * Exporta a formato CSV
   */
  async exportarCSV(cronogramaId: number): Promise<string> {
    const datos = await this.obtenerDatosExportacion(cronogramaId);

    const headers = [
      'Codigo',
      'Nombre',
      'Fase',
      'Fecha Inicio',
      'Fecha Fin',
      'Duracion (dias)',
      'Avance (%)',
      'Estado',
      'Prioridad',
      'Asignado A',
      'Dependencias',
      'Es Hito',
    ];

    const rows = datos.tareas.map((t) => [
      t.codigo,
      `"${t.nombre.replace(/"/g, '""')}"`,
      t.fase,
      t.fechaInicio,
      t.fechaFin,
      t.duracion.toString(),
      t.porcentajeAvance.toString(),
      t.estado,
      t.prioridad,
      `"${t.asignadoA}"`,
      `"${t.dependencias}"`,
      t.esHito ? 'Si' : 'No',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return csv;
  }

  /**
   * Genera plantilla de importación en CSV
   */
  generarPlantillaImportacion(): string {
    const headers = [
      'codigo',
      'nombre',
      'descripcion',
      'fase',
      'fecha_inicio',
      'fecha_fin',
      'prioridad',
      'asignado_a',
      'dependencias',
      'es_hito',
    ];

    const ejemploRow = [
      'TAREA-001',
      'Nombre de la tarea',
      'Descripcion opcional',
      '(General)',
      '2024-01-15',
      '2024-01-20',
      'Baja | Media | Alta',
      'Scrum Master | Desarrolladores | Todo el equipo',
      'TAREA-000FS (opcional)',
      'No | Si',
    ];

    return [headers.join(','), ejemploRow.join(',')].join('\n');
  }

  private formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }

  private calcularDuracionDias(inicio: Date, fin: Date): number {
    if (!inicio || !fin) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((new Date(fin).getTime() - new Date(inicio).getTime()) / msPerDay);
  }

  private formatearTipoDependencia(tipo: TipoDependencia): string {
    switch (tipo) {
      case TipoDependencia.FS:
        return 'FS';
      case TipoDependencia.FF:
        return 'FF';
      case TipoDependencia.SS:
        return 'SS';
      case TipoDependencia.SF:
        return 'SF';
      default:
        return 'FS';
    }
  }
}
