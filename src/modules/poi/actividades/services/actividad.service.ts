import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from '../entities/actividad.entity';
import { CreateActividadDto } from '../dto/create-actividad.dto';
import { UpdateActividadDto } from '../dto/update-actividad.dto';
import { ActividadEstado } from '../enums/actividad-estado.enum';

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  /**
   * Genera el siguiente código de actividad disponible (ACT N°X)
   */
  private async generateCodigo(): Promise<string> {
    const actividades = await this.actividadRepository.find({
      select: ['codigo'],
    });

    let maxNum = 0;
    for (const actividad of actividades) {
      const match = actividad.codigo.match(/ACT\s*N°(\d+)/i) || actividad.codigo.match(/ACT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `ACT N°${maxNum + 1}`;
  }

  /**
   * Obtener el siguiente código disponible para actividades
   */
  async getNextCodigo(): Promise<string> {
    return this.generateCodigo();
  }

  async create(createDto: CreateActividadDto, userId?: number): Promise<Actividad> {
    // Si no se proporciona código, generar uno automáticamente
    const codigo = createDto.codigo || await this.generateCodigo();

    const existing = await this.actividadRepository.findOne({
      where: { codigo },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una actividad con el código ${codigo}`);
    }

    const actividad = this.actividadRepository.create({
      ...createDto,
      codigo,
      metodoGestion: 'Kanban',
      createdBy: userId,
      updatedBy: userId,
    });

    return this.actividadRepository.save(actividad);
  }

  async findAll(filters?: {
    estado?: ActividadEstado;
    coordinadorId?: number;
    accionEstrategicaId?: number;
    activo?: boolean;
    pgdId?: number;
  }): Promise<Actividad[]> {
    const queryBuilder = this.actividadRepository
      .createQueryBuilder('actividad')
      .leftJoinAndSelect('actividad.coordinador', 'coordinador')
      .leftJoinAndSelect('actividad.gestor', 'gestor')
      .leftJoinAndSelect('actividad.accionEstrategica', 'ae')
      .orderBy('actividad.createdAt', 'DESC');

    if (filters?.estado) {
      queryBuilder.andWhere('actividad.estado = :estado', { estado: filters.estado });
    }

    if (filters?.coordinadorId) {
      queryBuilder.andWhere('actividad.coordinadorId = :coordinadorId', { coordinadorId: filters.coordinadorId });
    }

    if (filters?.accionEstrategicaId) {
      queryBuilder.andWhere('actividad.accionEstrategicaId = :accionEstrategicaId', { accionEstrategicaId: filters.accionEstrategicaId });
    }

    // Filtrar por PGD a través de la cadena: Actividad -> AE -> OEGD -> OGD -> PGD
    if (filters?.pgdId) {
      queryBuilder
        .leftJoin('ae.oegd', 'oegd')
        .leftJoin('oegd.ogd', 'ogd')
        .andWhere('ogd.pgdId = :pgdId', { pgdId: filters.pgdId });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('actividad.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Actividad> {
    const actividad = await this.actividadRepository.findOne({
      where: { id },
      relations: ['coordinador', 'gestor', 'accionEstrategica'],
    });

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    return actividad;
  }

  async update(id: number, updateDto: UpdateActividadDto, userId?: number): Promise<Actividad> {
    const actividad = await this.findOne(id);
    Object.assign(actividad, updateDto, { updatedBy: userId });
    return this.actividadRepository.save(actividad);
  }

  async remove(id: number, userId?: number): Promise<Actividad> {
    const actividad = await this.findOne(id);
    actividad.activo = false;
    actividad.updatedBy = userId;
    return this.actividadRepository.save(actividad);
  }

  async findByAccionEstrategica(accionEstrategicaId: number): Promise<Actividad[]> {
    return this.actividadRepository.find({
      where: { accionEstrategicaId, activo: true },
      order: { codigo: 'ASC' },
    });
  }
}
