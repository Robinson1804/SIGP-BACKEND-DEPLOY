export class EvidenciaTareaResponseDto {
  id: number;
  tareaId: number;
  nombre: string;
  descripcion?: string;
  url: string;
  tipo?: string;
  tamanoBytes?: number;
  subidoPor: number;
  createdAt: Date;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}
