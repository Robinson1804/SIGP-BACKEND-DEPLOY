import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tarea } from './tarea.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';

@Entity({ schema: 'agile', name: 'tarea_asignados' })
export class TareaAsignado {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'tarea_id' })
  tareaId: number;

  @Index()
  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ length: 50, default: 'IMPLEMENTADOR' })
  rol: string;

  @Column({ name: 'asignado_en', type: 'timestamp with time zone', default: () => 'NOW()' })
  asignadoEn: Date;

  @Column({ name: 'asignado_por', nullable: true })
  asignadoPor: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tarea, (tarea) => tarea.asignados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarea_id' })
  tarea: Tarea;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'asignado_por' })
  asignadoPorUsuario: Usuario;
}
