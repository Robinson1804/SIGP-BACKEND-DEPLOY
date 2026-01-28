import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/constants/roles.constant';

/**
 * DTO para crear usuario desde un personal existente
 */
export class CrearUsuarioParaPersonalDto {
  @ApiProperty({
    enum: Role,
    example: Role.DESARROLLADOR,
    description: 'Rol que tendrá el usuario en el sistema',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  rol: Role;
}

/**
 * Respuesta al crear usuario para personal
 */
export class CrearUsuarioParaPersonalResponseDto {
  @ApiProperty({ example: 25 })
  usuarioId: number;

  @ApiProperty({ example: 'jperez' })
  username: string;

  @ApiProperty({ example: 'juan.perez@inei.gob.pe' })
  email: string;

  @ApiProperty({ example: 'Abc123!@#' })
  passwordTemporal: string;

  @ApiProperty({ example: 'DESARROLLADOR' })
  rol: string;

  @ApiProperty({ example: 'Usuario creado exitosamente. Se debe cambiar la contraseña en el primer inicio de sesión.' })
  mensaje: string;
}
