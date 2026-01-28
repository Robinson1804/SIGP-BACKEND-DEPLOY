import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateAsignacionDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  rolEquipo?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  porcentajeDedicacion?: number;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
