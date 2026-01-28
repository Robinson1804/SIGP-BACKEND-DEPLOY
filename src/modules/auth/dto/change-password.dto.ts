import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'jperez',
    description: 'Username para identificacion (opcional si se usa el token JWT)',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'CurrentPassword123!',
    description: 'Contrasena actual',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Nueva contrasena',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
