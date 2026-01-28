import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TipoDependencia } from '../enums/cronograma.enum';
import { Cronograma } from './cronograma.entity';
import { TareaCronograma } from './tarea-cronograma.entity';

@Entity({ schema: 'poi', name: 'dependencias_cronograma' })
@Unique(['tareaOrigenId', 'tareaDestinoId'])
export class DependenciaCronograma {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cronograma_id' })
  cronogramaId: number;

  @Column({ name: 'tarea_origen_id' })
  tareaOrigenId: number;

  @Column({ name: 'tarea_destino_id' })
  tareaDestinoId: number;

  @Column({
    type: 'enum',
    enum: TipoDependencia,
    default: TipoDependencia.FS,
  })
  tipo: TipoDependencia;

  @Column({ type: 'int', default: 0 })
  lag: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Cronograma, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cronograma_id' })
  cronograma: Cronograma;

  @ManyToOne(() => TareaCronograma, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarea_origen_id' })
  tareaOrigen: TareaCronograma;

  @ManyToOne(() => TareaCronograma, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarea_destino_id' })
  tareaDestino: TareaCronograma;
}
