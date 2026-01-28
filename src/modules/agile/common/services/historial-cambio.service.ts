import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { HistorialCambio } from '../entities/historial-cambio.entity';
import {
  HistorialEntidadTipo,
  HistorialAccion,
  CAMPOS_EXCLUIDOS_AUDITORIA,
  CAMPO_NOMBRES_LEGIBLES,
} from '../enums/historial-cambio.enum';
import { RegistrarCambioParams } from '../dto/historial-cambio-response.dto';

@Injectable()
export class HistorialCambioService {
  constructor(
    @InjectRepository(HistorialCambio)
    private readonly historialRepository: Repository<HistorialCambio>,
  ) {}

  /**
   * Registra un cambio individual en el historial
   * Este metodo es llamado internamente por otros services
   */
  async registrarCambio(params: RegistrarCambioParams): Promise<HistorialCambio> {
    const historialData: Partial<HistorialCambio> = {
      entidadTipo: params.entidadTipo,
      entidadId: params.entidadId,
      accion: params.accion,
      campoModificado: params.campoModificado || undefined,
      valorAnterior: params.valorAnterior !== undefined ? JSON.stringify(params.valorAnterior) : undefined,
      valorNuevo: params.valorNuevo !== undefined ? JSON.stringify(params.valorNuevo) : undefined,
      usuarioId: params.usuarioId,
    };

    const historial = this.historialRepository.create(historialData);
    return await this.historialRepository.save(historial);
  }

  /**
   * Registra la creacion de una entidad
   */
  async registrarCreacion(
    entidadTipo: HistorialEntidadTipo,
    entidadId: number,
    usuarioId: number,
    datosCreados?: Record<string, any>,
  ): Promise<HistorialCambio> {
    return this.registrarCambio({
      entidadTipo,
      entidadId,
      accion: HistorialAccion.CREACION,
      valorNuevo: datosCreados,
      usuarioId,
    });
  }

  /**
   * Registra la eliminacion (soft delete) de una entidad
   */
  async registrarEliminacion(
    entidadTipo: HistorialEntidadTipo,
    entidadId: number,
    usuarioId: number,
  ): Promise<HistorialCambio> {
    return this.registrarCambio({
      entidadTipo,
      entidadId,
      accion: HistorialAccion.ELIMINACION,
      usuarioId,
    });
  }

  /**
   * Compara dos objetos y registra los cambios detectados
   * Devuelve la lista de cambios registrados
   */
  async registrarCambiosMultiples(
    entidadTipo: HistorialEntidadTipo,
    entidadId: number,
    valoresAnteriores: Record<string, any>,
    valoresNuevos: Record<string, any>,
    usuarioId: number,
  ): Promise<HistorialCambio[]> {
    const cambios: HistorialCambio[] = [];

    for (const [campo, valorNuevo] of Object.entries(valoresNuevos)) {
      // Excluir campos que no deben ser auditados
      if (CAMPOS_EXCLUIDOS_AUDITORIA.includes(campo)) {
        continue;
      }

      const valorAnterior = valoresAnteriores[campo];

      // Solo registrar si realmente cambio
      if (!this.sonValoresIguales(valorAnterior, valorNuevo)) {
        const accion = this.determinarTipoAccion(campo, valorAnterior, valorNuevo);

        const cambio = await this.registrarCambio({
          entidadTipo,
          entidadId,
          accion,
          campoModificado: campo,
          valorAnterior,
          valorNuevo,
          usuarioId,
        });

        cambios.push(cambio);
      }
    }

    return cambios;
  }

  /**
   * Registra un cambio de estado
   */
  async registrarCambioEstado(
    entidadTipo: HistorialEntidadTipo,
    entidadId: number,
    estadoAnterior: string,
    estadoNuevo: string,
    usuarioId: number,
  ): Promise<HistorialCambio> {
    return this.registrarCambio({
      entidadTipo,
      entidadId,
      accion: HistorialAccion.CAMBIO_ESTADO,
      campoModificado: 'estado',
      valorAnterior: estadoAnterior,
      valorNuevo: estadoNuevo,
      usuarioId,
    });
  }

  /**
   * Registra una asignacion o reasignacion
   */
  async registrarAsignacion(
    entidadTipo: HistorialEntidadTipo,
    entidadId: number,
    asignadoAnterior: number | null,
    asignadoNuevo: number | null,
    usuarioId: number,
  ): Promise<HistorialCambio> {
    const accion = asignadoAnterior === null
      ? HistorialAccion.ASIGNACION
      : HistorialAccion.REASIGNACION;

    return this.registrarCambio({
      entidadTipo,
      entidadId,
      accion,
      campoModificado: 'asignadoA',
      valorAnterior: asignadoAnterior,
      valorNuevo: asignadoNuevo,
      usuarioId,
    });
  }

  /**
   * Registra un movimiento (ej: mover HU a otro sprint)
   */
  async registrarMovimiento(
    entidadTipo: HistorialEntidadTipo,
    entidadId: number,
    campo: string,
    valorAnterior: any,
    valorNuevo: any,
    usuarioId: number,
  ): Promise<HistorialCambio> {
    return this.registrarCambio({
      entidadTipo,
      entidadId,
      accion: HistorialAccion.MOVIMIENTO,
      campoModificado: campo,
      valorAnterior,
      valorNuevo,
      usuarioId,
    });
  }

  // ==================== METODOS DE CONSULTA (SOLO LECTURA) ====================

  /**
   * Busca historial con filtros opcionales
   */
  async findAll(filters?: {
    entidadTipo?: HistorialEntidadTipo;
    entidadId?: number;
    usuarioId?: number;
    accion?: HistorialAccion;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: HistorialCambio[]; total: number }> {
    const query = this.historialRepository.createQueryBuilder('historial')
      .leftJoinAndSelect('historial.usuario', 'usuario')
      .orderBy('historial.createdAt', 'DESC');

    if (filters?.entidadTipo) {
      query.andWhere('historial.entidadTipo = :tipo', { tipo: filters.entidadTipo });
    }

    if (filters?.entidadId) {
      query.andWhere('historial.entidadId = :id', { id: filters.entidadId });
    }

    if (filters?.usuarioId) {
      query.andWhere('historial.usuarioId = :usuarioId', { usuarioId: filters.usuarioId });
    }

    if (filters?.accion) {
      query.andWhere('historial.accion = :accion', { accion: filters.accion });
    }

    if (filters?.fechaDesde) {
      query.andWhere('historial.createdAt >= :fechaDesde', {
        fechaDesde: new Date(filters.fechaDesde)
      });
    }

    if (filters?.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      query.andWhere('historial.createdAt <= :fechaHasta', { fechaHasta });
    }

    const total = await query.getCount();

    // Paginacion
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    query.skip((page - 1) * limit).take(limit);

    const data = await query.getMany();

    return { data, total };
  }

  /**
   * Obtiene un registro de historial por ID
   */
  async findOne(id: number): Promise<HistorialCambio> {
    const historial = await this.historialRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!historial) {
      throw new NotFoundException(`Registro de historial con ID ${id} no encontrado`);
    }

    return historial;
  }

  /**
   * Obtiene todo el historial de una entidad especifica
   */
  async findByEntidad(
    entidadTipo: HistorialEntidadTipo,
    entidadId: number,
  ): Promise<HistorialCambio[]> {
    return this.historialRepository.find({
      where: { entidadTipo, entidadId },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene todo el historial generado por un usuario
   */
  async findByUsuario(usuarioId: number): Promise<HistorialCambio[]> {
    return this.historialRepository.find({
      where: { usuarioId },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
      take: 100, // Limitar para evitar queries muy pesadas
    });
  }

  /**
   * Obtiene los cambios mas recientes del sistema
   */
  async findRecientes(limit: number = 50): Promise<HistorialCambio[]> {
    return this.historialRepository.find({
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 100), // Maximo 100 registros
    });
  }

  /**
   * Obtiene el historial de una Historia de Usuario
   */
  async findByHistoriaUsuario(huId: number): Promise<HistorialCambio[]> {
    return this.findByEntidad(HistorialEntidadTipo.HISTORIA_USUARIO, huId);
  }

  /**
   * Obtiene el historial de una Tarea
   */
  async findByTarea(tareaId: number): Promise<HistorialCambio[]> {
    return this.findByEntidad(HistorialEntidadTipo.TAREA, tareaId);
  }

  /**
   * Obtiene el historial de un Sprint
   */
  async findBySprint(sprintId: number): Promise<HistorialCambio[]> {
    return this.findByEntidad(HistorialEntidadTipo.SPRINT, sprintId);
  }

  /**
   * Obtiene el historial de una Epica
   */
  async findByEpica(epicaId: number): Promise<HistorialCambio[]> {
    return this.findByEntidad(HistorialEntidadTipo.EPICA, epicaId);
  }

  /**
   * Obtiene estadisticas de cambios en un rango de fechas
   */
  async getEstadisticas(fechaDesde: string, fechaHasta: string): Promise<{
    totalCambios: number;
    porTipoEntidad: Record<string, number>;
    porAccion: Record<string, number>;
    porUsuario: { usuarioId: number; total: number }[];
  }> {
    // Validar campos requeridos
    if (!fechaDesde || !fechaHasta) {
      throw new BadRequestException(
        'Los campos fechaDesde y fechaHasta son requeridos para obtener estadísticas'
      );
    }

    const query = this.historialRepository.createQueryBuilder('h')
      .where('h.createdAt >= :fechaDesde', { fechaDesde: new Date(fechaDesde) })
      .andWhere('h.createdAt <= :fechaHasta', {
        fechaHasta: new Date(fechaHasta + 'T23:59:59.999Z')
      });

    const totalCambios = await query.getCount();

    // Por tipo de entidad
    const porTipoEntidad = await this.historialRepository.createQueryBuilder('h')
      .select('h.entidadTipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .where('h.createdAt >= :fechaDesde', { fechaDesde: new Date(fechaDesde) })
      .andWhere('h.createdAt <= :fechaHasta', {
        fechaHasta: new Date(fechaHasta + 'T23:59:59.999Z')
      })
      .groupBy('h.entidadTipo')
      .getRawMany();

    // Por accion
    const porAccion = await this.historialRepository.createQueryBuilder('h')
      .select('h.accion', 'accion')
      .addSelect('COUNT(*)', 'total')
      .where('h.createdAt >= :fechaDesde', { fechaDesde: new Date(fechaDesde) })
      .andWhere('h.createdAt <= :fechaHasta', {
        fechaHasta: new Date(fechaHasta + 'T23:59:59.999Z')
      })
      .groupBy('h.accion')
      .getRawMany();

    // Por usuario (top 10)
    const porUsuario = await this.historialRepository.createQueryBuilder('h')
      .select('h.usuarioId', 'usuarioId')
      .addSelect('COUNT(*)', 'total')
      .where('h.createdAt >= :fechaDesde', { fechaDesde: new Date(fechaDesde) })
      .andWhere('h.createdAt <= :fechaHasta', {
        fechaHasta: new Date(fechaHasta + 'T23:59:59.999Z')
      })
      .groupBy('h.usuarioId')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalCambios,
      porTipoEntidad: this.arrayToRecord(porTipoEntidad, 'tipo', 'total'),
      porAccion: this.arrayToRecord(porAccion, 'accion', 'total'),
      porUsuario: porUsuario.map(p => ({
        usuarioId: parseInt(p.usuarioId, 10),
        total: parseInt(p.total, 10),
      })),
    };
  }

  // ==================== METODOS PRIVADOS AUXILIARES ====================

  /**
   * Compara dos valores para determinar si son iguales
   */
  private sonValoresIguales(valor1: any, valor2: any): boolean {
    // Null/undefined check
    if (valor1 === valor2) return true;
    if (valor1 == null && valor2 == null) return true;
    if (valor1 == null || valor2 == null) return false;

    // Para objetos/arrays, comparar JSON
    if (typeof valor1 === 'object' || typeof valor2 === 'object') {
      return JSON.stringify(valor1) === JSON.stringify(valor2);
    }

    // Comparacion simple
    return valor1 === valor2;
  }

  /**
   * Determina el tipo de accion basado en el campo y valores
   */
  private determinarTipoAccion(
    campo: string,
    valorAnterior: any,
    valorNuevo: any,
  ): HistorialAccion {
    if (campo === 'estado') {
      return HistorialAccion.CAMBIO_ESTADO;
    }

    if (campo === 'asignadoA') {
      return valorAnterior === null
        ? HistorialAccion.ASIGNACION
        : HistorialAccion.REASIGNACION;
    }

    if (campo === 'sprintId' || campo === 'epicaId') {
      return HistorialAccion.MOVIMIENTO;
    }

    return HistorialAccion.ACTUALIZACION;
  }

  /**
   * Convierte un array de objetos a un Record
   */
  private arrayToRecord(
    arr: { [key: string]: any }[],
    keyField: string,
    valueField: string,
  ): Record<string, number> {
    const result: Record<string, number> = {};
    for (const item of arr) {
      result[item[keyField]] = parseInt(item[valueField], 10);
    }
    return result;
  }

  /**
   * Obtiene el nombre legible de un campo
   */
  getNombreLegibleCampo(campo: string): string {
    return CAMPO_NOMBRES_LEGIBLES[campo] || campo;
  }
}
