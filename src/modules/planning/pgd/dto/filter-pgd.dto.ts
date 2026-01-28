import { IsOptional, IsEnum, IsInt, IsBoolean, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PgdEstado } from '../entities/pgd.entity';

export class FilterPgdDto {
  @IsOptional()
  @IsEnum(PgdEstado)
  estado?: PgdEstado;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  anio?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
