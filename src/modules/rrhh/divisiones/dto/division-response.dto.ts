export class PersonalResumenDto {
  id: number;
  nombres: string;
  apellidos: string;
  cargo?: string;
  email?: string;
}

export class DivisionResponseDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  divisionPadreId: number;
  jefeId: number;
  coordinadorId?: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DivisionDetailResponseDto extends DivisionResponseDto {
  divisionPadre?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  jefe?: PersonalResumenDto;
  coordinador?: PersonalResumenDto;
  scrumMasters?: PersonalResumenDto[];
}

export class DivisionTreeResponseDto extends DivisionResponseDto {
  jefe?: PersonalResumenDto;
  coordinador?: PersonalResumenDto;
  scrumMasters?: PersonalResumenDto[];
  hijos?: DivisionTreeResponseDto[];
  totalPersonal?: number;
}
