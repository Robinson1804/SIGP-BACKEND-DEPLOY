import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Impedimento } from '../entities/impedimento.entity';
import { CreateImpedimentoDto } from '../dto/create-impedimento.dto';
import { UpdateImpedimentoDto } from '../dto/update-impedimento.dto';
import { ImpedimentoEstado } from '../enums/impedimento.enum';

@Injectable()
export class ImpedimentoService {
  constructor(
    @InjectRepository(Impedimento)
    private readonly impedimentoRepository: Repository<Impedimento>,
  ) {}

  async create(createDto: CreateImpedimentoDto): Promise<Impedimento> {
    const impedimento = this.impedimentoRepository.create({
      ...createDto,
      fechaReporte: createDto.fechaReporte || new Date().toISOString().split('T')[0],
    });

    const saved = await this.impedimentoRepository.save(impedimento);
    return this.findOne(saved.id);
  }

  async findAll(filters?: {
    proyectoId?: number;
    sprintId?: number;
    actividadId?: number;
    estado?: ImpedimentoEstado;
  }): Promise<Impedimento[]> {
    const queryBuilder = this.impedimentoRepository
      .createQueryBuilder('impedimento')
      .leftJoinAndSelect('impedimento.reportadoPor', 'reportadoPor')
      .leftJoinAndSelect('impedimento.responsable', 'responsable')
      .leftJoinAndSelect('impedimento.dailyMeeting', 'dailyMeeting')
      .orderBy('impedimento.createdAt', 'DESC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('impedimento.proyectoId = :proyectoId', {
        proyectoId: filters.proyectoId,
      });
    }

    if (filters?.sprintId) {
      queryBuilder.andWhere('impedimento.sprintId = :sprintId', {
        sprintId: filters.sprintId,
      });
    }

    if (filters?.actividadId) {
      queryBuilder.andWhere('impedimento.actividadId = :actividadId', {
        actividadId: filters.actividadId,
      });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('impedimento.estado = :estado', {
        estado: filters.estado,
      });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<Impedimento[]> {
    return this.findAll({ proyectoId });
  }

  async findBySprint(sprintId: number): Promise<Impedimento[]> {
    return this.findAll({ sprintId });
  }

  async findByActividad(actividadId: number): Promise<Impedimento[]> {
    return this.findAll({ actividadId });
  }

  async findOne(id: number): Promise<Impedimento> {
    const impedimento = await this.impedimentoRepository.findOne({
      where: { id },
      relations: ['reportadoPor', 'responsable', 'dailyMeeting'],
    });

    if (!impedimento) {
      throw new NotFoundException(`Impedimento con ID ${id} no encontrado`);
    }

    return impedimento;
  }

  async update(id: number, updateDto: UpdateImpedimentoDto): Promise<Impedimento> {
    const impedimento = await this.findOne(id);

    // Si se está resolviendo, agregar fecha de resolución
    if (updateDto.estado === ImpedimentoEstado.RESUELTO && !impedimento.fechaResolucion) {
      (updateDto as any).fechaResolucion = new Date();
    }

    Object.assign(impedimento, updateDto);

    await this.impedimentoRepository.save(impedimento);
    return this.findOne(id);
  }

  async resolve(id: number, resolucion: string): Promise<Impedimento> {
    return this.update(id, {
      estado: ImpedimentoEstado.RESUELTO,
      resolucion,
    });
  }

  async remove(id: number): Promise<void> {
    const impedimento = await this.findOne(id);
    await this.impedimentoRepository.remove(impedimento);
  }

  async getEstadisticas(filters: { proyectoId?: number; sprintId?: number }): Promise<{
    total: number;
    abiertos: number;
    enProceso: number;
    resueltos: number;
  }> {
    const impedimentos = await this.findAll(filters);

    return {
      total: impedimentos.length,
      abiertos: impedimentos.filter(i => i.estado === ImpedimentoEstado.ABIERTO).length,
      enProceso: impedimentos.filter(i => i.estado === ImpedimentoEstado.EN_PROCESO).length,
      resueltos: impedimentos.filter(i => i.estado === ImpedimentoEstado.RESUELTO).length,
    };
  }
}
