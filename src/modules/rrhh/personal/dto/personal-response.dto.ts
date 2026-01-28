import { Modalidad } from '../enums/modalidad.enum';
import { NivelHabilidad } from '../../habilidades/enums/nivel-habilidad.enum';

export class PersonalResponseDto {
  id: number;
  usuarioId: number;
  divisionId: number;
  codigoEmpleado: string;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  cargo: string;
  fechaIngreso: Date;
  modalidad: Modalidad;
  horasSemanales: number;
  disponible: boolean;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DivisionInfoDto {
  id: number;
  codigo: string;
  nombre: string;
}

export class UsuarioInfoDto {
  id: number;
  email: string;
  rol: string;
}

export class PersonalDetailResponseDto extends PersonalResponseDto {
  division?: DivisionInfoDto;
  usuario?: UsuarioInfoDto;
}

export class HabilidadPersonalDto {
  id: number;
  nombre: string;
  categoria: string;
  nivel: NivelHabilidad;
  aniosExperiencia: number;
  certificado: boolean;
}

export class PersonalConHabilidadesResponseDto extends PersonalDetailResponseDto {
  habilidades: HabilidadPersonalDto[];
}

export class AsignacionActualDto {
  tipo: string;
  nombre: string;
  rol: string;
  porcentaje: number;
  fechaInicio: Date;
  fechaFin: Date;
}

export class DisponibilidadResponseDto {
  personalId: number;
  nombre: string;
  horasSemanales: number;
  porcentajeAsignado: number;
  horasAsignadas: number;
  horasDisponibles: number;
  disponible: boolean;
  asignacionesActuales: AsignacionActualDto[];
}
