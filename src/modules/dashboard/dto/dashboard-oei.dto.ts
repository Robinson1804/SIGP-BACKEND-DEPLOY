export class PgdInfoDto {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
}

export class ObjetivoAvanceDto {
  id: number;
  codigo: string;
  nombre: string;
  metaAnual: number;
  logrado: number;
  porcentajeAvance: number;
  proyectosVinculados: number;
  actividadesVinculadas: number;
}

export class ResumenOeiDto {
  totalOei: number;
  enMeta: number;
  porDebajoMeta: number;
}

export class DashboardOeiDto {
  pgd: PgdInfoDto | null;
  objetivos: ObjetivoAvanceDto[];
  resumen: ResumenOeiDto;
}
