import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeSprint } from '../entities/informe-sprint.entity';
import { CreateInformeSprintDto } from '../dto/create-informe-sprint.dto';
import { UpdateInformeSprintDto } from '../dto/update-informe-sprint.dto';
import { AprobarInformeSprintDto } from '../dto/aprobar-informe-sprint.dto';
import { InformeSprintEstado } from '../enums/informe-sprint.enum';

@Injectable()
export class InformeSprintService {
  constructor(
    @InjectRepository(InformeSprint)
    private readonly informeSprintRepository: Repository<InformeSprint>,
  ) {}

  async create(createDto: CreateInformeSprintDto, userId?: number): Promise<InformeSprint> {
    const existing = await this.informeSprintRepository.findOne({
      where: { proyectoId: createDto.proyectoId, numeroSprint: createDto.numeroSprint },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un informe para el Sprint ${createDto.numeroSprint} en este proyecto`,
      );
    }

    const informe = this.informeSprintRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.informeSprintRepository.save(informe);
  }

  async findAll(filters?: {
    proyectoId?: number;
    estado?: InformeSprintEstado;
    activo?: boolean;
  }): Promise<InformeSprint[]> {
    const queryBuilder = this.informeSprintRepository
      .createQueryBuilder('informe')
      .orderBy('informe.numeroSprint', 'DESC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('informe.proyectoId = :proyectoId', {
        proyectoId: filters.proyectoId,
      });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('informe.estado = :estado', { estado: filters.estado });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('informe.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<InformeSprint[]> {
    return this.informeSprintRepository.find({
      where: { proyectoId, activo: true },
      order: { numeroSprint: 'DESC' },
    });
  }

  async findOne(id: number): Promise<InformeSprint> {
    const informe = await this.informeSprintRepository.findOne({
      where: { id },
      relations: ['proyecto', 'aprobador'],
    });

    if (!informe) {
      throw new NotFoundException(`Informe de Sprint con ID ${id} no encontrado`);
    }

    return informe;
  }

  async update(
    id: number,
    updateDto: UpdateInformeSprintDto,
    userId?: number,
  ): Promise<InformeSprint> {
    const informe = await this.findOne(id);

    Object.assign(informe, updateDto, { updatedBy: userId });

    return this.informeSprintRepository.save(informe);
  }

  async enviar(id: number, userId?: number): Promise<InformeSprint> {
    const informe = await this.findOne(id);
    informe.estado = InformeSprintEstado.ENVIADO;
    informe.updatedBy = userId;
    return this.informeSprintRepository.save(informe);
  }

  async aprobar(
    id: number,
    aprobarDto: AprobarInformeSprintDto,
    userId: number,
  ): Promise<InformeSprint> {
    const informe = await this.findOne(id);

    informe.estado = aprobarDto.estado;
    informe.aprobadoPor = userId;
    informe.fechaAprobacion = new Date();
    informe.updatedBy = userId;

    if (aprobarDto.observacion) {
      informe.observaciones = aprobarDto.observacion;
    }

    return this.informeSprintRepository.save(informe);
  }

  async remove(id: number, userId?: number): Promise<InformeSprint> {
    const informe = await this.findOne(id);
    informe.activo = false;
    informe.updatedBy = userId;
    return this.informeSprintRepository.save(informe);
  }
}
