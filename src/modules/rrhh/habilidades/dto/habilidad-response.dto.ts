import { HabilidadCategoria } from '../enums/habilidad-categoria.enum';
import { NivelHabilidad } from '../enums/nivel-habilidad.enum';

export class HabilidadResponseDto {
  id: number;
  nombre: string;
  categoria: HabilidadCategoria;
  descripcion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PersonalHabilidadResponseDto {
  id: number;
  personalId: number;
  habilidadId: number;
  habilidad?: {
    id: number;
    nombre: string;
    categoria: HabilidadCategoria;
  };
  nivel: NivelHabilidad;
  aniosExperiencia: number;
  certificado: boolean;
  createdAt: Date;
}

export class HabilidadConPersonalResponseDto extends HabilidadResponseDto {
  totalPersonal: number;
  personalConHabilidad?: {
    id: number;
    nombres: string;
    apellidos: string;
    nivel: NivelHabilidad;
  }[];
}
