export class ConteoResponseDto {
  total: number;
  porTipo: {
    Proyectos: number;
    Sprints: number;
    Retrasos: number;
    Aprobaciones: number;
    Tareas: number;
    Documentos: number;
    Sistema: number;
  };
}
