import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  MaxLength,
} from 'class-validator';

export class UpdateDivisionDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @IsOptional()
  divisionPadreId?: number;

  @IsInt()
  @IsOptional()
  jefeId?: number;

  @IsInt()
  @IsOptional()
  coordinadorId?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  scrumMasterIds?: number[];

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
