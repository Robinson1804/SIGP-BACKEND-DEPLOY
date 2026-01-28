import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pgd, PgdEstado } from '../entities/pgd.entity';
import { CreatePgdDto } from '../dto/create-pgd.dto';
import { UpdatePgdDto } from '../dto/update-pgd.dto';
import { FilterPgdDto } from '../dto/filter-pgd.dto';

@Injectable()
export class PgdService {
  constructor(
    @InjectRepository(Pgd)
    private readonly pgdRepository: Repository<Pgd>,
  ) {}

  /**
   * Genera automáticamente el nombre del PGD
   * Formato: "PGD XXXX - XXXX"
   */
  private generateNombre(anioInicio: number, anioFin: number): string {
    return `PGD ${anioInicio} - ${anioFin}`;
  }

  /**
   * Genera automáticamente la descripción del PGD
   * Formato: "Plan de Gobierno Digital XXXX-XXXX"
   */
  private generateDescripcion(anioInicio: number, anioFin: number): string {
    return `Plan de Gobierno Digital ${anioInicio}-${anioFin}`;
  }

  async create(createPgdDto: CreatePgdDto, userId?: number): Promise<Pgd> {
    if (createPgdDto.anioFin <= createPgdDto.anioInicio) {
      throw new ConflictException('El año de fin debe ser mayor al año de inicio');
    }

    // Validar que el PGD tenga exactamente 4 años
    if (createPgdDto.anioFin - createPgdDto.anioInicio !== 3) {
      throw new BadRequestException('El PGD debe tener exactamente 4 años (ejemplo: 2025-2028)');
    }

    // Validar que no exista solapamiento con otros PGDs
    // Un PGD no puede contener años que ya estén en otro PGD
    const overlappingPgd = await this.pgdRepository
      .createQueryBuilder('pgd')
      .where(
        // Detectar cualquier superposición de rangos
        // Nuevo inicio <= existente fin AND existente inicio <= nuevo fin
        'pgd.anioInicio <= :anioFin AND pgd.anioFin >= :anioInicio',
        {
          anioInicio: createPgdDto.anioInicio,
          anioFin: createPgdDto.anioFin,
        },
      )
      .getOne();

    if (overlappingPgd) {
      throw new ConflictException(
        `El rango ${createPgdDto.anioInicio}-${createPgdDto.anioFin} se superpone con el PGD existente ${overlappingPgd.anioInicio}-${overlappingPgd.anioFin}. Los años de un PGD no pueden estar contenidos en otro PGD.`,
      );
    }

    // Auto-generar nombre y descripción si no se proporcionan
    const nombre = createPgdDto.nombre || this.generateNombre(createPgdDto.anioInicio, createPgdDto.anioFin);
    const descripcion = createPgdDto.descripcion || this.generateDescripcion(createPgdDto.anioInicio, createPgdDto.anioFin);

    const pgd = this.pgdRepository.create({
      ...createPgdDto,
      nombre,
      descripcion,
      estado: createPgdDto.estado || PgdEstado.BORRADOR,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.pgdRepository.save(pgd);
  }

  async findAll(filterDto: FilterPgdDto): Promise<{ data: Pgd[]; total: number }> {
    const { estado, anio, activo, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.pgdRepository
      .createQueryBuilder('pgd')
      .orderBy('pgd.anioInicio', 'DESC');

    if (estado) {
      queryBuilder.andWhere('pgd.estado = :estado', { estado });
    }

    if (anio) {
      queryBuilder.andWhere(':anio BETWEEN pgd.anioInicio AND pgd.anioFin', { anio });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('pgd.activo = :activo', { activo });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number): Promise<Pgd> {
    const pgd = await this.pgdRepository.findOne({
      where: { id },
      relations: ['objetivosEstrategicos', 'objetivosGobiernoDigital'],
    });

    if (!pgd) {
      throw new NotFoundException(`PGD con ID ${id} no encontrado`);
    }

    return pgd;
  }

  async findVigente(): Promise<Pgd | null> {
    return this.pgdRepository.findOne({
      where: { estado: PgdEstado.VIGENTE, activo: true },
      relations: ['objetivosEstrategicos', 'objetivosGobiernoDigital'],
    });
  }

  async update(id: number, updatePgdDto: UpdatePgdDto, userId?: number): Promise<Pgd> {
    const pgd = await this.findOne(id);

    const anioInicio = updatePgdDto.anioInicio ?? pgd.anioInicio;
    const anioFin = updatePgdDto.anioFin ?? pgd.anioFin;

    if (anioFin <= anioInicio) {
      throw new ConflictException('El año de fin debe ser mayor al año de inicio');
    }

    // Validar que el PGD tenga exactamente 4 años
    if (anioFin - anioInicio !== 3) {
      throw new BadRequestException('El PGD debe tener exactamente 4 años (ejemplo: 2025-2028)');
    }

    // Validar que no exista solapamiento con otros PGDs (excluyendo el actual)
    if (updatePgdDto.anioInicio !== undefined || updatePgdDto.anioFin !== undefined) {
      const overlappingPgd = await this.pgdRepository
        .createQueryBuilder('pgd')
        .where(
          // Detectar cualquier superposición de rangos
          'pgd.anioInicio <= :anioFin AND pgd.anioFin >= :anioInicio',
          { anioInicio, anioFin },
        )
        .andWhere('pgd.id != :id', { id })
        .getOne();

      if (overlappingPgd) {
        throw new ConflictException(
          `El rango ${anioInicio}-${anioFin} se superpone con el PGD existente ${overlappingPgd.anioInicio}-${overlappingPgd.anioFin}. Los años de un PGD no pueden estar contenidos en otro PGD.`,
        );
      }
    }

    // Si cambian los años, regenerar nombre y descripción
    if (updatePgdDto.anioInicio !== undefined || updatePgdDto.anioFin !== undefined) {
      if (!updatePgdDto.nombre) {
        updatePgdDto.nombre = this.generateNombre(anioInicio, anioFin);
      }
      if (!updatePgdDto.descripcion) {
        updatePgdDto.descripcion = this.generateDescripcion(anioInicio, anioFin);
      }
    }

    Object.assign(pgd, updatePgdDto, { updatedBy: userId });
    return this.pgdRepository.save(pgd);
  }

  async remove(id: number, userId?: number): Promise<Pgd> {
    const pgd = await this.findOne(id);
    pgd.activo = false;
    pgd.updatedBy = userId;
    return this.pgdRepository.save(pgd);
  }

  async setVigente(id: number, userId?: number): Promise<Pgd> {
    const pgd = await this.findOne(id);

    // Desactivar otros PGDs vigentes
    await this.pgdRepository.update(
      { estado: PgdEstado.VIGENTE },
      { estado: PgdEstado.FINALIZADO, updatedBy: userId },
    );

    pgd.estado = PgdEstado.VIGENTE;
    pgd.updatedBy = userId;
    return this.pgdRepository.save(pgd);
  }

  /**
   * Eliminar PGD y todo su contenido (CASCADE)
   * Los proyectos y actividades se desvinculan (SET NULL)
   */
  async hardDelete(id: number): Promise<void> {
    const pgd = await this.findOne(id);
    await this.pgdRepository.remove(pgd);
  }
}
