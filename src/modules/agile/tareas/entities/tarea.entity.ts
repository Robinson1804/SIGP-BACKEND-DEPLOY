import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TareaTipo, TareaEstado, TareaPrioridad } from '../enums/tarea.enum';
import { HistoriaUsuario } from '../../historias-usuario/entities/historia-usuario.entity';
import { Actividad } from '../../../poi/actividades/entities/actividad.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { TareaAsignado } from './tarea-asignado.entity';

@Entity({ schema: 'agile', name: 'tareas' })
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TareaTipo,
  })
  tipo: TareaTipo;

  @Column({ name: 'historia_usuario_id', nullable: true })
  historiaUsuarioId: number;

  @Column({ name: 'actividad_id', nullable: true })
  actividadId: number;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: TareaEstado,
    default: TareaEstado.POR_HACER,
  })
  estado: TareaEstado;

  @Column({
    type: 'enum',
    enum: TareaPrioridad,
    default: TareaPrioridad.MEDIA,
  })
  prioridad: TareaPrioridad;

  @Column({ name: 'asignado_a', nullable: true })
  asignadoA: number;

  @Column({ name: 'horas_estimadas', type: 'decimal', precision: 5, scale: 2, nullable: true })
  horasEstimadas: number;

  @Column({ name: 'horas_reales', type: 'decimal', precision: 5, scale: 2, nullable: true })
  horasReales: number;

  // Campo evidencia_url eliminado - usar tabla evidencias_tarea en su lugar

  /**
   * URL del documento PDF generado con las evidencias de todas las subtareas.
   * Solo aplica para tareas KANBAN.
   * Se genera automáticamente cuando todas las subtareas de la tarea tienen
   * evidencias adjuntas y están en estado "Finalizado".
   * Al generarse, la tarea pasa a estado "En revisión".
   */
  @Column({ name: 'documento_evidencias_url', type: 'text', nullable: true })
  documentoEvidenciasUrl: string | null;

  @Column({ default: false })
  validada: boolean;

  @Column({ name: 'validada_por', nullable: true })
  validadaPor: number;

  @Column({ name: 'fecha_validacion', type: 'timestamp', nullable: true })
  fechaValidacion: Date;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date;

  // Campos para métricas Kanban precisas (Lead Time / Cycle Time)
  @Column({ name: 'fecha_inicio_progreso', type: 'timestamp with time zone', nullable: true })
  fechaInicioProgreso: Date;

  @Column({ name: 'fecha_completado', type: 'timestamp with time zone', nullable: true })
  fechaCompletado: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null | undefined;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null | undefined;

  // Relations
  @ManyToOne(() => HistoriaUsuario, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_usuario_id' })
  historiaUsuario: HistoriaUsuario;

  @ManyToOne(() => Actividad, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actividad_id' })
  actividad: Actividad;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'asignado_a' })
  asignado: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'validada_por' })
  validador: Usuario;

  @OneToMany(() => TareaAsignado, (ta) => ta.tarea)
  asignados: TareaAsignado[];

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: Usuario;
}
