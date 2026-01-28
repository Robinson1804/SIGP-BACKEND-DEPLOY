import { PgdEstado } from '../entities/pgd.entity';

export class PgdResponseDto {
  id: number;
  nombre: string;
  descripcion: string | null;
  anioInicio: number;
  anioFin: number;
  estado: PgdEstado;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PgdDetailResponseDto extends PgdResponseDto {
  objetivosEstrategicos?: any[];
  objetivosGobiernoDigital?: any[];
}
