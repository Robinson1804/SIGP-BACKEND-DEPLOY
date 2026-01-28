import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccionEstrategica } from '../entities/accion-estrategica.entity';
import { CreateAccionEstrategicaDto } from '../dto/create-accion-estrategica.dto';
import { UpdateAccionEstrategicaDto } from '../dto/update-accion-estrategica.dto';

@Injectable()
export class AccionEstrategicaService {
  constructor(
    @InjectRepository(AccionEstrategica)
    private readonly accionEstrategicaRepository: Repository<AccionEstrategica>,
  ) {}

  /**
   * Genera el siguiente código AE para un OEGD dado
   * Formato: "AE N°X" (ej: AE N°1, AE N°2, AE N°3)
   * La secuencia es por OEGD, permitiendo que diferentes OEGDs tengan AE N°1
   * Busca el máximo número existente (activos e inactivos) para evitar duplicados
   */
  private async generateCodigo(oegdId: number): Promise<string> {
    const acciones = await this.accionEstrategicaRepository.find({
      where: { oegdId },
      select: ['codigo'],
    });

    let maxNum = 0;
    for (const accion of acciones) {
      const match = accion.codigo.match(/AE\s*N°(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `AE N°${maxNum + 1}`;
  }

  /**
   * Obtiene el siguiente código AE disponible para un OEGD
   * Este método es público para ser llamado desde el controlador
   */
  async getNextCodigo(oegdId: number): Promise<string> {
    return this.generateCodigo(oegdId);
  }

  async create(createDto: CreateAccionEstrategicaDto, userId?: number): Promise<AccionEstrategica> {
    // Generar código si no se proporciona (secuencia por OEGD)
    const codigo = createDto.codigo || await this.generateCodigo(createDto.oegdId);

    // Validar que el código sea único DENTRO del mismo OEGD (no globalmente)
    const existing = await this.accionEstrategicaRepository.findOne({
      where: { codigo, oegdId: createDto.oegdId },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una Acción Estratégica con el código ${codigo} en este OEGD`);
    }

    const accion = this.accionEstrategicaRepository.create({
      ...createDto,
      codigo,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.accionEstrategicaRepository.save(accion);
  }

  async findAll(oegdId?: number, activo?: boolean, pgdId?: number): Promise<AccionEstrategica[]> {
    const queryBuilder = this.accionEstrategicaRepository
      .createQueryBuilder('ae')
      .leftJoinAndSelect('ae.oegd', 'oegd')
      .leftJoinAndSelect('oegd.ogd', 'ogd')
      // Incluir AEIs vinculados para mostrar OEI
      .leftJoinAndSelect('oegd.oegdAeis', 'oegdAeis')
      .leftJoinAndSelect('oegdAeis.aei', 'aei')
      .leftJoinAndSelect('aei.oei', 'oei')
      .orderBy('ae.codigo', 'ASC');

    if (oegdId) {
      queryBuilder.andWhere('ae.oegdId = :oegdId', { oegdId });
    }

    // Filtrar por PGD a través de la cadena: AE -> OEGD -> OGD -> PGD
    if (pgdId) {
      queryBuilder.andWhere('ogd.pgdId = :pgdId', { pgdId });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('ae.activo = :activo', { activo });
    }

    return queryBuilder.getMany();
  }

  async findByOegd(oegdId: number): Promise<AccionEstrategica[]> {
    return this.accionEstrategicaRepository.find({
      where: { oegdId, activo: true },
      order: { codigo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<AccionEstrategica> {
    const accion = await this.accionEstrategicaRepository.findOne({
      where: { id },
      relations: ['oegd', 'oegd.ogd'],
    });

    if (!accion) {
      throw new NotFoundException(`Acción Estratégica con ID ${id} no encontrada`);
    }

    return accion;
  }

  async update(id: number, updateDto: UpdateAccionEstrategicaDto, userId?: number): Promise<AccionEstrategica> {
    const accion = await this.findOne(id);

    // Validar que el código sea único DENTRO del mismo OEGD (no globalmente)
    if (updateDto.codigo && updateDto.codigo !== accion.codigo) {
      const existing = await this.accionEstrategicaRepository.findOne({
        where: { codigo: updateDto.codigo, oegdId: accion.oegdId },
      });
      if (existing) {
        throw new ConflictException(`Ya existe una Acción Estratégica con el código ${updateDto.codigo} en este OEGD`);
      }
    }

    Object.assign(accion, updateDto, { updatedBy: userId });
    return this.accionEstrategicaRepository.save(accion);
  }

  async remove(id: number, userId?: number): Promise<AccionEstrategica> {
    const accion = await this.findOne(id);
    accion.activo = false;
    accion.updatedBy = userId;
    return this.accionEstrategicaRepository.save(accion);
  }
}
