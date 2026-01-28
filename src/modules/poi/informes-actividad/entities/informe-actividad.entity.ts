import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InformeActividadEstado, PeriodoInforme } from '../enums/informe-actividad.enum';
import { Actividad } from '../../actividades/entities/actividad.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';

@Entity({ schema: 'poi', name: 'informes_actividad' })
export class InformeActividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'actividad_id' })
  actividadId: number;

  @Column({ length: 20 })
  codigo: string;

  @Column({
    type: 'enum',
    enum: PeriodoInforme,
    default: PeriodoInforme.MENSUAL,
  })
  periodo: PeriodoInforme;

  @Column({ name: 'numero_periodo', type: 'int' })
  numeroPeriodo: number;

  @Column({ name: 'anio', type: 'int' })
  anio: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @Column({ name: 'tareas_pendientes', type: 'jsonb', nullable: true })
  tareasPendientes: {
    id: string;
    titulo: string;
    responsable?: string;
    fechaLimite?: string;
  }[];

  @Column({ name: 'tareas_en_progreso', type: 'jsonb', nullable: true })
  tareasEnProgreso: {
    id: string;
    titulo: string;
    responsable?: string;
    porcentajeAvance?: number;
  }[];

  @Column({ name: 'tareas_completadas', type: 'jsonb', nullable: true })
  tareasCompletadas: {
    id: string;
    titulo: string;
    responsable?: string;
    fechaCompletado?: string;
  }[];

  @Column({ name: 'total_tareas_pendientes', type: 'int', default: 0 })
  totalTareasPendientes: number;

  @Column({ name: 'total_tareas_en_progreso', type: 'int', default: 0 })
  totalTareasEnProgreso: number;

  @Column({ name: 'total_tareas_completadas', type: 'int', default: 0 })
  totalTareasCompletadas: number;

  @Column({ type: 'jsonb', nullable: true })
  logros: string[];

  @Column({ type: 'jsonb', nullable: true })
  problemas: { descripcion: string; accion?: string; resuelto: boolean }[];

  @Column({ name: 'proximas_acciones', type: 'jsonb', nullable: true })
  proximasAcciones: string[];

  @Column({
    type: 'enum',
    enum: InformeActividadEstado,
    default: InformeActividadEstado.BORRADOR,
  })
  estado: InformeActividadEstado;

  @Column({ name: 'aprobado_por', nullable: true })
  aprobadoPor: number;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
  fechaAprobacion: Date;

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
  @ManyToOne(() => Actividad, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actividad_id' })
  actividad: Actividad;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'aprobado_por' })
  aprobador: Usuario;
}
