import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oei } from '../entities/oei.entity';
import { Pgd } from '../../pgd/entities/pgd.entity';
import { CreateOeiDto, MetaAnualDto } from '../dto/create-oei.dto';
import { UpdateOeiDto } from '../dto/update-oei.dto';

@Injectable()
export class OeiService {
  constructor(
    @InjectRepository(Oei)
    private readonly oeiRepository: Repository<Oei>,
    @InjectRepository(Pgd)
    private readonly pgdRepository: Repository<Pgd>,
  ) {}

  /**
   * Genera el siguiente código OEI para un PGD dado
   * Formato: "OEI N°X" (ej: OEI N°1, OEI N°2)
   * Busca el máximo número existente (activos e inactivos) para evitar duplicados
   */
  private async generateCodigo(pgdId: number): Promise<string> {
    const oeis = await this.oeiRepository.find({
      where: { pgdId },
      select: ['codigo'],
    });

    let maxNum = 0;
    for (const oei of oeis) {
      const match = oei.codigo.match(/OEI\s*N°(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `OEI N°${maxNum + 1}`;
  }

  /**
   * Genera el código del indicador automáticamente
   * Formato: "IND-OEI-001"
   * Busca el máximo número existente para evitar duplicados
   */
  private async generateIndicadorCodigo(pgdId: number): Promise<string> {
    const oeis = await this.oeiRepository.find({
      where: { pgdId },
      select: ['indicadorCodigo'],
    });

    let maxNum = 0;
    for (const oei of oeis) {
      if (oei.indicadorCodigo) {
        const match = oei.indicadorCodigo.match(/IND-OEI-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    }

    return `IND-OEI-${String(maxNum + 1).padStart(3, '0')}`;
  }

  /**
   * Obtiene el siguiente código OEI disponible para un PGD
   * Este método es público para ser llamado desde el controlador
   */
  async getNextCodigo(pgdId: number): Promise<string> {
    return this.generateCodigo(pgdId);
  }

  /**
   * Valida que todas las metas anuales estén dentro del rango del PGD
   */
  private async validateMetasAnualesRange(pgdId: number, metasAnuales?: MetaAnualDto[]): Promise<void> {
    if (!metasAnuales || metasAnuales.length === 0) return;

    const pgd = await this.pgdRepository.findOne({ where: { id: pgdId } });
    if (!pgd) {
      throw new NotFoundException(`PGD con ID ${pgdId} no encontrado`);
    }

    for (const meta of metasAnuales) {
      if (meta.anio < pgd.anioInicio || meta.anio > pgd.anioFin) {
        throw new BadRequestException(
          `El año ${meta.anio} de las metas anuales debe estar dentro del rango del PGD (${pgd.anioInicio}-${pgd.anioFin})`
        );
      }
    }
  }

  async create(createOeiDto: CreateOeiDto, userId?: number): Promise<Oei> {
    // Validar que las metas anuales estén dentro del rango del PGD
    await this.validateMetasAnualesRange(createOeiDto.pgdId, createOeiDto.metasAnuales);

    // Generar código si no se proporciona
    const codigo = createOeiDto.codigo || await this.generateCodigo(createOeiDto.pgdId);

    // Generar código del indicador si no se proporciona
    const indicadorCodigo = createOeiDto.indicadorCodigo || await this.generateIndicadorCodigo(createOeiDto.pgdId);

    // Validar que el código sea único DENTRO del mismo PGD (no globalmente)
    const existing = await this.oeiRepository.findOne({
      where: { codigo, pgdId: createOeiDto.pgdId },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un OEI con el código ${codigo} en este PGD`);
    }

    const oei = this.oeiRepository.create({
      ...createOeiDto,
      codigo,
      indicadorCodigo,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.oeiRepository.save(oei);
  }

  async findAll(pgdId?: number, activo?: boolean): Promise<Oei[]> {
    const queryBuilder = this.oeiRepository
      .createQueryBuilder('oei')
      .leftJoinAndSelect('oei.pgd', 'pgd')
      .orderBy('oei.codigo', 'ASC');

    if (pgdId) {
      queryBuilder.andWhere('oei.pgdId = :pgdId', { pgdId });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('oei.activo = :activo', { activo });
    }

    return queryBuilder.getMany();
  }

  async findByPgd(pgdId: number): Promise<Oei[]> {
    return this.oeiRepository.find({
      where: { pgdId, activo: true },
      order: { codigo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Oei> {
    const oei = await this.oeiRepository.findOne({
      where: { id },
      relations: ['pgd'],
    });

    if (!oei) {
      throw new NotFoundException(`OEI con ID ${id} no encontrado`);
    }

    return oei;
  }

  async update(id: number, updateOeiDto: UpdateOeiDto, userId?: number): Promise<Oei> {
    const oei = await this.findOne(id);

    // Validar metas anuales si se actualizan (pgdId no cambia en update)
    if (updateOeiDto.metasAnuales) {
      await this.validateMetasAnualesRange(oei.pgdId, updateOeiDto.metasAnuales);
    }

    // Validar que el código sea único DENTRO del mismo PGD (no globalmente)
    if (updateOeiDto.codigo && updateOeiDto.codigo !== oei.codigo) {
      const existing = await this.oeiRepository.findOne({
        where: { codigo: updateOeiDto.codigo, pgdId: oei.pgdId },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un OEI con el código ${updateOeiDto.codigo} en este PGD`);
      }
    }

    Object.assign(oei, updateOeiDto, { updatedBy: userId });
    return this.oeiRepository.save(oei);
  }

  async remove(id: number, userId?: number): Promise<Oei> {
    const oei = await this.findOne(id);
    oei.activo = false;
    oei.updatedBy = userId;
    return this.oeiRepository.save(oei);
  }
}
