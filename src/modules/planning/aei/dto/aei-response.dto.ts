import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetaAnualDto } from './create-aei.dto';

export class AeiResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  oeiId: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  nombre: string;

  @ApiPropertyOptional()
  descripcion?: string;

  @ApiPropertyOptional()
  indicadorCodigo?: string;

  @ApiPropertyOptional()
  indicadorNombre?: string;

  @ApiPropertyOptional()
  unidadMedida?: string;

  @ApiPropertyOptional()
  lineaBaseAnio?: number;

  @ApiPropertyOptional()
  lineaBaseValor?: number;

  @ApiPropertyOptional({ type: [MetaAnualDto] })
  metasAnuales?: MetaAnualDto[];

  @ApiProperty()
  activo: boolean;

  @ApiPropertyOptional()
  oei?: {
    id: number;
    codigo: string;
    nombre: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
