import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aei } from '../entities/aei.entity';
import { CreateAeiDto } from '../dto/create-aei.dto';
import { UpdateAeiDto } from '../dto/update-aei.dto';
import { Oei } from '../../oei/entities/oei.entity';

@Injectable()
export class AeiService {
  constructor(
    @InjectRepository(Aei)
    private readonly aeiRepository: Repository<Aei>,
    @InjectRepository(Oei)
    private readonly oeiRepository: Repository<Oei>,
  ) {}

  /**
   * Genera el siguiente código AEI para un OEI dado
   * Formato: "AEI N°X.Y" (ej: AEI N°1.1, AEI N°1.2 para OEI N°1; AEI N°2.1 para OEI N°2)
   * Busca el máximo número existente (activos e inactivos) para evitar duplicados
   */
  private async generateCodigo(oeiId: number, oei: Oei): Promise<string> {
    // Extraer el número del código OEI (ej: "1" de "OEI N°1" o "001" de "OEI-001")
    const oeiNumMatch = oei.codigo.match(/OEI\s*N°(\d+)/i) || oei.codigo.match(/OEI-(\d+)/);
    const oeiNum = oeiNumMatch ? parseInt(oeiNumMatch[1], 10) : oeiId;

    // Buscar el máximo número secuencial para este OEI
    const aeis = await this.aeiRepository.find({
      where: { oeiId },
      select: ['codigo'],
    });

    let maxSeq = 0;
    const pattern = new RegExp(`AEI\\s*N°${oeiNum}\\.(\\d+)`, 'i');
    for (const aei of aeis) {
      const match = aei.codigo.match(pattern);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }

    return `AEI N°${oeiNum}.${maxSeq + 1}`;
  }

  /**
   * Genera el código del indicador automáticamente
   * Formato: "IND-AEI-X.Y" (ej: IND-AEI-1.1, IND-AEI-1.2)
   * Busca el máximo número existente para evitar duplicados
   */
  private async generateIndicadorCodigo(oeiId: number, oei: Oei): Promise<string> {
    // Extraer el número del código OEI
    const oeiNumMatch = oei.codigo.match(/OEI\s*N°(\d+)/i) || oei.codigo.match(/OEI-(\d+)/);
    const oeiNum = oeiNumMatch ? parseInt(oeiNumMatch[1], 10) : oeiId;

    // Buscar el máximo número secuencial para este OEI
    const aeis = await this.aeiRepository.find({
      where: { oeiId },
      select: ['indicadorCodigo'],
    });

    let maxSeq = 0;
    const pattern = new RegExp(`IND-AEI-${oeiNum}\\.(\\d+)`, 'i');
    for (const aei of aeis) {
      if (aei.indicadorCodigo) {
        const match = aei.indicadorCodigo.match(pattern);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }
    }

    return `IND-AEI-${oeiNum}.${maxSeq + 1}`;
  }

  /**
   * Obtiene el siguiente código AEI disponible para un OEI
   * Este método es público para ser llamado desde el controlador
   */
  async getNextCodigo(oeiId: number): Promise<string> {
    const oei = await this.oeiRepository.findOne({
      where: { id: oeiId },
    });
    if (!oei) {
      throw new NotFoundException(`OEI con ID ${oeiId} no encontrado`);
    }
    return this.generateCodigo(oeiId, oei);
  }

  async create(createAeiDto: CreateAeiDto, userId?: number): Promise<Aei> {
    // Verificar que el OEI existe
    const oei = await this.oeiRepository.findOne({
      where: { id: createAeiDto.oeiId },
    });
    if (!oei) {
      throw new NotFoundException(`OEI con ID ${createAeiDto.oeiId} no encontrado`);
    }

    // Generar código si no se proporciona
    const codigo = createAeiDto.codigo || await this.generateCodigo(createAeiDto.oeiId, oei);

    // Generar código del indicador si no se proporciona
    const indicadorCodigo = createAeiDto.indicadorCodigo || await this.generateIndicadorCodigo(createAeiDto.oeiId, oei);

    // Verificar que el código no existe DENTRO del mismo OEI (no globalmente)
    const existing = await this.aeiRepository.findOne({
      where: { codigo, oeiId: createAeiDto.oeiId },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una AEI con el código ${codigo} en este OEI`);
    }

    const aei = this.aeiRepository.create({
      ...createAeiDto,
      codigo,
      indicadorCodigo,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.aeiRepository.save(aei);
  }

  async findAll(oeiId?: number, activo?: boolean): Promise<Aei[]> {
    const queryBuilder = this.aeiRepository
      .createQueryBuilder('aei')
      .leftJoinAndSelect('aei.oei', 'oei')
      .orderBy('aei.codigo', 'ASC');

    if (oeiId) {
      queryBuilder.andWhere('aei.oeiId = :oeiId', { oeiId });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('aei.activo = :activo', { activo });
    }

    return queryBuilder.getMany();
  }

  async findByOei(oeiId: number): Promise<Aei[]> {
    return this.aeiRepository.find({
      where: { oeiId, activo: true },
      order: { codigo: 'ASC' },
    });
  }

  async findByOeis(oeiIds: number[]): Promise<Aei[]> {
    if (!oeiIds || oeiIds.length === 0) {
      return [];
    }

    return this.aeiRepository
      .createQueryBuilder('aei')
      .leftJoinAndSelect('aei.oei', 'oei')
      .where('aei.oeiId IN (:...oeiIds)', { oeiIds })
      .andWhere('aei.activo = true')
      .orderBy('aei.codigo', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Aei> {
    const aei = await this.aeiRepository.findOne({
      where: { id },
      relations: ['oei'],
    });

    if (!aei) {
      throw new NotFoundException(`AEI con ID ${id} no encontrada`);
    }

    return aei;
  }

  async update(id: number, updateAeiDto: UpdateAeiDto, userId?: number): Promise<Aei> {
    const aei = await this.findOne(id);

    // Validar que el código sea único DENTRO del mismo OEI (no globalmente)
    if (updateAeiDto.codigo && updateAeiDto.codigo !== aei.codigo) {
      const existing = await this.aeiRepository.findOne({
        where: { codigo: updateAeiDto.codigo, oeiId: aei.oeiId },
      });
      if (existing) {
        throw new ConflictException(`Ya existe una AEI con el código ${updateAeiDto.codigo} en este OEI`);
      }
    }

    Object.assign(aei, updateAeiDto, { updatedBy: userId });
    return this.aeiRepository.save(aei);
  }

  async remove(id: number, userId?: number): Promise<Aei> {
    const aei = await this.findOne(id);
    aei.activo = false;
    aei.updatedBy = userId;
    return this.aeiRepository.save(aei);
  }

  async hardDelete(id: number): Promise<void> {
    const aei = await this.findOne(id);
    await this.aeiRepository.remove(aei);
  }
}
