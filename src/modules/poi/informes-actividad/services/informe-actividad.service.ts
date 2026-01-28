import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeActividad } from '../entities/informe-actividad.entity';
import { CreateInformeActividadDto } from '../dto/create-informe-actividad.dto';
import { UpdateInformeActividadDto } from '../dto/update-informe-actividad.dto';
import { AprobarInformeActividadDto } from '../dto/aprobar-informe-actividad.dto';
import { InformeActividadEstado, PeriodoInforme } from '../enums/informe-actividad.enum';

@Injectable()
export class InformeActividadService {
  constructor(
    @InjectRepository(InformeActividad)
    private readonly informeActividadRepository: Repository<InformeActividad>,
  ) {}

  async create(createDto: CreateInformeActividadDto, userId?: number): Promise<InformeActividad> {
    const existing = await this.informeActividadRepository.findOne({
      where: {
        actividadId: createDto.actividadId,
        periodo: createDto.periodo,
        numeroPeriodo: createDto.numeroPeriodo,
        anio: createDto.anio,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un informe para el periodo ${createDto.numeroPeriodo}/${createDto.anio} en esta actividad`,
      );
    }

    const informe = this.informeActividadRepository.create({
      ...createDto,
      totalTareasPendientes: createDto.tareasPendientes?.length || 0,
      totalTareasEnProgreso: createDto.tareasEnProgreso?.length || 0,
      totalTareasCompletadas: createDto.tareasCompletadas?.length || 0,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.informeActividadRepository.save(informe);
  }

  async findAll(filters?: {
    actividadId?: number;
    periodo?: PeriodoInforme;
    anio?: number;
    estado?: InformeActividadEstado;
    activo?: boolean;
  }): Promise<InformeActividad[]> {
    const queryBuilder = this.informeActividadRepository
      .createQueryBuilder('informe')
      .orderBy('informe.anio', 'DESC')
      .addOrderBy('informe.numeroPeriodo', 'DESC');

    if (filters?.actividadId) {
      queryBuilder.andWhere('informe.actividadId = :actividadId', {
        actividadId: filters.actividadId,
      });
    }

    if (filters?.periodo) {
      queryBuilder.andWhere('informe.periodo = :periodo', { periodo: filters.periodo });
    }

    if (filters?.anio) {
      queryBuilder.andWhere('informe.anio = :anio', { anio: filters.anio });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('informe.estado = :estado', { estado: filters.estado });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('informe.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByActividad(actividadId: number): Promise<InformeActividad[]> {
    return this.informeActividadRepository.find({
      where: { actividadId, activo: true },
      order: { anio: 'DESC', numeroPeriodo: 'DESC' },
    });
  }

  async findOne(id: number): Promise<InformeActividad> {
    const informe = await this.informeActividadRepository.findOne({
      where: { id },
      relations: ['actividad', 'aprobador'],
    });

    if (!informe) {
      throw new NotFoundException(`Informe de Actividad con ID ${id} no encontrado`);
    }

    return informe;
  }

  async update(
    id: number,
    updateDto: UpdateInformeActividadDto,
    userId?: number,
  ): Promise<InformeActividad> {
    const informe = await this.findOne(id);

    // Update totals if arrays are provided
    if (updateDto.tareasPendientes !== undefined) {
      informe.totalTareasPendientes = updateDto.tareasPendientes.length;
    }
    if (updateDto.tareasEnProgreso !== undefined) {
      informe.totalTareasEnProgreso = updateDto.tareasEnProgreso.length;
    }
    if (updateDto.tareasCompletadas !== undefined) {
      informe.totalTareasCompletadas = updateDto.tareasCompletadas.length;
    }

    Object.assign(informe, updateDto, { updatedBy: userId });

    return this.informeActividadRepository.save(informe);
  }

  async enviar(id: number, userId?: number): Promise<InformeActividad> {
    const informe = await this.findOne(id);
    informe.estado = InformeActividadEstado.ENVIADO;
    informe.updatedBy = userId;
    return this.informeActividadRepository.save(informe);
  }

  async aprobar(
    id: number,
    aprobarDto: AprobarInformeActividadDto,
    userId: number,
  ): Promise<InformeActividad> {
    const informe = await this.findOne(id);

    informe.estado = aprobarDto.estado;
    informe.aprobadoPor = userId;
    informe.fechaAprobacion = new Date();
    informe.updatedBy = userId;

    if (aprobarDto.observacion) {
      informe.observaciones = aprobarDto.observacion;
    }

    return this.informeActividadRepository.save(informe);
  }

  async remove(id: number, userId?: number): Promise<InformeActividad> {
    const informe = await this.findOne(id);
    informe.activo = false;
    informe.updatedBy = userId;
    return this.informeActividadRepository.save(informe);
  }
}
