import { IsBoolean, IsOptional, IsString, IsEmail, MaxLength, IsEnum } from 'class-validator';
import { Role } from '../../../common/constants/roles.constant';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser booleano' })
  activo?: boolean;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido' })
  rol?: Role;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
