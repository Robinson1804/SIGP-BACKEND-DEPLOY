import { RequerimientoPrioridad, RequerimientoTipo } from '../enums/requerimiento.enum';

export class RequerimientoResponseDto {
  id: number;
  proyectoId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: RequerimientoTipo;
  prioridad: RequerimientoPrioridad;
  criteriosAceptacion: { descripcion: string; cumplido?: boolean }[] | null;
  dependencias: number[] | null;
  observaciones: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RequerimientoDetailResponseDto extends RequerimientoResponseDto {
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}
