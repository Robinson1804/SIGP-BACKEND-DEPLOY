import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Division } from '../entities/division.entity';
import { Personal } from '../../personal/entities/personal.entity';
import { CreateDivisionDto } from '../dto/create-division.dto';
import { UpdateDivisionDto } from '../dto/update-division.dto';
import { DivisionTreeResponseDto } from '../dto/division-response.dto';
import { UsuariosService } from '../../../auth/services/usuarios.service';
import { Role } from '../../../../common/constants/roles.constant';

@Injectable()
export class DivisionService {
  constructor(
    @InjectRepository(Division)
    private readonly divisionRepository: Repository<Division>,
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
    @Inject(forwardRef(() => UsuariosService))
    private readonly usuariosService: UsuariosService,
  ) {}

  async create(createDto: CreateDivisionDto, userId?: number): Promise<Division> {
    // Check for duplicate code
    const existing = await this.divisionRepository.findOne({
      where: { codigo: createDto.codigo },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una división con el código ${createDto.codigo}`);
    }

    // Validate parent division exists if provided
    if (createDto.divisionPadreId) {
      const padre = await this.divisionRepository.findOne({
        where: { id: createDto.divisionPadreId },
      });
      if (!padre) {
        throw new BadRequestException(`División padre con ID ${createDto.divisionPadreId} no encontrada`);
      }
    }

    const division = this.divisionRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.divisionRepository.save(division);
  }

  async findAll(activo?: boolean): Promise<(Division & { totalPersonal: number })[]> {
    const queryBuilder = this.divisionRepository
      .createQueryBuilder('division')
      .leftJoinAndSelect('division.jefe', 'jefe')
      .leftJoinAndSelect('division.coordinador', 'coordinador')
      .leftJoinAndSelect('division.scrumMasters', 'scrumMasters')
      .leftJoinAndSelect('division.divisionPadre', 'padre')
      .orderBy('division.codigo', 'ASC');

    if (activo !== undefined) {
      queryBuilder.andWhere('division.activo = :activo', { activo });
    }

    const divisiones = await queryBuilder.getMany();

    // Para cada división, obtener el personal activo y calcular totalPersonal
    // incluyendo coordinador, scrum masters y miembros del equipo (sin duplicados)
    const divisionesConTotal = await Promise.all(
      divisiones.map(async (division) => {
        // Usar Set para evitar duplicados
        const personalIds = new Set<number>();

        // 1. Agregar coordinador si existe y está activo
        if (division.coordinador && division.coordinador.activo !== false) {
          personalIds.add(division.coordinador.id);
        }

        // 2. Agregar scrum masters activos
        if (division.scrumMasters) {
          division.scrumMasters.forEach((sm) => {
            if (sm.activo !== false) {
              personalIds.add(sm.id);
            }
          });
        }

        // 3. Agregar miembros del equipo (personal con divisionId = esta división)
        const miembros = await this.personalRepository.find({
          where: { divisionId: division.id, activo: true },
          select: ['id'],
        });
        miembros.forEach((m) => personalIds.add(m.id));

        return {
          ...division,
          totalPersonal: personalIds.size,
        };
      }),
    );

    return divisionesConTotal;
  }

  async findOne(id: number): Promise<Division> {
    const division = await this.divisionRepository.findOne({
      where: { id },
      relations: ['jefe', 'coordinador', 'scrumMasters', 'divisionPadre', 'hijos'],
    });

    if (!division) {
      throw new NotFoundException(`División con ID ${id} no encontrada`);
    }

    return division;
  }

  async getArbol(): Promise<DivisionTreeResponseDto[]> {
    const divisiones = await this.divisionRepository.find({
      where: { activo: true },
      relations: ['jefe', 'coordinador', 'scrumMasters'],
      order: { codigo: 'ASC' },
    });

    // Build tree recursively starting from root divisions (no parent)
    return this.buildTree(divisiones, null);
  }

  private buildTree(
    divisiones: Division[],
    parentId: number | null,
  ): DivisionTreeResponseDto[] {
    return divisiones
      .filter((d) => d.divisionPadreId === parentId)
      .map((division) => ({
        id: division.id,
        codigo: division.codigo,
        nombre: division.nombre,
        descripcion: division.descripcion,
        divisionPadreId: division.divisionPadreId,
        jefeId: division.jefeId,
        coordinadorId: division.coordinadorId,
        activo: division.activo,
        createdAt: division.createdAt,
        updatedAt: division.updatedAt,
        jefe: division.jefe
          ? {
              id: division.jefe.id,
              nombres: division.jefe.nombres,
              apellidos: division.jefe.apellidos,
              cargo: division.jefe.cargo,
            }
          : undefined,
        coordinador: division.coordinador
          ? {
              id: division.coordinador.id,
              nombres: division.coordinador.nombres,
              apellidos: division.coordinador.apellidos,
              cargo: division.coordinador.cargo,
              email: division.coordinador.email,
            }
          : undefined,
        scrumMasters: division.scrumMasters?.map(sm => ({
          id: sm.id,
          nombres: sm.nombres,
          apellidos: sm.apellidos,
          cargo: sm.cargo,
          email: sm.email,
        })),
        hijos: this.buildTree(divisiones, division.id),
      }));
  }

  async update(id: number, updateDto: UpdateDivisionDto, userId?: number): Promise<Division> {
    const division = await this.findOne(id);

    // Prevent circular reference
    if (updateDto.divisionPadreId) {
      if (updateDto.divisionPadreId === id) {
        throw new BadRequestException('Una división no puede ser su propio padre');
      }

      // Check if the new parent is a descendant of this division
      const isDescendant = await this.isDescendant(updateDto.divisionPadreId, id);
      if (isDescendant) {
        throw new BadRequestException('No se puede asignar un descendiente como padre');
      }

      const padre = await this.divisionRepository.findOne({
        where: { id: updateDto.divisionPadreId },
      });
      if (!padre) {
        throw new BadRequestException(`División padre con ID ${updateDto.divisionPadreId} no encontrada`);
      }
    }

    Object.assign(division, updateDto, { updatedBy: userId });

    return this.divisionRepository.save(division);
  }

  private async isDescendant(divisionId: number, potentialAncestorId: number): Promise<boolean> {
    const division = await this.divisionRepository.findOne({
      where: { id: divisionId },
    });

    if (!division || !division.divisionPadreId) {
      return false;
    }

    if (division.divisionPadreId === potentialAncestorId) {
      return true;
    }

    return this.isDescendant(division.divisionPadreId, potentialAncestorId);
  }

  async remove(id: number, userId?: number): Promise<Division> {
    const division = await this.findOne(id);

    // Check if division has children
    const children = await this.divisionRepository.find({
      where: { divisionPadreId: id, activo: true },
    });

    if (children.length > 0) {
      throw new BadRequestException('No se puede eliminar una división con subdivisiones activas');
    }

    division.activo = false;
    division.updatedBy = userId;
    return this.divisionRepository.save(division);
  }

  /**
   * Asignar coordinador a una división
   * Crea usuario automáticamente si no existe
   */
  async asignarCoordinador(
    divisionId: number,
    personalId: number,
    userId?: number,
  ): Promise<Division> {
    // 1. Validar división existe
    const division = await this.findOne(divisionId);

    // 2. Validar personal existe
    const personal = await this.personalRepository.findOne({
      where: { id: personalId },
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${personalId} no encontrado`);
    }

    // 3. Crear o agregar rol COORDINADOR al usuario
    const usuario = await this.usuariosService.crearUsuarioParaPersonal(
      personal,
      Role.COORDINADOR,
    );

    // 4. Vincular usuario con personal si no estaba vinculado
    if (!personal.usuarioId) {
      await this.personalRepository.update(personalId, { usuarioId: usuario.id });
    }

    // 5. Actualizar división con el coordinador
    division.coordinadorId = personalId;
    division.updatedBy = userId;

    return this.divisionRepository.save(division);
  }

  /**
   * Asignar scrum master a una división (Many-to-Many)
   * Crea usuario automáticamente si no existe
   */
  async asignarScrumMaster(
    divisionId: number,
    personalId: number,
    userId?: number,
  ): Promise<Division> {
    // 1. Validar división existe con sus scrum masters actuales
    const division = await this.divisionRepository.findOne({
      where: { id: divisionId },
      relations: ['scrumMasters'],
    });

    if (!division) {
      throw new NotFoundException(`División con ID ${divisionId} no encontrada`);
    }

    // 2. Validar personal existe
    const personal = await this.personalRepository.findOne({
      where: { id: personalId },
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${personalId} no encontrado`);
    }

    // 3. Verificar que no esté ya asignado
    if (division.scrumMasters?.some(sm => sm.id === personalId)) {
      throw new ConflictException(`Personal ya está asignado como Scrum Master en esta división`);
    }

    // 4. Crear o agregar rol SCRUM_MASTER al usuario
    const usuario = await this.usuariosService.crearUsuarioParaPersonal(
      personal,
      Role.SCRUM_MASTER,
    );

    // 5. Vincular usuario con personal si no estaba vinculado
    if (!personal.usuarioId) {
      await this.personalRepository.update(personalId, { usuarioId: usuario.id });
    }

    // 6. Agregar scrum master a la división
    if (!division.scrumMasters) {
      division.scrumMasters = [];
    }
    division.scrumMasters.push(personal);
    division.updatedBy = userId;

    return this.divisionRepository.save(division);
  }

  /**
   * Remover scrum master de una división
   */
  async removerScrumMaster(
    divisionId: number,
    personalId: number,
    userId?: number,
  ): Promise<Division> {
    // 1. Validar división existe con sus scrum masters
    const division = await this.divisionRepository.findOne({
      where: { id: divisionId },
      relations: ['scrumMasters'],
    });

    if (!division) {
      throw new NotFoundException(`División con ID ${divisionId} no encontrada`);
    }

    // 2. Verificar que el personal está asignado como scrum master
    const index = division.scrumMasters?.findIndex(sm => sm.id === personalId);
    if (index === undefined || index === -1) {
      throw new BadRequestException(`Personal no está asignado como Scrum Master en esta división`);
    }

    // 3. Remover de la lista
    division.scrumMasters.splice(index, 1);
    division.updatedBy = userId;

    return this.divisionRepository.save(division);
  }

  /**
   * Obtener scrum masters de una división
   */
  async getScrumMasters(divisionId: number): Promise<Personal[]> {
    const division = await this.divisionRepository.findOne({
      where: { id: divisionId },
      relations: ['scrumMasters'],
    });

    if (!division) {
      throw new NotFoundException(`División con ID ${divisionId} no encontrada`);
    }

    return division.scrumMasters || [];
  }

  /**
   * Remover coordinador de una división
   */
  async removerCoordinador(divisionId: number, userId?: number): Promise<Division> {
    const division = await this.findOne(divisionId);

    division.coordinadorId = null as any;
    division.updatedBy = userId;

    return this.divisionRepository.save(division);
  }
}
