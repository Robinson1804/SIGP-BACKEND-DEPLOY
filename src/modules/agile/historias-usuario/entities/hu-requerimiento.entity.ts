import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { HistoriaUsuario } from './historia-usuario.entity';
import { Requerimiento } from '../../../poi/requerimientos/entities/requerimiento.entity';

@Entity('hu_requerimientos', { schema: 'agile' })
@Unique(['historiaUsuarioId', 'requerimientoId'])
export class HuRequerimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'historia_usuario_id' })
  @Index()
  historiaUsuarioId: number;

  @ManyToOne(() => HistoriaUsuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_usuario_id' })
  historiaUsuario: HistoriaUsuario;

  @Column({ name: 'requerimiento_id' })
  @Index()
  requerimientoId: number;

  @ManyToOne(() => Requerimiento, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requerimiento_id' })
  requerimiento: Requerimiento;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
