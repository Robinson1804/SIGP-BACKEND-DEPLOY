import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from '../entities/personal.entity';
import { CreatePersonalDto } from '../dto/create-personal.dto';
import { UpdatePersonalDto } from '../dto/update-personal.dto';
import { DisponibilidadResponseDto } from '../dto/personal-response.dto';
import { Modalidad } from '../enums/modalidad.enum';
import { PersonalHabilidad } from '../../habilidades/entities/personal-habilidad.entity';
import { AsignarHabilidadDto, UpdatePersonalHabilidadDto } from '../../habilidades/dto/asignar-habilidad.dto';
import { Role } from '../../../../common/constants/roles.constant';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
    @InjectRepository(PersonalHabilidad)
    private readonly personalHabilidadRepository: Repository<PersonalHabilidad>,
  ) {}

  async create(createDto: CreatePersonalDto, userId?: number): Promise<Personal> {
    // Generate code if not provided
    let codigoEmpleado = createDto.codigoEmpleado;
    if (!codigoEmpleado) {
      codigoEmpleado = await this.generateNextCode();
    }

    // Check for duplicate code
    const existing = await this.personalRepository.findOne({
      where: { codigoEmpleado },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe personal con el código ${codigoEmpleado}`,
      );
    }

    const personal = this.personalRepository.create({
      ...createDto,
      codigoEmpleado,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.personalRepository.save(personal);
  }

  /**
   * Gets the next sequential employee code (for preview purposes)
   */
  async getNextCode(): Promise<string> {
    return this.generateNextCode();
  }

  /**
   * Generates the next sequential employee code in format EMP-XXX
   */
  private async generateNextCode(): Promise<string> {
    // Get the highest numeric code currently in use
    const result = await this.personalRepository
      .createQueryBuilder('personal')
      .select("MAX(CAST(SUBSTRING(personal.codigoEmpleado FROM 5) AS INTEGER))", 'maxNum')
      .where("personal.codigoEmpleado ~ '^EMP-[0-9]+$'")
      .getRawOne();

    const nextNum = (result?.maxNum || 0) + 1;
    return `EMP-${String(nextNum).padStart(3, '0')}`;
  }

  async findAll(filters?: {
    divisionId?: number;
    modalidad?: Modalidad;
    disponible?: boolean;
    activo?: boolean;
    busqueda?: string;
  }): Promise<Personal[]> {
    const queryBuilder = this.personalRepository
      .createQueryBuilder('personal')
      .leftJoinAndSelect('personal.division', 'division')
      .leftJoinAndSelect('personal.usuario', 'usuario', 'usuario.id = personal.usuarioId')
      .orderBy('personal.apellidos', 'ASC')
      .addOrderBy('personal.nombres', 'ASC');

    if (filters?.divisionId) {
      queryBuilder.andWhere('personal.divisionId = :divisionId', {
        divisionId: filters.divisionId,
      });
    }

    if (filters?.modalidad) {
      queryBuilder.andWhere('personal.modalidad = :modalidad', {
        modalidad: filters.modalidad,
      });
    }

    if (filters?.disponible !== undefined) {
      queryBuilder.andWhere('personal.disponible = :disponible', {
        disponible: filters.disponible,
      });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('personal.activo = :activo', {
        activo: filters.activo,
      });
    }

    if (filters?.busqueda) {
      queryBuilder.andWhere(
        '(LOWER(personal.nombres) LIKE LOWER(:busqueda) OR LOWER(personal.apellidos) LIKE LOWER(:busqueda) OR LOWER(personal.email) LIKE LOWER(:busqueda) OR personal.codigoEmpleado LIKE :busqueda)',
        { busqueda: `%${filters.busqueda}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Personal> {
    const personal = await this.personalRepository.findOne({
      where: { id },
      relations: ['division', 'usuario', 'habilidades', 'habilidades.habilidad'],
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    return personal;
  }

  async findByDivision(divisionId: number): Promise<Personal[]> {
    return this.personalRepository.find({
      where: { divisionId, activo: true },
      order: { apellidos: 'ASC', nombres: 'ASC' },
    });
  }

  /**
   * Obtener personal por rol del usuario vinculado
   * Filtra personal activo cuyo usuario tenga el rol especificado (principal o adicional)
   */
  async findByUsuarioRol(rol: Role): Promise<Personal[]> {
    const queryBuilder = this.personalRepository
      .createQueryBuilder('personal')
      .innerJoin('personal.usuario', 'usuario')
      .where('personal.activo = :activo', { activo: true })
      .andWhere('usuario.activo = :usuarioActivo', { usuarioActivo: true })
      .andWhere(
        "(usuario.rol = :rol OR usuario.roles_adicionales @> :rolJsonb)",
        { rol, rolJsonb: JSON.stringify([rol]) },
      )
      .orderBy('personal.apellidos', 'ASC')
      .addOrderBy('personal.nombres', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Obtener personal con rol DESARROLLADOR
   */
  async findDesarrolladores(): Promise<Personal[]> {
    return this.findByUsuarioRol(Role.DESARROLLADOR);
  }

  /**
   * Obtener personal con rol IMPLEMENTADOR
   */
  async findImplementadores(): Promise<Personal[]> {
    return this.findByUsuarioRol(Role.IMPLEMENTADOR);
  }

  async update(id: number, updateDto: UpdatePersonalDto, userId?: number): Promise<Personal> {
    // Verificar que existe
    await this.findOne(id);

    // Usar update directo para evitar conflictos con relaciones cargadas
    await this.personalRepository.update(id, {
      ...updateDto,
      updatedBy: userId,
    });

    // Recargar la entidad con las relaciones actualizadas
    return this.findOne(id);
  }

  async remove(id: number, userId?: number): Promise<Personal> {
    const personal = await this.findOne(id);
    personal.activo = false;
    personal.updatedBy = userId;
    return this.personalRepository.save(personal);
  }

  async getDisponibilidad(id: number): Promise<DisponibilidadResponseDto> {
    const personal = await this.personalRepository.findOne({
      where: { id },
      relations: ['asignaciones', 'asignaciones.proyecto', 'asignaciones.actividad'],
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    // Calculate assigned percentage from active assignments
    const asignacionesActivas = (personal.asignaciones || []).filter(
      (a) => a.activo && (!a.fechaFin || new Date(a.fechaFin) >= new Date()),
    );

    const porcentajeAsignado = asignacionesActivas.reduce(
      (sum, a) => sum + Number(a.porcentajeDedicacion),
      0,
    );

    const horasAsignadas = (Number(personal.horasSemanales) * porcentajeAsignado) / 100;
    const horasDisponibles = Number(personal.horasSemanales) - horasAsignadas;

    return {
      personalId: personal.id,
      nombre: `${personal.nombres} ${personal.apellidos}`,
      horasSemanales: Number(personal.horasSemanales),
      porcentajeAsignado,
      horasAsignadas,
      horasDisponibles,
      disponible: porcentajeAsignado < 100,
      asignacionesActuales: asignacionesActivas.map((a) => ({
        tipo: a.tipoAsignacion,
        nombre: a.proyecto?.nombre || a.actividad?.nombre || 'N/A',
        rol: a.rolEquipo,
        porcentaje: Number(a.porcentajeDedicacion),
        fechaInicio: a.fechaInicio,
        fechaFin: a.fechaFin,
      })),
    };
  }

  async getHabilidades(id: number): Promise<PersonalHabilidad[]> {
    await this.findOne(id); // Verify personal exists
    return this.personalHabilidadRepository.find({
      where: { personalId: id },
      relations: ['habilidad'],
      order: { nivel: 'DESC' },
    });
  }

  async asignarHabilidad(
    personalId: number,
    asignarDto: AsignarHabilidadDto,
  ): Promise<PersonalHabilidad> {
    await this.findOne(personalId); // Verify personal exists

    const existing = await this.personalHabilidadRepository.findOne({
      where: { personalId, habilidadId: asignarDto.habilidadId },
    });

    if (existing) {
      throw new ConflictException('Esta habilidad ya está asignada a este personal');
    }

    const personalHabilidad = this.personalHabilidadRepository.create({
      personalId,
      ...asignarDto,
    });

    return this.personalHabilidadRepository.save(personalHabilidad);
  }

  async actualizarHabilidad(
    personalId: number,
    habilidadId: number,
    updateDto: UpdatePersonalHabilidadDto,
  ): Promise<PersonalHabilidad> {
    const personalHabilidad = await this.personalHabilidadRepository.findOne({
      where: { personalId, habilidadId },
    });

    if (!personalHabilidad) {
      throw new NotFoundException('Asignación de habilidad no encontrada');
    }

    Object.assign(personalHabilidad, updateDto);
    return this.personalHabilidadRepository.save(personalHabilidad);
  }

  async quitarHabilidad(personalId: number, habilidadId: number): Promise<void> {
    const personalHabilidad = await this.personalHabilidadRepository.findOne({
      where: { personalId, habilidadId },
    });

    if (!personalHabilidad) {
      throw new NotFoundException('Asignación de habilidad no encontrada');
    }

    await this.personalHabilidadRepository.remove(personalHabilidad);
  }

  async actualizarDisponibilidad(personalId: number): Promise<void> {
    const disponibilidad = await this.getDisponibilidad(personalId);
    await this.personalRepository.update(personalId, {
      disponible: disponibilidad.disponible,
    });
  }
}
