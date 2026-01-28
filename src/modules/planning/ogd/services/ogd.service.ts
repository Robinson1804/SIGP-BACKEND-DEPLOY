import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ogd } from '../entities/ogd.entity';
import { OgdOei } from '../../entities/ogd-oei.entity';
import { CreateOgdDto } from '../dto/create-ogd.dto';
import { UpdateOgdDto } from '../dto/update-ogd.dto';

@Injectable()
export class OgdService {
  constructor(
    @InjectRepository(Ogd)
    private readonly ogdRepository: Repository<Ogd>,
    @InjectRepository(OgdOei)
    private readonly ogdOeiRepository: Repository<OgdOei>,
  ) {}

  /**
   * Genera el siguiente código OGD para un PGD dado
   * Formato: "OGD N°X" (ej: OGD N°1, OGD N°2)
   * Busca el máximo número existente (activos e inactivos) para evitar duplicados
   */
  private async generateCodigo(pgdId: number): Promise<string> {
    const ogds = await this.ogdRepository.find({
      where: { pgdId },
      select: ['codigo'],
    });

    let maxNum = 0;
    for (const ogd of ogds) {
      const match = ogd.codigo.match(/OGD\s*N°(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `OGD N°${maxNum + 1}`;
  }

  /**
   * Obtiene el siguiente código OGD disponible para un PGD
   * Este método es público para ser llamado desde el controlador
   */
  async getNextCodigo(pgdId: number): Promise<string> {
    return this.generateCodigo(pgdId);
  }

  /**
   * Genera el código del indicador automáticamente
   * Formato: "IND-OGD-X" (ej: IND-OGD-1, IND-OGD-2)
   */
  private async generateIndicadorCodigo(pgdId: number): Promise<string> {
    const ogds = await this.ogdRepository.find({
      where: { pgdId },
      select: ['indicadorCodigo'],
    });

    let maxNum = 0;
    for (const ogd of ogds) {
      if (ogd.indicadorCodigo) {
        const match = ogd.indicadorCodigo.match(/IND-OGD-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    }

    return `IND-OGD-${maxNum + 1}`;
  }

  async create(createOgdDto: CreateOgdDto, userId?: number): Promise<Ogd> {
    // Generar código si no se proporciona
    const codigo = createOgdDto.codigo || await this.generateCodigo(createOgdDto.pgdId);

    // Generar código del indicador si no se proporciona
    const indicadorCodigo = createOgdDto.indicadorCodigo || await this.generateIndicadorCodigo(createOgdDto.pgdId);

    // Validar que el código sea único DENTRO del mismo PGD (no globalmente)
    const existing = await this.ogdRepository.findOne({
      where: { codigo, pgdId: createOgdDto.pgdId },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un OGD con el código ${codigo} en este PGD`);
    }

    // Extraer oeiIds para manejar la relación M:N
    const { oeiIds, ...ogdData } = createOgdDto;

    const ogd = this.ogdRepository.create({
      ...ogdData,
      codigo,
      indicadorCodigo,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedOgd = await this.ogdRepository.save(ogd);

    // Crear relaciones M:N con OEIs
    if (oeiIds && oeiIds.length > 0) {
      await this.syncOeiRelations(savedOgd.id, oeiIds);
    }

    return this.findOne(savedOgd.id);
  }

  async findAll(pgdId?: number, activo?: boolean): Promise<Ogd[]> {
    const queryBuilder = this.ogdRepository
      .createQueryBuilder('ogd')
      .leftJoinAndSelect('ogd.pgd', 'pgd')
      .leftJoinAndSelect('ogd.ogdOeis', 'ogdOeis')
      .leftJoinAndSelect('ogdOeis.oei', 'oei')
      .orderBy('ogd.codigo', 'ASC');

    if (pgdId) {
      queryBuilder.andWhere('ogd.pgdId = :pgdId', { pgdId });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('ogd.activo = :activo', { activo });
    }

    return queryBuilder.getMany();
  }

  async findByPgd(pgdId: number): Promise<Ogd[]> {
    return this.ogdRepository.find({
      where: { pgdId, activo: true },
      relations: ['ogdOeis', 'ogdOeis.oei'],
      order: { codigo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Ogd> {
    const ogd = await this.ogdRepository.findOne({
      where: { id },
      relations: ['pgd', 'objetivosEspecificos', 'ogdOeis', 'ogdOeis.oei'],
    });

    if (!ogd) {
      throw new NotFoundException(`OGD con ID ${id} no encontrado`);
    }

    return ogd;
  }

  async update(id: number, updateOgdDto: UpdateOgdDto, userId?: number): Promise<Ogd> {
    const ogd = await this.findOne(id);

    // Validar que el código sea único DENTRO del mismo PGD (no globalmente)
    if (updateOgdDto.codigo && updateOgdDto.codigo !== ogd.codigo) {
      const existing = await this.ogdRepository.findOne({
        where: { codigo: updateOgdDto.codigo, pgdId: ogd.pgdId },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un OGD con el código ${updateOgdDto.codigo} en este PGD`);
      }
    }

    // Extraer oeiIds para manejar la relación M:N
    const { oeiIds, ...ogdData } = updateOgdDto;

    Object.assign(ogd, ogdData, { updatedBy: userId });
    await this.ogdRepository.save(ogd);

    // Actualizar relaciones M:N con OEIs si se proporcionan
    if (oeiIds !== undefined) {
      await this.syncOeiRelations(id, oeiIds);
    }

    return this.findOne(id);
  }

  async remove(id: number, userId?: number): Promise<Ogd> {
    const ogd = await this.findOne(id);
    ogd.activo = false;
    ogd.updatedBy = userId;
    return this.ogdRepository.save(ogd);
  }

  /**
   * Sincroniza las relaciones M:N entre OGD y OEIs
   */
  private async syncOeiRelations(ogdId: number, oeiIds: number[]): Promise<void> {
    // Eliminar relaciones existentes
    await this.ogdOeiRepository.delete({ ogdId });

    // Crear nuevas relaciones
    if (oeiIds.length > 0) {
      const relations = oeiIds.map(oeiId =>
        this.ogdOeiRepository.create({ ogdId, oeiId })
      );
      await this.ogdOeiRepository.save(relations);
    }
  }

  /**
   * Obtiene los IDs de OEIs relacionados con un OGD
   */
  async getOeiIds(ogdId: number): Promise<number[]> {
    const relations = await this.ogdOeiRepository.find({
      where: { ogdId },
      select: ['oeiId'],
    });
    return relations.map(r => r.oeiId);
  }
}
