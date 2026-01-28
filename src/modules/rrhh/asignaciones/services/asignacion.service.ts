import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignacion } from '../entities/asignacion.entity';
import { Personal } from '../../personal/entities/personal.entity';
import { CreateAsignacionDto } from '../dto/create-asignacion.dto';
import { UpdateAsignacionDto } from '../dto/update-asignacion.dto';
import { AlertaSobrecargaResponseDto } from '../dto/asignacion-response.dto';
import { TipoAsignacion } from '../enums/tipo-asignacion.enum';

@Injectable()
export class AsignacionService {
  constructor(
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
  ) {}

  async create(createDto: CreateAsignacionDto, userId?: number): Promise<Asignacion> {
    // Validate reference based on type
    this.validarReferencia(createDto);

    // Check if exceeds 100% dedication
    const dedicacionActual = await this.calcularDedicacionActual(createDto.personalId);
    const nuevaDedicacion = dedicacionActual + Number(createDto.porcentajeDedicacion);

    if (nuevaDedicacion > 100) {
      throw new ConflictException(
        `El personal tiene ${dedicacionActual}% asignado. ` +
        `No se puede agregar ${createDto.porcentajeDedicacion}% (excedería 100%)`,
      );
    }

    const asignacion = this.asignacionRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.asignacionRepository.save(asignacion);

    // Update personal availability
    await this.actualizarDisponibilidad(createDto.personalId);

    return this.findOne(saved.id);
  }

  private validarReferencia(dto: CreateAsignacionDto): void {
    switch (dto.tipoAsignacion) {
      case TipoAsignacion.PROYECTO:
        if (!dto.proyectoId) {
          throw new BadRequestException('proyectoId es requerido para asignaciones de tipo Proyecto');
        }
        break;
      case TipoAsignacion.ACTIVIDAD:
        if (!dto.actividadId) {
          throw new BadRequestException('actividadId es requerido para asignaciones de tipo Actividad');
        }
        break;
      case TipoAsignacion.SUBPROYECTO:
        if (!dto.subproyectoId) {
          throw new BadRequestException('subproyectoId es requerido para asignaciones de tipo Subproyecto');
        }
        break;
    }
  }

  private async calcularDedicacionActual(
    personalId: number,
    excludeAsignacionId?: number,
  ): Promise<number> {
    const queryBuilder = this.asignacionRepository
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.porcentaje_dedicacion), 0)', 'total')
      .where('a.personal_id = :personalId', { personalId })
      .andWhere('a.activo = true')
      .andWhere('(a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_DATE)');

    if (excludeAsignacionId) {
      queryBuilder.andWhere('a.id != :excludeId', { excludeId: excludeAsignacionId });
    }

    const result = await queryBuilder.getRawOne();
    return Number(result.total);
  }

  private async actualizarDisponibilidad(personalId: number): Promise<void> {
    const dedicacion = await this.calcularDedicacionActual(personalId);
    await this.personalRepository.update(personalId, {
      disponible: dedicacion < 100,
    });
  }

  async findAll(filters?: {
    personalId?: number;
    tipoAsignacion?: TipoAsignacion;
    proyectoId?: number;
    actividadId?: number;
    subproyectoId?: number;
    activo?: boolean;
  }): Promise<Asignacion[]> {
    const queryBuilder = this.asignacionRepository
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.personal', 'personal')
      .leftJoinAndSelect('asignacion.proyecto', 'proyecto')
      .leftJoinAndSelect('asignacion.actividad', 'actividad')
      .leftJoinAndSelect('asignacion.subproyecto', 'subproyecto')
      .orderBy('asignacion.fechaInicio', 'DESC');

    if (filters?.personalId) {
      queryBuilder.andWhere('asignacion.personalId = :personalId', {
        personalId: filters.personalId,
      });
    }

    if (filters?.tipoAsignacion) {
      queryBuilder.andWhere('asignacion.tipoAsignacion = :tipoAsignacion', {
        tipoAsignacion: filters.tipoAsignacion,
      });
    }

    if (filters?.proyectoId) {
      queryBuilder.andWhere('asignacion.proyectoId = :proyectoId', {
        proyectoId: filters.proyectoId,
      });
    }

    if (filters?.actividadId) {
      queryBuilder.andWhere('asignacion.actividadId = :actividadId', {
        actividadId: filters.actividadId,
      });
    }

    if (filters?.subproyectoId) {
      queryBuilder.andWhere('asignacion.subproyectoId = :subproyectoId', {
        subproyectoId: filters.subproyectoId,
      });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('asignacion.activo = :activo', {
        activo: filters.activo,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Asignacion> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
      relations: ['personal', 'proyecto', 'actividad', 'subproyecto'],
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }

    return asignacion;
  }

  async findByProyecto(proyectoId: number): Promise<Asignacion[]> {
    return this.asignacionRepository.find({
      where: { proyectoId, activo: true },
      relations: ['personal', 'personal.usuario'],
      order: { porcentajeDedicacion: 'DESC' },
    });
  }

  async findByActividad(actividadId: number): Promise<Asignacion[]> {
    return this.asignacionRepository.find({
      where: { actividadId, activo: true },
      relations: ['personal'],
      order: { porcentajeDedicacion: 'DESC' },
    });
  }

  async findBySubproyecto(subproyectoId: number): Promise<Asignacion[]> {
    return this.asignacionRepository.find({
      where: { subproyectoId, activo: true },
      relations: ['personal'],
      order: { porcentajeDedicacion: 'DESC' },
    });
  }

  async update(id: number, updateDto: UpdateAsignacionDto, userId?: number): Promise<Asignacion> {
    const asignacion = await this.findOne(id);

    // Validate new dedication if changing
    if (updateDto.porcentajeDedicacion !== undefined) {
      const dedicacionActual = await this.calcularDedicacionActual(
        asignacion.personalId,
        id,
      );
      const nuevaDedicacion = dedicacionActual + Number(updateDto.porcentajeDedicacion);

      if (nuevaDedicacion > 100) {
        throw new ConflictException(
          `El personal tiene ${dedicacionActual}% en otras asignaciones. ` +
          `No se puede asignar ${updateDto.porcentajeDedicacion}% (excedería 100%)`,
        );
      }
    }

    Object.assign(asignacion, updateDto, { updatedBy: userId });

    const saved = await this.asignacionRepository.save(asignacion);

    // Update personal availability
    await this.actualizarDisponibilidad(asignacion.personalId);

    return saved;
  }

  async remove(id: number, userId?: number): Promise<Asignacion> {
    const asignacion = await this.findOne(id);
    asignacion.activo = false;
    asignacion.updatedBy = userId;

    const saved = await this.asignacionRepository.save(asignacion);

    // Update personal availability
    await this.actualizarDisponibilidad(asignacion.personalId);

    return saved;
  }

  async getAlertasSobrecarga(): Promise<AlertaSobrecargaResponseDto[]> {
    // Get all personal with active assignments exceeding 100%
    const resultados = await this.asignacionRepository
      .createQueryBuilder('a')
      .select('a.personal_id', 'personalId')
      .addSelect('p.nombres', 'nombres')
      .addSelect('p.apellidos', 'apellidos')
      .addSelect('p.codigo_empleado', 'codigoEmpleado')
      .addSelect('p.horas_semanales', 'horasSemanales')
      .addSelect('SUM(a.porcentaje_dedicacion)', 'porcentajeTotal')
      .innerJoin('a.personal', 'p')
      .where('a.activo = true')
      .andWhere('(a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_DATE)')
      .groupBy('a.personal_id')
      .addGroupBy('p.nombres')
      .addGroupBy('p.apellidos')
      .addGroupBy('p.codigo_empleado')
      .addGroupBy('p.horas_semanales')
      .having('SUM(a.porcentaje_dedicacion) > 100')
      .getRawMany();

    // Get details for each overloaded personal
    const alertas: AlertaSobrecargaResponseDto[] = [];

    for (const r of resultados) {
      const asignaciones = await this.asignacionRepository.find({
        where: { personalId: r.personalId, activo: true },
        relations: ['proyecto', 'actividad'],
      });

      alertas.push({
        personalId: r.personalId,
        nombres: r.nombres,
        apellidos: r.apellidos,
        codigoEmpleado: r.codigoEmpleado,
        porcentajeTotal: Number(r.porcentajeTotal),
        horasSemanales: Number(r.horasSemanales),
        exceso: Number(r.porcentajeTotal) - 100,
        asignaciones: asignaciones
          .filter((a) => !a.fechaFin || new Date(a.fechaFin) >= new Date())
          .map((a) => ({
            tipo: a.tipoAsignacion,
            nombre: a.proyecto?.nombre || a.actividad?.nombre || 'N/A',
            porcentaje: Number(a.porcentajeDedicacion),
          })),
      });
    }

    return alertas;
  }
}
