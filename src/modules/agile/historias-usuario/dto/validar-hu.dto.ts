import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para validar (aprobar/rechazar) una Historia de Usuario
 * Usado por el SCRUM_MASTER para validar las evidencias
 */
export class ValidarHuDto {
  @ApiProperty({
    description: 'Indica si se aprueba (true) o rechaza (false) la HU',
    example: true,
  })
  @IsBoolean()
  aprobado: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones o comentarios sobre la validación',
    example: 'Evidencias completas y correctas',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
