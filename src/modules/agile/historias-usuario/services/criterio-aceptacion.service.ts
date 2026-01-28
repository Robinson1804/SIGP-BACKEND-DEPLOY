import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CriterioAceptacion } from '../entities/criterio-aceptacion.entity';
import { HistoriaUsuario } from '../entities/historia-usuario.entity';
import { CreateCriterioAceptacionDto } from '../dto/create-criterio-aceptacion.dto';
import { UpdateCriterioAceptacionDto } from '../dto/update-criterio-aceptacion.dto';
import { ReordenarCriteriosDto } from '../dto/reordenar-criterios.dto';

@Injectable()
export class CriterioAceptacionService {
  constructor(
    @InjectRepository(CriterioAceptacion)
    private readonly criterioRepository: Repository<CriterioAceptacion>,
    @InjectRepository(HistoriaUsuario)
    private readonly huRepository: Repository<HistoriaUsuario>,
  ) {}

  /**
   * Crear un nuevo criterio de aceptacion
   */
  async create(
    createDto: CreateCriterioAceptacionDto,
    userId?: number,
  ): Promise<CriterioAceptacion> {
    // Verificar que la Historia de Usuario existe
    const hu = await this.huRepository.findOne({
      where: { id: createDto.historiaUsuarioId, activo: true },
    });

    if (!hu) {
      throw new NotFoundException(
        `Historia de Usuario con ID ${createDto.historiaUsuarioId} no encontrada`,
      );
    }

    // Si no se provee orden, calcular el siguiente
    let orden = createDto.orden;
    if (orden === undefined || orden === null) {
      const maxOrdenResult = await this.criterioRepository
        .createQueryBuilder('criterio')
        .select('MAX(criterio.orden)', 'maxOrden')
        .where('criterio.historiaUsuarioId = :huId', { huId: createDto.historiaUsuarioId })
        .andWhere('criterio.activo = :activo', { activo: true })
        .getRawOne();

      orden = (maxOrdenResult?.maxOrden || 0) + 1;
    }

    const criterio = this.criterioRepository.create({
      ...createDto,
      orden,
    });

    return this.criterioRepository.save(criterio);
  }

  /**
   * Listar todos los criterios, opcionalmente filtrados por Historia de Usuario
   */
  async findAll(historiaUsuarioId?: number): Promise<CriterioAceptacion[]> {
    const queryBuilder = this.criterioRepository
      .createQueryBuilder('criterio')
      .leftJoinAndSelect('criterio.historiaUsuario', 'hu')
      .where('criterio.activo = :activo', { activo: true })
      .orderBy('criterio.orden', 'ASC');

    if (historiaUsuarioId) {
      queryBuilder.andWhere('criterio.historiaUsuarioId = :huId', {
        huId: historiaUsuarioId,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * Obtener un criterio por ID
   */
  async findOne(id: number): Promise<CriterioAceptacion> {
    const criterio = await this.criterioRepository.findOne({
      where: { id, activo: true },
      relations: ['historiaUsuario'],
    });

    if (!criterio) {
      throw new NotFoundException(`Criterio de Aceptacion con ID ${id} no encontrado`);
    }

    return criterio;
  }

  /**
   * Listar criterios de una Historia de Usuario ordenados por 'orden'
   */
  async findByHistoriaUsuario(huId: number): Promise<CriterioAceptacion[]> {
    // Verificar que la HU existe
    const hu = await this.huRepository.findOne({
      where: { id: huId, activo: true },
    });

    if (!hu) {
      throw new NotFoundException(`Historia de Usuario con ID ${huId} no encontrada`);
    }

    return this.criterioRepository.find({
      where: { historiaUsuarioId: huId, activo: true },
      order: { orden: 'ASC' },
    });
  }

  /**
   * Actualizar un criterio de aceptacion
   */
  async update(
    id: number,
    updateDto: UpdateCriterioAceptacionDto,
    userId?: number,
  ): Promise<CriterioAceptacion> {
    const criterio = await this.findOne(id);

    Object.assign(criterio, updateDto);

    return this.criterioRepository.save(criterio);
  }

  /**
   * Reordenar multiples criterios de una Historia de Usuario
   */
  async reordenar(
    huId: number,
    reordenarDto: ReordenarCriteriosDto,
    userId?: number,
  ): Promise<CriterioAceptacion[]> {
    // Verificar que la HU existe
    const hu = await this.huRepository.findOne({
      where: { id: huId, activo: true },
    });

    if (!hu) {
      throw new NotFoundException(`Historia de Usuario con ID ${huId} no encontrada`);
    }

    // Validar que todos los criterios pertenecen a esta HU
    const criterioIds = reordenarDto.criterios.map((c) => c.criterioId);
    const criteriosExistentes = await this.criterioRepository.find({
      where: { historiaUsuarioId: huId, activo: true },
    });

    const criteriosExistentesIds = criteriosExistentes.map((c) => c.id);
    const criteriosNoValidos = criterioIds.filter(
      (id) => !criteriosExistentesIds.includes(id),
    );

    if (criteriosNoValidos.length > 0) {
      throw new BadRequestException(
        `Los siguientes criterios no pertenecen a esta Historia de Usuario o no existen: ${criteriosNoValidos.join(', ')}`,
      );
    }

    // Actualizar el orden de cada criterio
    for (const item of reordenarDto.criterios) {
      await this.criterioRepository.update(
        { id: item.criterioId, historiaUsuarioId: huId },
        { orden: item.nuevoOrden },
      );
    }

    // Retornar los criterios actualizados
    return this.findByHistoriaUsuario(huId);
  }

  /**
   * Eliminar un criterio de aceptacion (soft delete)
   * No permite eliminar si es el unico criterio de la HU
   */
  async remove(id: number, userId?: number): Promise<CriterioAceptacion> {
    const criterio = await this.findOne(id);

    // Contar cuantos criterios activos tiene la HU
    const countCriterios = await this.criterioRepository.count({
      where: {
        historiaUsuarioId: criterio.historiaUsuarioId,
        activo: true,
      },
    });

    if (countCriterios <= 1) {
      throw new BadRequestException(
        'No se puede eliminar el unico criterio de aceptacion de una Historia de Usuario. ' +
          'Una HU debe tener al menos un criterio de aceptacion.',
      );
    }

    criterio.activo = false;

    return this.criterioRepository.save(criterio);
  }

  /**
   * Crear un criterio directamente para una HU (desde endpoint anidado)
   */
  async createForHu(
    huId: number,
    createDto: Omit<CreateCriterioAceptacionDto, 'historiaUsuarioId'>,
    userId?: number,
  ): Promise<CriterioAceptacion> {
    return this.create(
      {
        ...createDto,
        historiaUsuarioId: huId,
      } as CreateCriterioAceptacionDto,
      userId,
    );
  }
}
