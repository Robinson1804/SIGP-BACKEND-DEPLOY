import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requerimiento } from '../entities/requerimiento.entity';
import { CreateRequerimientoDto } from '../dto/create-requerimiento.dto';
import { UpdateRequerimientoDto } from '../dto/update-requerimiento.dto';
import { RequerimientoPrioridad, RequerimientoTipo } from '../enums/requerimiento.enum';

@Injectable()
export class RequerimientoService {
  constructor(
    @InjectRepository(Requerimiento)
    private readonly requerimientoRepository: Repository<Requerimiento>,
  ) {}

  async create(createDto: CreateRequerimientoDto, userId?: number): Promise<Requerimiento> {
    const existing = await this.requerimientoRepository.findOne({
      where: { proyectoId: createDto.proyectoId, codigo: createDto.codigo },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un requerimiento con el código ${createDto.codigo} en este proyecto`,
      );
    }

    const requerimiento = this.requerimientoRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.requerimientoRepository.save(requerimiento);
  }

  async findAll(filters?: {
    proyectoId?: number;
    tipo?: RequerimientoTipo;
    prioridad?: RequerimientoPrioridad;
    activo?: boolean;
  }): Promise<Requerimiento[]> {
    const queryBuilder = this.requerimientoRepository
      .createQueryBuilder('requerimiento')
      .orderBy('requerimiento.prioridad', 'DESC')
      .addOrderBy('requerimiento.createdAt', 'DESC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('requerimiento.proyectoId = :proyectoId', {
        proyectoId: filters.proyectoId,
      });
    }

    if (filters?.tipo) {
      queryBuilder.andWhere('requerimiento.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.prioridad) {
      queryBuilder.andWhere('requerimiento.prioridad = :prioridad', {
        prioridad: filters.prioridad,
      });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('requerimiento.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<Requerimiento[]> {
    return this.requerimientoRepository.find({
      where: { proyectoId, activo: true },
      order: { prioridad: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Requerimiento> {
    const requerimiento = await this.requerimientoRepository.findOne({
      where: { id },
      relations: ['proyecto'],
    });

    if (!requerimiento) {
      throw new NotFoundException(`Requerimiento con ID ${id} no encontrado`);
    }

    return requerimiento;
  }

  async update(
    id: number,
    updateDto: UpdateRequerimientoDto,
    userId?: number,
  ): Promise<Requerimiento> {
    const requerimiento = await this.findOne(id);

    Object.assign(requerimiento, updateDto, { updatedBy: userId });

    return this.requerimientoRepository.save(requerimiento);
  }

  async remove(id: number, userId?: number): Promise<Requerimiento> {
    const requerimiento = await this.findOne(id);
    requerimiento.activo = false;
    requerimiento.updatedBy = userId;
    return this.requerimientoRepository.save(requerimiento);
  }
}
