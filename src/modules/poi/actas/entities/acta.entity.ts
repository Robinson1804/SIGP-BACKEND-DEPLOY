import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ActaTipo, ActaEstado, TipoReunion, Modalidad } from '../enums/acta.enum';

@Entity('actas', { schema: 'poi' })
export class Acta {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'proyecto_id' })
  proyectoId: number;

  @ManyToOne('Proyecto', 'actas')
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: any;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Index()
  @Column({ type: 'varchar', length: 50, enum: ActaTipo })
  tipo: ActaTipo;

  @Column({ type: 'date' })
  fecha: Date;

  // Estado y aprobación
  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    default: ActaEstado.BORRADOR,
    enum: ActaEstado,
  })
  estado: ActaEstado;

  @Column({ name: 'archivo_url', length: 500, nullable: true })
  archivoUrl: string;

  // Campos de Acta de Reunión
  @Column({
    name: 'tipo_reunion',
    type: 'varchar',
    length: 50,
    nullable: true,
    enum: TipoReunion,
  })
  tipoReunion: TipoReunion;

  @Column({ name: 'fase_perteneciente', length: 100, nullable: true })
  fasePerteneciente: string;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  horaInicio: string;

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  horaFin: string;

  @Column({ type: 'jsonb', nullable: true })
  asistentes: any[];

  @Column({ type: 'jsonb', nullable: true })
  ausentes: any[];

  @Column({ type: 'jsonb', nullable: true })
  agenda: any[];

  @Column({ name: 'temas_desarrollados', type: 'jsonb', nullable: true })
  temasDesarrollados: any[];

  @Column({ type: 'jsonb', nullable: true })
  acuerdos: any[];

  @Column({ name: 'proximos_pasos', type: 'jsonb', nullable: true })
  proximosPasos: any[];

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Nuevos campos de Acta de Reunión
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    enum: Modalidad,
  })
  modalidad: Modalidad;

  @Column({ name: 'lugar_link', type: 'text', nullable: true })
  lugarLink: string;

  @Column({ name: 'moderador_id', nullable: true })
  moderadorId: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'moderador_id' })
  moderador: any;

  @Column({ name: 'proxima_reunion_fecha', type: 'date', nullable: true })
  proximaReunionFecha: Date;

  @Column({ name: 'anexos_referenciados', type: 'jsonb', nullable: true })
  anexosReferenciados: any[];

  // Campos de Acta de Constitución
  @Column({ name: 'objetivo_smart', type: 'text', nullable: true })
  objetivoSmart: string;

  @Column({ type: 'jsonb', nullable: true })
  alcance: string[];

  @Column({ name: 'fuera_de_alcance', type: 'jsonb', nullable: true })
  fueraDeAlcance: string[];

  @Column({ type: 'jsonb', nullable: true })
  entregables: any[];

  @Column({ type: 'jsonb', nullable: true })
  riesgos: any[];

  @Column({ name: 'presupuesto_estimado', type: 'decimal', precision: 15, scale: 2, nullable: true })
  presupuestoEstimado: number;

  // Nuevos campos de Acta de Constitución
  @Column({ type: 'text', nullable: true })
  justificacion: string;

  @Column({ type: 'jsonb', nullable: true })
  supuestos: string[];

  @Column({ type: 'jsonb', nullable: true })
  restricciones: string[];

  @Column({ name: 'cronograma_hitos', type: 'jsonb', nullable: true })
  cronogramaHitos: any[];

  @Column({ name: 'equipo_proyecto', type: 'jsonb', nullable: true })
  equipoProyecto: any[];

  // Campos de Acta de Daily Meeting
  @Column({ name: 'sprint_id', nullable: true })
  sprintId: number;

  @Column({ name: 'sprint_nombre', length: 200, nullable: true })
  sprintNombre: string;

  @Column({ name: 'duracion_minutos', type: 'int', nullable: true })
  duracionMinutos: number;

  @Column({ name: 'participantes_daily', type: 'jsonb', nullable: true })
  participantesDaily: {
    id?: string;
    personalId?: number;
    nombre: string;
    cargo?: string;
    ayer: string;
    hoy: string;
    impedimentos: string;
  }[];

  @Column({ name: 'impedimentos_generales', type: 'jsonb', nullable: true })
  impedimentosGenerales: string[];

  @Column({ name: 'notas_adicionales', type: 'text', nullable: true })
  notasAdicionales: string;

  // Documento firmado
  @Column({ name: 'documento_firmado_url', type: 'text', nullable: true })
  documentoFirmadoUrl: string;

  @Column({ name: 'documento_firmado_fecha', type: 'timestamp with time zone', nullable: true })
  documentoFirmadoFecha: Date;

  @Column({ name: 'comentario_rechazo', type: 'text', nullable: true })
  comentarioRechazo: string | null;

  // Aprobación simple (para actas de reunión y daily)
  @Column({ name: 'aprobado_por', nullable: true })
  aprobadoPor: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'aprobado_por' })
  aprobador: any;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp with time zone', nullable: true })
  fechaAprobacion: Date;

  // Aprobación dual (para Acta de Constitución - PMO y PATROCINADOR)
  @Column({ name: 'aprobado_por_pmo', default: false })
  aprobadoPorPmo: boolean;

  @Column({ name: 'fecha_aprobacion_pmo', type: 'timestamp with time zone', nullable: true })
  fechaAprobacionPmo: Date | null;

  @Column({ name: 'aprobado_por_patrocinador', default: false })
  aprobadoPorPatrocinador: boolean;

  @Column({ name: 'fecha_aprobacion_patrocinador', type: 'timestamp with time zone', nullable: true })
  fechaAprobacionPatrocinador: Date | null;

  // Auditoría
  @Index()
  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null | undefined;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
