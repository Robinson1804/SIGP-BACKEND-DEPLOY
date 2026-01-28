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
import { DailyMeeting } from './daily-meeting.entity';

@Entity({ schema: 'agile', name: 'daily_participantes' })
export class DailyParticipante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'daily_meeting_id' })
  dailyMeetingId: number;

  @ManyToOne(() => DailyMeeting, (daily) => daily.participantes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'daily_meeting_id' })
  dailyMeeting: DailyMeeting;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'que_hice_ayer', type: 'text', nullable: true })
  queHiceAyer: string;

  @Column({ name: 'que_hare_hoy', type: 'text', nullable: true })
  queHareHoy: string;

  @Column({ type: 'text', nullable: true })
  impedimentos: string;

  @Column({ default: false })
  asistio: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
