import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, ValidateIf, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@inei.gob.pe',
    description: 'Email del usuario (requerido si no se proporciona username)',
    required: false,
  })
  @ValidateIf((o) => !o.username)
  @IsNotEmpty({ message: 'Debe proporcionar email o username' })
  @IsEmail({}, { message: 'Email debe ser valido' })
  email?: string;

  @ApiProperty({
    example: 'jperez',
    description: 'Nombre de usuario (requerido si no se proporciona email)',
    required: false,
  })
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: 'Debe proporcionar email o username' })
  @IsString()
  @MinLength(3, { message: 'Username debe tener al menos 3 caracteres' })
  username?: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contrasena del usuario',
  })
  @IsString()
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password: string;

  /**
   * Metodo helper para obtener el identificador (email o username)
   */
  getIdentifier(): string {
    return this.email || this.username || '';
  }
}
