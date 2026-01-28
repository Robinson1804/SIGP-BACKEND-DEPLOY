import { TipoAsignacion } from '../enums/tipo-asignacion.enum';

export class AsignacionResponseDto {
  id: number;
  personalId: number;
  tipoAsignacion: TipoAsignacion;
  proyectoId: number;
  actividadId: number;
  subproyectoId: number;
  rolEquipo: string;
  porcentajeDedicacion: number;
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AsignacionDetailResponseDto extends AsignacionResponseDto {
  personal?: {
    id: number;
    codigoEmpleado: string;
    nombres: string;
    apellidos: string;
    cargo: string;
  };
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  actividad?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  subproyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export class AlertaSobrecargaResponseDto {
  personalId: number;
  nombres: string;
  apellidos: string;
  codigoEmpleado: string;
  porcentajeTotal: number;
  horasSemanales: number;
  exceso: number;
  asignaciones: {
    tipo: string;
    nombre: string;
    porcentaje: number;
  }[];
}
