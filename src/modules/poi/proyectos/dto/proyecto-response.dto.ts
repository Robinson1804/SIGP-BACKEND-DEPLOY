import { ProyectoEstado, Clasificacion } from '../enums/proyecto-estado.enum';

export class ProyectoResponseDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  clasificacion: Clasificacion | null;
  estado: ProyectoEstado;
  accionEstrategicaId: number | null;
  coordinadorId: number | null;
  scrumMasterId: number | null;
  patrocinadorId: number | null;
  coordinacion: string | null;
  areasFinancieras: string[] | null;
  montoAnual: number | null;
  anios: number[] | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  metodoGestion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProyectoDetailResponseDto extends ProyectoResponseDto {
  accionEstrategica?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  coordinador?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  scrumMaster?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  patrocinador?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  subproyectos?: any[];
}
