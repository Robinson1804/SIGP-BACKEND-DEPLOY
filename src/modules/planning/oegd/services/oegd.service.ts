import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Oegd } from '../entities/oegd.entity';
import { OegdAei } from '../../entities/oegd-aei.entity';
import { Aei } from '../../aei/entities/aei.entity';
import { Ogd } from '../../ogd/entities/ogd.entity';
import { CreateOegdDto } from '../dto/create-oegd.dto';
import { UpdateOegdDto } from '../dto/update-oegd.dto';

@Injectable()
export class OegdService {
  constructor(
    @InjectRepository(Oegd)
    private readonly oegdRepository: Repository<Oegd>,
    @InjectRepository(OegdAei)
    private readonly oegdAeiRepository: Repository<OegdAei>,
    @InjectRepository(Aei)
    private readonly aeiRepository: Repository<Aei>,
    @InjectRepository(Ogd)
    private readonly ogdRepository: Repository<Ogd>,
  ) {}

  /**
   * Valida que todos los AEIs seleccionados pertenezcan al mismo OEI
   */
  private async validateAeisSameOei(aeiIds: number[]): Promise<void> {
    if (!aeiIds || aeiIds.length === 0) return;

    const aeis = await this.aeiRepository.find({
      where: { id: In(aeiIds) },
      select: ['id', 'oeiId'],
    });

    if (aeis.length !== aeiIds.length) {
      throw new BadRequestException('Algunos AEIs no fueron encontrados');
    }

    const uniqueOeiIds = [...new Set(aeis.map(aei => aei.oeiId))];
    if (uniqueOeiIds.length > 1) {
      throw new BadRequestException(
        'Todos los AEIs seleccionados deben pertenecer al mismo OEI. No se pueden mezclar AEIs de diferentes OEIs.'
      );
    }
  }

  /**
   * Genera el siguiente código OEGD para un OGD dado
   * Formato: "OEGD N°X.Y" (ej: OEGD N°1.1, OEGD N°1.2 para OGD N°1)
   * Busca el máximo número existente (activos e inactivos) para evitar duplicados
   */
  private async generateCodigo(ogdId: number, ogd: Ogd): Promise<string> {
    // Extraer el número del código OGD (ej: "1" de "OGD N°1")
    const ogdNumMatch = ogd.codigo.match(/OGD\s*N°(\d+)/i) || ogd.codigo.match(/OGD-(\d+)/);
    const ogdNum = ogdNumMatch ? parseInt(ogdNumMatch[1], 10) : ogdId;

    // Buscar el máximo número secuencial para este OGD
    const oegds = await this.oegdRepository.find({
      where: { ogdId },
      select: ['codigo'],
    });

    let maxSeq = 0;
    const pattern = new RegExp(`OEGD\\s*N°${ogdNum}\\.(\\d+)`, 'i');
    for (const oegd of oegds) {
      const match = oegd.codigo.match(pattern);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }

    return `OEGD N°${ogdNum}.${maxSeq + 1}`;
  }

  /**
   * Obtiene el siguiente código OEGD disponible para un OGD
   * Este método es público para ser llamado desde el controlador
   */
  async getNextCodigo(ogdId: number): Promise<string> {
    const ogd = await this.ogdRepository.findOne({
      where: { id: ogdId },
    });
    if (!ogd) {
      throw new NotFoundException(`OGD con ID ${ogdId} no encontrado`);
    }
    return this.generateCodigo(ogdId, ogd);
  }

  async create(createOegdDto: CreateOegdDto, userId?: number): Promise<Oegd> {
    // Validar que todos los AEIs pertenezcan al mismo OEI
    if (createOegdDto.aeiIds && createOegdDto.aeiIds.length > 0) {
      await this.validateAeisSameOei(createOegdDto.aeiIds);
    }

    // Obtener OGD para generar el código correcto
    const ogd = await this.ogdRepository.findOne({
      where: { id: createOegdDto.ogdId },
    });
    if (!ogd) {
      throw new NotFoundException(`OGD con ID ${createOegdDto.ogdId} no encontrado`);
    }

    // Generar código si no se proporciona
    const codigo = createOegdDto.codigo || await this.generateCodigo(createOegdDto.ogdId, ogd);

    // Validar que el código sea único DENTRO del mismo OGD (no globalmente)
    const existing = await this.oegdRepository.findOne({
      where: { codigo, ogdId: createOegdDto.ogdId },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un OEGD con el código ${codigo} en este OGD`);
    }

    // Extraer aeiIds para manejar la relación M:N
    const { aeiIds, ...oegdData } = createOegdDto;

    const oegd = this.oegdRepository.create({
      ...oegdData,
      codigo,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedOegd = await this.oegdRepository.save(oegd);

    // Crear relaciones M:N con AEIs
    if (aeiIds && aeiIds.length > 0) {
      await this.syncAeiRelations(savedOegd.id, aeiIds);
    }

    return this.findOne(savedOegd.id);
  }

  async findAll(ogdId?: number, activo?: boolean, pgdId?: number): Promise<Oegd[]> {
    const queryBuilder = this.oegdRepository
      .createQueryBuilder('oegd')
      .leftJoinAndSelect('oegd.ogd', 'ogd')
      .leftJoinAndSelect('oegd.oegdAeis', 'oegdAeis')
      .leftJoinAndSelect('oegdAeis.aei', 'aei')
      .orderBy('oegd.codigo', 'ASC');

    if (ogdId) {
      queryBuilder.andWhere('oegd.ogdId = :ogdId', { ogdId });
    }

    // Filtrar por PGD a través de la cadena: OEGD -> OGD -> PGD
    if (pgdId) {
      queryBuilder.andWhere('ogd.pgdId = :pgdId', { pgdId });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('oegd.activo = :activo', { activo });
    }

    return queryBuilder.getMany();
  }

  async findByOgd(ogdId: number): Promise<Oegd[]> {
    return this.oegdRepository.find({
      where: { ogdId, activo: true },
      relations: ['oegdAeis', 'oegdAeis.aei'],
      order: { codigo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Oegd> {
    const oegd = await this.oegdRepository.findOne({
      where: { id },
      relations: ['ogd', 'accionesEstrategicas', 'oegdAeis', 'oegdAeis.aei'],
    });

    if (!oegd) {
      throw new NotFoundException(`OEGD con ID ${id} no encontrado`);
    }

    return oegd;
  }

  async update(id: number, updateOegdDto: UpdateOegdDto, userId?: number): Promise<Oegd> {
    const oegd = await this.findOne(id);

    // Validar que todos los AEIs pertenezcan al mismo OEI
    if (updateOegdDto.aeiIds && updateOegdDto.aeiIds.length > 0) {
      await this.validateAeisSameOei(updateOegdDto.aeiIds);
    }

    // Validar que el código sea único DENTRO del mismo OGD (no globalmente)
    if (updateOegdDto.codigo && updateOegdDto.codigo !== oegd.codigo) {
      const existing = await this.oegdRepository.findOne({
        where: { codigo: updateOegdDto.codigo, ogdId: oegd.ogdId },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un OEGD con el código ${updateOegdDto.codigo} en este OGD`);
      }
    }

    // Extraer aeiIds para manejar la relación M:N
    const { aeiIds, ...oegdData } = updateOegdDto;

    Object.assign(oegd, oegdData, { updatedBy: userId });
    await this.oegdRepository.save(oegd);

    // Actualizar relaciones M:N con AEIs si se proporcionan
    if (aeiIds !== undefined) {
      await this.syncAeiRelations(id, aeiIds);
    }

    return this.findOne(id);
  }

  async remove(id: number, userId?: number): Promise<Oegd> {
    const oegd = await this.findOne(id);
    oegd.activo = false;
    oegd.updatedBy = userId;
    return this.oegdRepository.save(oegd);
  }

  /**
   * Sincroniza las relaciones M:N entre OEGD y AEIs
   */
  private async syncAeiRelations(oegdId: number, aeiIds: number[]): Promise<void> {
    // Eliminar relaciones existentes
    await this.oegdAeiRepository.delete({ oegdId });

    // Crear nuevas relaciones
    if (aeiIds.length > 0) {
      const relations = aeiIds.map(aeiId =>
        this.oegdAeiRepository.create({ oegdId, aeiId })
      );
      await this.oegdAeiRepository.save(relations);
    }
  }

  /**
   * Obtiene los IDs de AEIs relacionadas con un OEGD
   */
  async getAeiIds(oegdId: number): Promise<number[]> {
    const relations = await this.oegdAeiRepository.find({
      where: { oegdId },
      select: ['aeiId'],
    });
    return relations.map(r => r.aeiId);
  }
}
