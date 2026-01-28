import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HistorialEntidadTipo, HistorialAccion } from '../enums/historial-cambio.enum';

/**
 * DTO para respuesta de usuario simplificado en historial
 */
export class UsuarioHistorialDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  id: number;

  @ApiProperty({ example: 'jperez', description: 'Username del usuario' })
  username: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ example: 'Perez', description: 'Apellido del usuario' })
  apellido: string;
}

/**
 * DTO para respuesta de un registro de historial de cambios
 */
export class HistorialCambioResponseDto {
  @ApiProperty({ example: 1, description: 'ID del registro de historial' })
  id: number;

  @ApiProperty({
    enum: HistorialEntidadTipo,
    example: HistorialEntidadTipo.HISTORIA_USUARIO,
    description: 'Tipo de entidad que fue modificada',
  })
  entidadTipo: string;

  @ApiProperty({ example: 42, description: 'ID de la entidad modificada' })
  entidadId: number;

  @ApiProperty({
    enum: HistorialAccion,
    example: HistorialAccion.ACTUALIZACION,
    description: 'Tipo de accion realizada',
  })
  accion: string;

  @ApiPropertyOptional({
    example: 'estado',
    description: 'Nombre del campo que fue modificado (null si es creacion/eliminacion)',
  })
  campoModificado: string | null;

  @ApiPropertyOptional({
    example: '"Pendiente"',
    description: 'Valor anterior del campo (JSON string)',
  })
  valorAnterior: string | null;

  @ApiPropertyOptional({
    example: '"En desarrollo"',
    description: 'Valor nuevo del campo (JSON string)',
  })
  valorNuevo: string | null;

  @ApiProperty({ example: 13, description: 'ID del usuario que realizo el cambio' })
  usuarioId: number;

  @ApiPropertyOptional({
    type: UsuarioHistorialDto,
    description: 'Datos del usuario que realizo el cambio',
  })
  usuario?: UsuarioHistorialDto;

  @ApiProperty({
    example: '2025-01-15T10:30:00Z',
    description: 'Fecha y hora del cambio',
  })
  createdAt: Date;
}

/**
 * DTO para filtrar historial de cambios
 */
export class FiltrosHistorialDto {
  @ApiPropertyOptional({
    enum: HistorialEntidadTipo,
    description: 'Filtrar por tipo de entidad',
  })
  entidadTipo?: HistorialEntidadTipo;

  @ApiPropertyOptional({ example: 42, description: 'Filtrar por ID de entidad' })
  entidadId?: number;

  @ApiPropertyOptional({ example: 13, description: 'Filtrar por ID de usuario' })
  usuarioId?: number;

  @ApiPropertyOptional({
    enum: HistorialAccion,
    description: 'Filtrar por tipo de accion',
  })
  accion?: HistorialAccion;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  fechaDesde?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  fechaHasta?: string;
}

/**
 * DTO para respuesta paginada de historial
 */
export class HistorialCambioPaginadoDto {
  @ApiProperty({ type: [HistorialCambioResponseDto] })
  data: HistorialCambioResponseDto[];

  @ApiProperty({ example: 100, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Pagina actual' })
  page: number;

  @ApiProperty({ example: 20, description: 'Registros por pagina' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total de paginas' })
  totalPages: number;
}

/**
 * DTO para registrar un cambio (uso interno - no expuesto en API)
 */
export interface RegistrarCambioParams {
  entidadTipo: HistorialEntidadTipo;
  entidadId: number;
  accion: HistorialAccion;
  campoModificado?: string;
  valorAnterior?: any;
  valorNuevo?: any;
  usuarioId: number;
}
