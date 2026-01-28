import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { DailyMeeting } from '../../daily-meetings/entities/daily-meeting.entity';
import { ImpedimentoPrioridad, ImpedimentoEstado } from '../enums/impedimento.enum';

@Entity({ schema: 'agile', name: 'impedimentos' })
export class Impedimento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'proyecto_id' })
  proyectoId: number;

  @Column({ name: 'sprint_id', nullable: true })
  sprintId: number;

  @Column({ name: 'actividad_id', nullable: true })
  actividadId: number;

  @Column({ name: 'daily_meeting_id', nullable: true })
  dailyMeetingId: number;

  @ManyToOne(() => DailyMeeting, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'daily_meeting_id' })
  dailyMeeting: DailyMeeting;

  @Column({ name: 'reportado_por_id' })
  reportadoPorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'reportado_por_id' })
  reportadoPor: Usuario;

  @Column({ name: 'responsable_id', nullable: true })
  responsableId: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Usuario;

  @Column({
    type: 'varchar',
    length: 20,
    default: ImpedimentoPrioridad.MEDIA,
  })
  prioridad: ImpedimentoPrioridad;

  @Column({
    type: 'varchar',
    length: 20,
    default: ImpedimentoEstado.ABIERTO,
  })
  estado: ImpedimentoEstado;

  @Column({ name: 'fecha_reporte', type: 'date' })
  fechaReporte: Date;

  @Column({ name: 'fecha_limite', type: 'date', nullable: true })
  fechaLimite: Date;

  @Column({ type: 'text', nullable: true })
  resolucion: string;

  @Column({ name: 'fecha_resolucion', type: 'timestamp', nullable: true })
  fechaResolucion: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
