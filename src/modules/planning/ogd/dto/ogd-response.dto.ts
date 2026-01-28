import { MetaAnual } from '../../oei/entities/oei.entity';

export class OgdResponseDto {
  id: number;
  pgdId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  indicador: string | null;
  lineaBase: number | null;
  unidadMedida: string | null;
  metasAnuales: MetaAnual[] | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OgdDetailResponseDto extends OgdResponseDto {
  pgd?: {
    id: number;
    nombre: string;
  };
  objetivosEspecificos?: any[];
}
