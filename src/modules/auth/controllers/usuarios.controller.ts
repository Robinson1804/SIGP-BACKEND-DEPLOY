import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from '../services/usuarios.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ManageRoleDto } from '../dto/manage-role.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { CrearUsuarioParaPersonalDto, CrearUsuarioParaPersonalResponseDto } from '../dto/crear-usuario-personal.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * GET /usuarios
   * Obtener lista de usuarios con filtros opcionales
   */
  @Get()
  findAll(
    @Query('rol') rol?: Role,
    @Query('activo') activo?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.usuariosService.findAll({
      rol,
      activo: activo !== undefined ? activo === 'true' : undefined,
      busqueda,
    });
  }

  /**
   * GET /usuarios/roles
   * Obtener lista de roles disponibles
   */
  @Get('roles')
  getRoles() {
    return this.usuariosService.getRoles();
  }

  /**
   * GET /usuarios/by-rol/:rol
   * Obtener usuarios por un rol específico
   */
  @Get('by-rol/:rol')
  findByRol(@Param('rol') rol: Role) {
    return this.usuariosService.findByRol(rol);
  }

  /**
   * GET /usuarios/coordinadores
   * Obtener todos los coordinadores
   */
  @Get('coordinadores')
  getCoordinadores() {
    return this.usuariosService.findByRol(Role.COORDINADOR);
  }

  /**
   * GET /usuarios/scrum-masters
   * Obtener todos los scrum masters
   */
  @Get('scrum-masters')
  getScrumMasters() {
    return this.usuariosService.findByRol(Role.SCRUM_MASTER);
  }

  /**
   * GET /usuarios/scrum-masters-elegibles
   * Obtener usuarios elegibles para ser Scrum Master (incluye SCRUM_MASTER y COORDINADOR)
   * Usado para el campo "Scrum Master" en proyectos POI
   */
  @Get('scrum-masters-elegibles')
  getScrumMastersElegibles() {
    return this.usuariosService.findByRoles([Role.SCRUM_MASTER, Role.COORDINADOR]);
  }

  /**
   * GET /usuarios/patrocinadores
   * Obtener todos los patrocinadores
   */
  @Get('patrocinadores')
  getPatrocinadores() {
    return this.usuariosService.findByRol(Role.PATROCINADOR);
  }

  /**
   * GET /usuarios/desarrolladores
   * Obtener todos los desarrolladores
   */
  @Get('desarrolladores')
  getDesarrolladores() {
    return this.usuariosService.findByRol(Role.DESARROLLADOR);
  }

  /**
   * GET /usuarios/implementadores
   * Obtener todos los implementadores
   */
  @Get('implementadores')
  getImplementadores() {
    return this.usuariosService.findByRol(Role.IMPLEMENTADOR);
  }

  /**
   * GET /usuarios/responsables
   * Obtener todos los usuarios que pueden ser responsables
   * (Scrum Masters, Desarrolladores, Implementadores)
   */
  @Get('responsables')
  getResponsables() {
    return this.usuariosService.findByRoles([
      Role.SCRUM_MASTER,
      Role.DESARROLLADOR,
      Role.IMPLEMENTADOR,
    ]);
  }

  /**
   * GET /usuarios/:id
   * Obtener un usuario por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  /**
   * PATCH /usuarios/:id
   * Actualizar un usuario (toggle activo, datos personales)
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * POST /usuarios/:id/roles/agregar
   * Agregar un rol adicional a un usuario
   */
  @Post(':id/roles/agregar')
  @Roles(Role.ADMIN, Role.PMO)
  agregarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() manageRoleDto: ManageRoleDto,
  ) {
    return this.usuariosService.agregarRol(id, manageRoleDto.rol);
  }

  /**
   * POST /usuarios/:id/roles/remover
   * Remover un rol adicional de un usuario
   */
  @Post(':id/roles/remover')
  @Roles(Role.ADMIN, Role.PMO)
  removerRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() manageRoleDto: ManageRoleDto,
  ) {
    return this.usuariosService.removerRol(id, manageRoleDto.rol);
  }

  /**
   * POST /usuarios/:id/resetear-password
   * Resetear la contraseña de un usuario
   */
  @Post(':id/resetear-password')
  @Roles(Role.ADMIN, Role.PMO)
  resetearPassword(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.resetearPassword(id);
  }

  /**
   * POST /usuarios/para-personal/:personalId
   * Crear un usuario para un personal existente
   *
   * Este endpoint implementa el flujo: Personal → Usuario
   * 1. Toma los datos del Personal (nombre, email, etc.)
   * 2. Genera username y password temporal
   * 3. Crea el Usuario con el rol especificado
   * 4. Vincula el Usuario al Personal (actualiza usuarioId)
   */
  @Post('para-personal/:personalId')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({
    summary: 'Crear usuario para un personal existente',
    description: 'Crea una cuenta de usuario usando los datos de un registro de personal existente. Genera username automático y password temporal.'
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: CrearUsuarioParaPersonalResponseDto
  })
  @ApiResponse({ status: 404, description: 'Personal no encontrado' })
  @ApiResponse({ status: 409, description: 'El personal ya tiene usuario o el email ya está registrado' })
  crearUsuarioParaPersonal(
    @Param('personalId', ParseIntPipe) personalId: number,
    @Body() dto: CrearUsuarioParaPersonalDto,
  ) {
    return this.usuariosService.crearUsuarioDesdePersonalId(personalId, dto.rol);
  }
}
