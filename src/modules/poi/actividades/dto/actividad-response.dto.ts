import { ActividadEstado, Periodicidad } from '../enums/actividad-estado.enum';
import { Clasificacion } from '../../proyectos/enums/proyecto-estado.enum';

export class ActividadResponseDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  clasificacion: Clasificacion | null;
  estado: ActividadEstado;
  accionEstrategicaId: number | null;
  coordinadorId: number | null;
  coordinacion: string | null;
  areasFinancieras: string[] | null;
  montoAnual: number | null;
  anios: number[] | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  metodoGestion: string;
  periodicidadInforme: Periodicidad;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ActividadDetailResponseDto extends ActividadResponseDto {
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
}
