import { DocumentoFase, DocumentoEstado, TipoContenedor } from '../enums/documento.enum';

export class DocumentoResponseDto {
  id: number;
  tipoContenedor: TipoContenedor;
  proyectoId: number | null;
  subproyectoId: number | null;
  fase: DocumentoFase;
  nombre: string;
  descripcion: string | null;
  link: string | null;
  archivoUrl: string | null;
  archivoNombre: string | null;
  archivoTamano: number | null;
  esObligatorio: boolean;
  estado: DocumentoEstado;
  aprobadoPor: number | null;
  fechaAprobacion: Date | null;
  observacionAprobacion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentoDetailResponseDto extends DocumentoResponseDto {
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  subproyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  aprobador?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}
