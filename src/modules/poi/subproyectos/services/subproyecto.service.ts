import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subproyecto } from '../entities/subproyecto.entity';
import { CreateSubproyectoDto } from '../dto/create-subproyecto.dto';
import { UpdateSubproyectoDto } from '../dto/update-subproyecto.dto';

@Injectable()
export class SubproyectoService {
  constructor(
    @InjectRepository(Subproyecto)
    private readonly subproyectoRepository: Repository<Subproyecto>,
  ) {}

  async create(createDto: CreateSubproyectoDto, userId?: number): Promise<Subproyecto> {
    const existing = await this.subproyectoRepository.findOne({
      where: { proyectoPadreId: createDto.proyectoPadreId, codigo: createDto.codigo },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un subproyecto con el código ${createDto.codigo} en este proyecto`,
      );
    }

    const subproyecto = this.subproyectoRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.subproyectoRepository.save(subproyecto);
  }

  async findAll(proyectoPadreId?: number, activo?: boolean): Promise<Subproyecto[]> {
    const queryBuilder = this.subproyectoRepository
      .createQueryBuilder('subproyecto')
      .leftJoinAndSelect('subproyecto.scrumMaster', 'scrumMaster')
      .orderBy('subproyecto.codigo', 'ASC');

    if (proyectoPadreId) {
      queryBuilder.andWhere('subproyecto.proyectoPadreId = :proyectoPadreId', { proyectoPadreId });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('subproyecto.activo = :activo', { activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoPadreId: number): Promise<Subproyecto[]> {
    return this.subproyectoRepository.find({
      where: { proyectoPadreId, activo: true },
      relations: ['scrumMaster'],
      order: { codigo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Subproyecto> {
    const subproyecto = await this.subproyectoRepository.findOne({
      where: { id },
      relations: ['proyectoPadre', 'scrumMaster'],
    });

    if (!subproyecto) {
      throw new NotFoundException(`Subproyecto con ID ${id} no encontrado`);
    }

    return subproyecto;
  }

  async update(id: number, updateDto: UpdateSubproyectoDto, userId?: number): Promise<Subproyecto> {
    const subproyecto = await this.findOne(id);
    Object.assign(subproyecto, updateDto, { updatedBy: userId });
    return this.subproyectoRepository.save(subproyecto);
  }

  async remove(id: number, userId?: number): Promise<Subproyecto> {
    const subproyecto = await this.findOne(id);
    subproyecto.activo = false;
    subproyecto.updatedBy = userId;
    return this.subproyectoRepository.save(subproyecto);
  }
}
