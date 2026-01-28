import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { Personal } from '../../rrhh/personal/entities/personal.entity';
import { Role, ROLE_HIERARCHY } from '../../../common/constants/roles.constant';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
  ) {}

  /**
   * Obtener todos los usuarios activos
   */
  async findAll(filters?: {
    rol?: Role;
    activo?: boolean;
    busqueda?: string;
  }): Promise<Usuario[]> {
    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('usuario')
      .select([
        'usuario.id',
        'usuario.email',
        'usuario.username',
        'usuario.nombre',
        'usuario.apellido',
        'usuario.rol',
        'usuario.avatarUrl',
        'usuario.telefono',
        'usuario.activo',
      ])
      .orderBy('usuario.apellido', 'ASC')
      .addOrderBy('usuario.nombre', 'ASC');

    if (filters?.rol) {
      queryBuilder.andWhere('usuario.rol = :rol', { rol: filters.rol });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('usuario.activo = :activo', { activo: filters.activo });
    } else {
      // Por defecto, solo usuarios activos
      queryBuilder.andWhere('usuario.activo = :activo', { activo: true });
    }

    if (filters?.busqueda) {
      queryBuilder.andWhere(
        '(LOWER(usuario.nombre) LIKE LOWER(:busqueda) OR LOWER(usuario.apellido) LIKE LOWER(:busqueda) OR LOWER(usuario.email) LIKE LOWER(:busqueda))',
        { busqueda: `%${filters.busqueda}%` },
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * Obtener usuarios por rol
   */
  async findByRol(rol: Role): Promise<Usuario[]> {
    return this.findAll({ rol, activo: true });
  }

  /**
   * Obtener usuarios por múltiples roles
   */
  async findByRoles(roles: Role[]): Promise<Usuario[]> {
    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('usuario')
      .select([
        'usuario.id',
        'usuario.email',
        'usuario.username',
        'usuario.nombre',
        'usuario.apellido',
        'usuario.rol',
        'usuario.avatarUrl',
        'usuario.telefono',
        'usuario.activo',
      ])
      .where('usuario.rol IN (:...roles)', { roles })
      .andWhere('usuario.activo = :activo', { activo: true })
      .orderBy('usuario.apellido', 'ASC')
      .addOrderBy('usuario.nombre', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'nombre',
        'apellido',
        'rol',
        'avatarUrl',
        'telefono',
        'activo',
      ],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  /**
   * Obtener todos los roles disponibles
   */
  getRoles(): string[] {
    return Object.values(Role);
  }

  /**
   * Crear usuario para personal (usado cuando se asigna rol de coordinador/scrum master)
   */
  async crearUsuarioParaPersonal(
    personal: {
      id: number;
      nombres: string;
      apellidos: string;
      email?: string;
      usuarioId?: number;
    },
    rol: Role,
  ): Promise<Usuario> {
    // Si ya tiene usuario, agregar rol
    if (personal.usuarioId) {
      return this.agregarRol(personal.usuarioId, rol);
    }

    // Generar username único basado en nombre y apellido
    const username = await this.generarUsernameUnico(personal.nombres, personal.apellidos);

    // Generar contraseña temporal
    const passwordTemp = this.generarPasswordTemporal();
    const hashedPassword = await bcrypt.hash(passwordTemp, 10);

    // Email por defecto si no tiene
    const email = personal.email || `${username}@inei.gob.pe`;

    // Verificar que el email no esté en uso
    const emailExists = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (emailExists) {
      // Si el email ya existe, agregar el rol al usuario existente
      return this.agregarRol(emailExists.id, rol);
    }

    // Crear usuario
    const usuario = this.usuarioRepository.create({
      email,
      username,
      nombre: personal.nombres,
      apellido: personal.apellidos,
      rol,
      passwordHash: hashedPassword,
      rolesAdicionales: [],
    });

    const usuarioGuardado = await this.usuarioRepository.save(usuario);

    // TODO: Enviar email con credenciales al usuario
    console.log(`Usuario creado: ${username} con contraseña temporal: ${passwordTemp}`);

    return usuarioGuardado;
  }

  /**
   * Agregar rol a usuario existente
   */
  async agregarRol(usuarioId: number, rol: Role): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Si ya tiene el rol (principal o adicional), no hacer nada
    if (usuario.rol === rol || usuario.rolesAdicionales?.includes(rol)) {
      return usuario;
    }

    const rolesAdicionales = usuario.rolesAdicionales || [];

    // Si el nuevo rol es más alto en la jerarquía, hacerlo el principal
    if (ROLE_HIERARCHY[rol] > ROLE_HIERARCHY[usuario.rol]) {
      rolesAdicionales.push(usuario.rol);
      usuario.rol = rol;
    } else {
      rolesAdicionales.push(rol);
    }

    usuario.rolesAdicionales = rolesAdicionales;
    return this.usuarioRepository.save(usuario);
  }

  /**
   * Remover rol de usuario
   */
  async removerRol(usuarioId: number, rol: Role): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const rolesAdicionales = usuario.rolesAdicionales || [];

    // Si el rol a remover es el principal
    if (usuario.rol === rol) {
      if (rolesAdicionales.length > 0) {
        // Promover el rol más alto de los adicionales
        const nuevoRolPrincipal = rolesAdicionales.reduce((mayor, actual) =>
          ROLE_HIERARCHY[actual] > ROLE_HIERARCHY[mayor] ? actual : mayor
        );
        usuario.rol = nuevoRolPrincipal;
        usuario.rolesAdicionales = rolesAdicionales.filter(r => r !== nuevoRolPrincipal);
      }
      // Si no tiene roles adicionales, mantener el rol actual
    } else {
      // Remover de roles adicionales
      usuario.rolesAdicionales = rolesAdicionales.filter(r => r !== rol);
    }

    return this.usuarioRepository.save(usuario);
  }

  /**
   * Generar username único
   */
  private async generarUsernameUnico(nombres: string, apellidos: string): Promise<string> {
    // Normalizar: quitar acentos, convertir a minúsculas
    const normalizar = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');

    const primerNombre = normalizar(nombres.split(' ')[0]);
    const primerApellido = normalizar(apellidos.split(' ')[0]);

    let username = `${primerNombre.charAt(0)}${primerApellido}`;
    let contador = 0;

    // Verificar si existe y agregar número si es necesario
    while (await this.usuarioRepository.findOne({ where: { username } })) {
      contador++;
      username = `${primerNombre.charAt(0)}${primerApellido}${contador}`;
    }

    return username;
  }

  /**
   * Generar contraseña temporal
   */
  private generarPasswordTemporal(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Actualizar usuario
   */
  async update(
    id: number,
    data: {
      activo?: boolean;
      nombre?: string;
      apellido?: string;
      email?: string;
      telefono?: string;
      avatarUrl?: string;
      rol?: Role;
    },
  ): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Actualizar campos
    if (data.activo !== undefined) usuario.activo = data.activo;
    if (data.nombre) usuario.nombre = data.nombre;
    if (data.apellido) usuario.apellido = data.apellido;
    if (data.email) usuario.email = data.email;
    if (data.telefono) usuario.telefono = data.telefono;
    if (data.avatarUrl) usuario.avatarUrl = data.avatarUrl;
    if (data.rol) usuario.rol = data.rol;

    return this.usuarioRepository.save(usuario);
  }

  /**
   * Crear usuario desde un Personal existente por ID
   * Este es el endpoint principal para el flujo Personal → Usuario
   */
  async crearUsuarioDesdePersonalId(
    personalId: number,
    rol: Role,
  ): Promise<{
    usuarioId: number;
    username: string;
    email: string;
    passwordTemporal: string;
    rol: string;
    mensaje: string;
  }> {
    // 1. Buscar el personal
    const personal = await this.personalRepository.findOne({
      where: { id: personalId },
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${personalId} no encontrado`);
    }

    // 2. Verificar si ya tiene usuario vinculado
    if (personal.usuarioId) {
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { id: personal.usuarioId },
      });
      if (usuarioExistente) {
        throw new ConflictException(
          `El personal ${personal.nombres} ${personal.apellidos} ya tiene una cuenta de usuario (${usuarioExistente.username}). ` +
          `Si necesita agregar roles adicionales, use la función de gestión de roles.`
        );
      }
    }

    // 3. Verificar si el email ya está registrado
    if (personal.email) {
      const emailExistente = await this.usuarioRepository.findOne({
        where: { email: personal.email },
      });
      if (emailExistente) {
        throw new ConflictException(
          `Ya existe un usuario con el email ${personal.email}. ` +
          `Puede vincular el personal a ese usuario existente.`
        );
      }
    }

    // 4. Generar username único
    const username = await this.generarUsernameUnico(personal.nombres, personal.apellidos);

    // 5. Generar contraseña temporal
    const passwordTemporal = this.generarPasswordTemporal();
    const hashedPassword = await bcrypt.hash(passwordTemporal, 10);

    // 6. Definir email (usar el del personal o generar uno)
    const email = personal.email || `${username}@inei.gob.pe`;

    // 7. Crear el usuario
    const nuevoUsuario = this.usuarioRepository.create({
      email,
      username,
      nombre: personal.nombres,
      apellido: personal.apellidos,
      rol,
      passwordHash: hashedPassword,
      rolesAdicionales: [],
      telefono: personal.telefono,
    });

    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

    // 8. Actualizar el personal con el usuarioId
    await this.personalRepository.update(personalId, {
      usuarioId: usuarioGuardado.id,
    });

    // 9. Log para debugging (en producción enviar por email)
    console.log(`[RRHH] Usuario creado para personal ${personalId}:`);
    console.log(`       Username: ${username}`);
    console.log(`       Email: ${email}`);
    console.log(`       Password temporal: ${passwordTemporal}`);
    console.log(`       Rol: ${rol}`);

    return {
      usuarioId: usuarioGuardado.id,
      username,
      email,
      passwordTemporal,
      rol,
      mensaje: `Usuario creado exitosamente. La contraseña temporal debe ser cambiada en el primer inicio de sesión.`,
    };
  }

  /**
   * Resetear contraseña de usuario
   */
  async resetearPassword(usuarioId: number): Promise<{ passwordTemporal: string }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const passwordTemp = this.generarPasswordTemporal();
    const hashedPassword = await bcrypt.hash(passwordTemp, 10);

    await this.usuarioRepository.update(usuarioId, {
      passwordHash: hashedPassword,
    });

    // TODO: Enviar email con nueva contraseña
    console.log(`Password reseteado para ${usuario.username}: ${passwordTemp}`);

    return { passwordTemporal: passwordTemp };
  }
}
