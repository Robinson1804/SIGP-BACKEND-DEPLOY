import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tarea } from './tarea.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';

@Entity({ schema: 'agile', name: 'evidencias_tarea' })
export class EvidenciaTarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tarea_id' })
  tareaId: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 50, nullable: true })
  tipo: string; // 'documento', 'imagen', 'video', 'enlace', etc.

  @Column({ name: 'tamano_bytes', type: 'bigint', nullable: true })
  tamanoBytes: number;

  @Column({ name: 'subido_por' })
  subidoPor: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Tarea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarea_id' })
  tarea: Tarea;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'subido_por' })
  usuario: Usuario;
}
