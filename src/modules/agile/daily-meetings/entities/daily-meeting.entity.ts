import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { DailyMeetingTipo } from '../enums/daily-meeting.enum';
import { DailyParticipante } from './daily-participante.entity';

@Entity({ schema: 'agile', name: 'daily_meetings' })
export class DailyMeeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'tipo',
    type: 'varchar',
    length: 20,
  })
  tipo: DailyMeetingTipo;

  @Column({ name: 'proyecto_id', nullable: true })
  proyectoId: number;

  @Column({ name: 'actividad_id', nullable: true })
  actividadId: number;

  @Column({ name: 'sprint_id', nullable: true })
  sprintId: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  horaInicio: string;

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  horaFin: string;

  @Column({ name: 'facilitador_id', nullable: true })
  facilitadorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'facilitador_id' })
  facilitador: Usuario;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ name: 'link_reunion', length: 500, nullable: true })
  linkReunion: string;

  @OneToMany(() => DailyParticipante, (participante) => participante.dailyMeeting, {
    cascade: true,
  })
  participantes: DailyParticipante[];

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
}
