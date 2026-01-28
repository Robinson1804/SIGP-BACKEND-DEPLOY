import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../../../auth/entities/usuario.entity';

@Entity('historial_cambios', { schema: 'agile' })
export class HistorialCambio {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'entidad_tipo', type: 'varchar', length: 20 })
  @Index()
  entidadTipo: string;

  @Column({ name: 'entidad_id', type: 'int' })
  @Index()
  entidadId: number;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  accion: string;

  @Column({ name: 'campo_modificado', type: 'varchar', length: 100, nullable: true })
  campoModificado: string;

  @Column({ name: 'valor_anterior', type: 'text', nullable: true })
  valorAnterior: string;

  @Column({ name: 'valor_nuevo', type: 'text', nullable: true })
  valorNuevo: string;

  @Column({ name: 'usuario_id' })
  @Index()
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  @Index()
  createdAt: Date;
}
