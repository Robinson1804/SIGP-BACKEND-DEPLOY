import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/constants/roles.constant';

export class ManageRoleDto {
  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(Role, { message: 'El rol no es válido' })
  rol: Role;
}
