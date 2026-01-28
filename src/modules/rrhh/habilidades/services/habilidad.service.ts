import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habilidad } from '../entities/habilidad.entity';
import { CreateHabilidadDto } from '../dto/create-habilidad.dto';
import { UpdateHabilidadDto } from '../dto/update-habilidad.dto';
import { HabilidadCategoria } from '../enums/habilidad-categoria.enum';

@Injectable()
export class HabilidadService {
  constructor(
    @InjectRepository(Habilidad)
    private readonly habilidadRepository: Repository<Habilidad>,
  ) {}

  async create(createDto: CreateHabilidadDto): Promise<Habilidad> {
    // Check for duplicate name in same category
    const existing = await this.habilidadRepository.findOne({
      where: { nombre: createDto.nombre, categoria: createDto.categoria },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una habilidad "${createDto.nombre}" en la categoría ${createDto.categoria}`,
      );
    }

    const habilidad = this.habilidadRepository.create(createDto);
    return this.habilidadRepository.save(habilidad);
  }

  async findAll(filters?: {
    categoria?: HabilidadCategoria;
    activo?: boolean;
    busqueda?: string;
  }): Promise<Habilidad[]> {
    const queryBuilder = this.habilidadRepository
      .createQueryBuilder('habilidad')
      .orderBy('habilidad.categoria', 'ASC')
      .addOrderBy('habilidad.nombre', 'ASC');

    if (filters?.categoria) {
      queryBuilder.andWhere('habilidad.categoria = :categoria', {
        categoria: filters.categoria,
      });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('habilidad.activo = :activo', {
        activo: filters.activo,
      });
    }

    if (filters?.busqueda) {
      queryBuilder.andWhere('LOWER(habilidad.nombre) LIKE LOWER(:busqueda)', {
        busqueda: `%${filters.busqueda}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Habilidad> {
    const habilidad = await this.habilidadRepository.findOne({
      where: { id },
    });

    if (!habilidad) {
      throw new NotFoundException(`Habilidad con ID ${id} no encontrada`);
    }

    return habilidad;
  }

  async update(id: number, updateDto: UpdateHabilidadDto): Promise<Habilidad> {
    const habilidad = await this.findOne(id);

    // Check for duplicate if changing name or category
    if (updateDto.nombre || updateDto.categoria) {
      const nombre = updateDto.nombre || habilidad.nombre;
      const categoria = updateDto.categoria || habilidad.categoria;

      const existing = await this.habilidadRepository.findOne({
        where: { nombre, categoria },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe una habilidad "${nombre}" en la categoría ${categoria}`,
        );
      }
    }

    Object.assign(habilidad, updateDto);
    return this.habilidadRepository.save(habilidad);
  }

  async remove(id: number): Promise<Habilidad> {
    const habilidad = await this.findOne(id);
    habilidad.activo = false;
    return this.habilidadRepository.save(habilidad);
  }

  async findByCategoria(categoria: HabilidadCategoria): Promise<Habilidad[]> {
    return this.habilidadRepository.find({
      where: { categoria, activo: true },
      order: { nombre: 'ASC' },
    });
  }
}
