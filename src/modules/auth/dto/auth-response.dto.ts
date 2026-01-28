import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/constants/roles.constant';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({
    example: 'jperez',
    description: 'Nombre de usuario unico',
  })
  username: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty({ enum: Role })
  rol: Role;

  @ApiProperty({ required: false })
  avatarUrl?: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
