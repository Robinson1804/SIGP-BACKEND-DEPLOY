import { MetaAnual } from '../entities/oei.entity';

export class OeiResponseDto {
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

export class OeiDetailResponseDto extends OeiResponseDto {
  pgd?: {
    id: number;
    nombre: string;
  };
}
