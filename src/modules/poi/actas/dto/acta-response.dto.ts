import { ActaTipo, ActaEstado, TipoReunion, Modalidad } from '../enums/acta.enum';

export class ActaResponseDto {
  id: number;
  proyectoId: number;
  codigo: string;
  nombre: string;
  tipo: ActaTipo;
  fecha: Date;
  estado: ActaEstado;
  archivoUrl: string | null;
  documentoFirmadoUrl: string | null;
  documentoFirmadoFecha: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  aprobadoPor: number | null;
  fechaAprobacion: Date | null;
  comentarioRechazo: string | null;
}

export class ActaReunionDetailResponseDto extends ActaResponseDto {
  tipoReunion: TipoReunion;
  fasePerteneciente: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  modalidad: Modalidad | null;
  lugarLink: string | null;
  moderadorId: number | null;
  proximaReunionFecha: Date | null;
  asistentes: any[] | null;
  ausentes: any[] | null;
  agenda: any[] | null;
  temasDesarrollados: any[] | null;
  acuerdos: any[] | null;
  proximosPasos: any[] | null;
  observaciones: string | null;
  anexosReferenciados: any[] | null;
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  moderador?: {
    id: number;
    nombre: string;
  };
}

export class ActaConstitucionDetailResponseDto extends ActaResponseDto {
  objetivoSmart: string;
  justificacion: string | null;
  alcance: string[] | null;
  fueraDeAlcance: string[] | null;
  entregables: any[] | null;
  supuestos: string[] | null;
  restricciones: string[] | null;
  riesgos: any[] | null;
  presupuestoEstimado: number | null;
  cronogramaHitos: any[] | null;
  equipoProyecto: any[] | null;
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}
