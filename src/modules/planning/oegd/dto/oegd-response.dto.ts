export class OegdResponseDto {
  id: number;
  ogdId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  indicador: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OegdDetailResponseDto extends OegdResponseDto {
  ogd?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  accionesEstrategicas?: any[];
}
