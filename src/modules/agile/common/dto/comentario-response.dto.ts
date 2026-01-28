import { EntidadTipoComentario } from '../entities/comentario.entity';

export class UsuarioResumenDto {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
}

export class ComentarioResponseDto {
  id: number;
  entidadTipo: EntidadTipoComentario;
  entidadId: number;
  texto: string;
  respuestaA: number | null;
  usuarioId: number;
  usuario: UsuarioResumenDto;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  respuestas?: ComentarioResponseDto[];
}

export class ComentarioListResponseDto {
  data: ComentarioResponseDto[];
  total: number;
}
