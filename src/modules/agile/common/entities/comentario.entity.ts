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
import { Usuario } from '../../../auth/entities/usuario.entity';

export enum EntidadTipoComentario {
  HU = 'HU',
  TAREA = 'TAREA',
  SUBTAREA = 'SUBTAREA',
}

@Entity('comentarios', { schema: 'agile' })
export class Comentario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entidad_tipo', type: 'varchar', length: 20, enum: EntidadTipoComentario })
  @Index()
  entidadTipo: EntidadTipoComentario;

  @Column({ name: 'entidad_id', type: 'int' })
  @Index()
  entidadId: number;

  @Column({ type: 'text' })
  texto: string;

  @Column({ name: 'respuesta_a', nullable: true })
  @Index()
  respuestaA: number;

  @ManyToOne(() => Comentario, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'respuesta_a' })
  comentarioPadre: Comentario;

  @Column({ name: 'usuario_id' })
  @Index()
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ default: true })
  @Index()
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
