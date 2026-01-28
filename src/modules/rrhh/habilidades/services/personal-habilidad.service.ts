import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalHabilidad } from '../entities/personal-habilidad.entity';
import { AsignarHabilidadDto, UpdatePersonalHabilidadDto } from '../dto/asignar-habilidad.dto';

@Injectable()
export class PersonalHabilidadService {
  constructor(
    @InjectRepository(PersonalHabilidad)
    private readonly personalHabilidadRepository: Repository<PersonalHabilidad>,
  ) {}

  async asignar(
    personalId: number,
    asignarDto: AsignarHabilidadDto,
  ): Promise<PersonalHabilidad> {
    // Check if already assigned
    const existing = await this.personalHabilidadRepository.findOne({
      where: { personalId, habilidadId: asignarDto.habilidadId },
    });

    if (existing) {
      throw new ConflictException(
        'Esta habilidad ya está asignada a este personal',
      );
    }

    const personalHabilidad = this.personalHabilidadRepository.create({
      personalId,
      ...asignarDto,
    });

    return this.personalHabilidadRepository.save(personalHabilidad);
  }

  async findByPersonal(personalId: number): Promise<PersonalHabilidad[]> {
    return this.personalHabilidadRepository.find({
      where: { personalId },
      relations: ['habilidad'],
      order: { nivel: 'DESC' },
    });
  }

  async findByHabilidad(habilidadId: number): Promise<PersonalHabilidad[]> {
    return this.personalHabilidadRepository.find({
      where: { habilidadId },
      relations: ['personal'],
      order: { nivel: 'DESC' },
    });
  }

  async update(
    personalId: number,
    habilidadId: number,
    updateDto: UpdatePersonalHabilidadDto,
  ): Promise<PersonalHabilidad> {
    const personalHabilidad = await this.personalHabilidadRepository.findOne({
      where: { personalId, habilidadId },
    });

    if (!personalHabilidad) {
      throw new NotFoundException(
        'Asignación de habilidad no encontrada',
      );
    }

    Object.assign(personalHabilidad, updateDto);
    return this.personalHabilidadRepository.save(personalHabilidad);
  }

  async remove(personalId: number, habilidadId: number): Promise<void> {
    const personalHabilidad = await this.personalHabilidadRepository.findOne({
      where: { personalId, habilidadId },
    });

    if (!personalHabilidad) {
      throw new NotFoundException(
        'Asignación de habilidad no encontrada',
      );
    }

    await this.personalHabilidadRepository.remove(personalHabilidad);
  }
}
