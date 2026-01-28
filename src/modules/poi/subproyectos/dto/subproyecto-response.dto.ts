import { ProyectoEstado } from '../../proyectos/enums/proyecto-estado.enum';

export class SubproyectoResponseDto {
  id: number;
  proyectoPadreId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  monto: number | null;
  estado: ProyectoEstado;
  scrumMasterId: number | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SubproyectoDetailResponseDto extends SubproyectoResponseDto {
  proyectoPadre?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  scrumMaster?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}
