export class AccionEstrategicaResponseDto {
  id: number;
  oegdId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  indicador: string | null;
  responsableArea: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AccionEstrategicaDetailResponseDto extends AccionEstrategicaResponseDto {
  oegd?: {
    id: number;
    codigo: string;
    nombre: string;
    ogd?: {
      id: number;
      codigo: string;
      nombre: string;
    };
  };
}
