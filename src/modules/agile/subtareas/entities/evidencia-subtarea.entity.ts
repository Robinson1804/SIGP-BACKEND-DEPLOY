import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subtarea } from './subtarea.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';

/**
 * Entidad para almacenar evidencias de subtareas (KANBAN)
 *
 * Cada subtarea puede tener múltiples evidencias (archivos adjuntos).
 * Cuando todas las subtareas de una tarea KANBAN tienen evidencias
 * y están en estado "Finalizado", se genera un PDF consolidado
 * y la tarea pasa a estado "En revisión".
 */
@Entity({ schema: 'agile', name: 'evidencias_subtarea' })
export class EvidenciaSubtarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subtarea_id' })
  subtareaId: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 50, nullable: true })
  tipo: string; // 'image/png', 'image/jpeg', 'docx', 'doc', 'pdf', etc.

  @Column({ name: 'tamano_bytes', type: 'bigint', nullable: true })
  tamanoBytes: number;

  @Column({ name: 'subido_por' })
  subidoPor: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Subtarea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subtarea_id' })
  subtarea: Subtarea;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'subido_por' })
  usuario: Usuario;
}
