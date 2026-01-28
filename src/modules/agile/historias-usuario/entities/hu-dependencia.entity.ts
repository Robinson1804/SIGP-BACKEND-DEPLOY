import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoDependencia } from '../enums/historia-usuario.enum';
import { HistoriaUsuario } from './historia-usuario.entity';

@Entity({ schema: 'agile', name: 'hu_dependencias' })
export class HuDependencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'historia_usuario_id' })
  historiaUsuarioId: number;

  @Column({ name: 'depende_de_id' })
  dependeDeId: number;

  @Column({
    name: 'tipo_dependencia',
    type: 'enum',
    enum: TipoDependencia,
  })
  tipoDependencia: TipoDependencia;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => HistoriaUsuario, (hu) => hu.dependencias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_usuario_id' })
  historiaUsuario: HistoriaUsuario;

  @ManyToOne(() => HistoriaUsuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'depende_de_id' })
  dependeDe: HistoriaUsuario;
}
