import { TipoNotificacion } from '../enums/tipo-notificacion.enum';

export class NotificacionResponseDto {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  entidadTipo: string | null;
  entidadId: number | null;
  proyectoId: number | null;
  leida: boolean;
  fechaLeida: Date | null;
  urlAccion: string | null;
  createdAt: Date;
}
