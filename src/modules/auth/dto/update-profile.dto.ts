import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Nombre del usuario',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Perez',
    description: 'Apellido del usuario',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100)
  apellido?: string;

  @ApiPropertyOptional({
    example: '999888777',
    description: 'Telefono del usuario',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]*$/, {
    message: 'El telefono solo puede contener numeros, +, -, espacios y parentesis',
  })
  telefono?: string;
}

export class UpdateAvatarDto {
  @ApiProperty({
    example: 'https://minio.local:9000/sigp-avatares/usuarios/1/avatar.png',
    description: 'URL del avatar almacenado en MinIO',
  })
  @IsString()
  @MaxLength(500)
  avatarUrl: string;
}

export class ProfileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'usuario@inei.gob.pe' })
  email: string;

  @ApiProperty({ example: 'jperez' })
  username: string;

  @ApiProperty({ example: 'Juan' })
  nombre: string;

  @ApiProperty({ example: 'Perez' })
  apellido: string;

  @ApiProperty({ example: 'COORDINADOR' })
  rol: string;

  @ApiPropertyOptional({ example: 'https://minio.local:9000/sigp-avatares/...' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: '999888777' })
  telefono?: string;

  @ApiProperty({ example: '2025-12-22T10:00:00Z' })
  ultimoAcceso?: Date;

  @ApiProperty({ example: '2025-01-15T08:00:00Z' })
  createdAt: Date;
}
