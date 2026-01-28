import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comentario, EntidadTipoComentario } from '../entities/comentario.entity';
import { HistoriaUsuario } from '../../historias-usuario/entities/historia-usuario.entity';
import { Tarea } from '../../tareas/entities/tarea.entity';
import { Subtarea } from '../../subtareas/entities/subtarea.entity';
import { CreateComentarioDto } from '../dto/create-comentario.dto';
import { UpdateComentarioDto } from '../dto/update-comentario.dto';
import { Role } from '../../../../common/constants/roles.constant';

@Injectable()
export class ComentarioService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    @InjectRepository(HistoriaUsuario)
    private readonly huRepository: Repository<HistoriaUsuario>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Subtarea)
    private readonly subtareaRepository: Repository<Subtarea>,
  ) {}

  /**
   * Crear un nuevo comentario
   */
  async create(
    createDto: CreateComentarioDto,
    usuarioId: number,
  ): Promise<Comentario> {
    // Validar que la entidad existe
    await this.validarEntidadExiste(createDto.entidadTipo, createDto.entidadId);

    // Validar que el comentario padre existe si es una respuesta
    if (createDto.respuestaA) {
      const comentarioPadre = await this.comentarioRepository.findOne({
        where: { id: createDto.respuestaA, activo: true },
      });

      if (!comentarioPadre) {
        throw new NotFoundException(
          `Comentario padre con ID ${createDto.respuestaA} no encontrado`,
        );
      }

      // Verificar que el comentario padre pertenece a la misma entidad
      if (
        comentarioPadre.entidadTipo !== createDto.entidadTipo ||
        comentarioPadre.entidadId !== createDto.entidadId
      ) {
        throw new BadRequestException(
          'El comentario padre debe pertenecer a la misma entidad',
        );
      }
    }

    const comentario = this.comentarioRepository.create({
      ...createDto,
      usuarioId,
      activo: true,
    });

    const savedComentario = await this.comentarioRepository.save(comentario);

    return this.findOne(savedComentario.id);
  }

  /**
   * Obtener todos los comentarios con filtros opcionales
   */
  async findAll(filters?: {
    entidadTipo?: EntidadTipoComentario;
    entidadId?: number;
    usuarioId?: number;
    activo?: boolean;
    soloRaiz?: boolean;
  }): Promise<Comentario[]> {
    const query = this.comentarioRepository
      .createQueryBuilder('comentario')
      .leftJoinAndSelect('comentario.usuario', 'usuario')
      .leftJoinAndSelect('comentario.comentarioPadre', 'padre')
      .where('comentario.activo = :activo', {
        activo: filters?.activo ?? true,
      });

    if (filters?.entidadTipo) {
      query.andWhere('comentario.entidadTipo = :tipo', {
        tipo: filters.entidadTipo,
      });
    }

    if (filters?.entidadId) {
      query.andWhere('comentario.entidadId = :id', { id: filters.entidadId });
    }

    if (filters?.usuarioId) {
      query.andWhere('comentario.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    if (filters?.soloRaiz) {
      query.andWhere('comentario.respuestaA IS NULL');
    }

    return query.orderBy('comentario.createdAt', 'DESC').getMany();
  }

  /**
   * Obtener un comentario por ID
   */
  async findOne(id: number): Promise<Comentario> {
    const comentario = await this.comentarioRepository.findOne({
      where: { id, activo: true },
      relations: ['usuario', 'comentarioPadre'],
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comentario;
  }

  /**
   * Obtener comentarios de una entidad especifica con sus respuestas anidadas
   */
  async findByEntidad(
    entidadTipo: EntidadTipoComentario,
    entidadId: number,
  ): Promise<any[]> {
    // Validar que la entidad existe
    await this.validarEntidadExiste(entidadTipo, entidadId);

    // Obtener todos los comentarios de la entidad
    const comentarios = await this.comentarioRepository.find({
      where: { entidadTipo, entidadId, activo: true },
      relations: ['usuario'],
      order: { createdAt: 'ASC' },
    });

    // Construir arbol de comentarios (comentarios raiz con respuestas anidadas)
    const comentariosMap = new Map<number, any>();
    const comentariosRaiz: any[] = [];

    // Primera pasada: crear mapa de todos los comentarios
    for (const comentario of comentarios) {
      comentariosMap.set(comentario.id, {
        ...comentario,
        respuestas: [],
      });
    }

    // Segunda pasada: construir el arbol
    for (const comentario of comentarios) {
      const comentarioConRespuestas = comentariosMap.get(comentario.id);

      if (comentario.respuestaA) {
        const padre = comentariosMap.get(comentario.respuestaA);
        if (padre) {
          padre.respuestas.push(comentarioConRespuestas);
        } else {
          // Si el padre no existe o fue eliminado, tratarlo como raiz
          comentariosRaiz.push(comentarioConRespuestas);
        }
      } else {
        comentariosRaiz.push(comentarioConRespuestas);
      }
    }

    return comentariosRaiz;
  }

  /**
   * Obtener comentarios de una Historia de Usuario
   */
  async findByHistoriaUsuario(historiaUsuarioId: number): Promise<any[]> {
    return this.findByEntidad(EntidadTipoComentario.HU, historiaUsuarioId);
  }

  /**
   * Obtener comentarios de una Tarea
   */
  async findByTarea(tareaId: number): Promise<any[]> {
    return this.findByEntidad(EntidadTipoComentario.TAREA, tareaId);
  }

  /**
   * Obtener comentarios de una Subtarea
   */
  async findBySubtarea(subtareaId: number): Promise<any[]> {
    return this.findByEntidad(EntidadTipoComentario.SUBTAREA, subtareaId);
  }

  /**
   * Actualizar un comentario
   */
  async update(
    id: number,
    updateDto: UpdateComentarioDto,
    usuarioId: number,
    userRole?: string,
  ): Promise<Comentario> {
    const comentario = await this.findOne(id);

    // Verificar que el usuario es el autor o tiene rol de admin
    const esAdmin = userRole === Role.ADMIN;
    if (comentario.usuarioId !== usuarioId && !esAdmin) {
      throw new ForbiddenException('Solo el autor puede editar este comentario');
    }

    // Validar que hay algo que actualizar
    if (!updateDto.texto) {
      throw new BadRequestException('Debe proporcionar el texto a actualizar');
    }

    Object.assign(comentario, updateDto);

    await this.comentarioRepository.save(comentario);

    return this.findOne(id);
  }

  /**
   * Eliminar un comentario (soft delete)
   */
  async remove(
    id: number,
    usuarioId: number,
    userRole?: string,
  ): Promise<{ message: string }> {
    const comentario = await this.findOne(id);

    // Verificar que el usuario es el autor o tiene rol de admin/PMO
    const esPrivilegiado = [Role.ADMIN, Role.PMO].includes(userRole as Role);
    if (comentario.usuarioId !== usuarioId && !esPrivilegiado) {
      throw new ForbiddenException(
        'Solo el autor o un administrador puede eliminar este comentario',
      );
    }

    // Soft delete: marcar como inactivo
    comentario.activo = false;
    await this.comentarioRepository.save(comentario);

    // Tambien desactivar las respuestas del comentario
    await this.comentarioRepository.update(
      { respuestaA: id },
      { activo: false },
    );

    return { message: 'Comentario eliminado exitosamente' };
  }

  /**
   * Contar comentarios de una entidad
   */
  async countByEntidad(
    entidadTipo: EntidadTipoComentario,
    entidadId: number,
  ): Promise<number> {
    return this.comentarioRepository.count({
      where: { entidadTipo, entidadId, activo: true },
    });
  }

  /**
   * Validar que la entidad (HU, Tarea, Subtarea) existe
   */
  private async validarEntidadExiste(
    tipo: EntidadTipoComentario,
    id: number,
  ): Promise<void> {
    let existe = false;
    let nombreEntidad = '';

    switch (tipo) {
      case EntidadTipoComentario.HU:
        existe = await this.huRepository.exists({ where: { id, activo: true } });
        nombreEntidad = 'Historia de Usuario';
        break;

      case EntidadTipoComentario.TAREA:
        existe = await this.tareaRepository.exists({
          where: { id, activo: true },
        });
        nombreEntidad = 'Tarea';
        break;

      case EntidadTipoComentario.SUBTAREA:
        existe = await this.subtareaRepository.exists({
          where: { id, activo: true },
        });
        nombreEntidad = 'Subtarea';
        break;

      default:
        throw new BadRequestException(`Tipo de entidad no valido: ${tipo}`);
    }

    if (!existe) {
      throw new NotFoundException(`${nombreEntidad} con ID ${id} no encontrada`);
    }
  }
}
