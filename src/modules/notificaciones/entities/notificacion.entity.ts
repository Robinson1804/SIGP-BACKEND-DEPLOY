import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TipoNotificacion } from '../enums/tipo-notificacion.enum';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Proyecto } from '../../poi/proyectos/entities/proyecto.entity';

@Entity({ schema: 'notificaciones', name: 'notificaciones' })
@Index(['destinatarioId', 'leida', 'createdAt'])
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoNotificacion })
  @Index()
  tipo: TipoNotificacion;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entidadTipo: string;

  @Column({ type: 'int', nullable: true })
  entidadId: number;

  @Column({ type: 'int', nullable: true })
  proyectoId: number;

  @ManyToOne(() => Proyecto, { nullable: true })
  @JoinColumn({ name: 'proyectoId' })
  proyecto: Proyecto;

  @Column({ type: 'int' })
  @Index()
  destinatarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'destinatarioId' })
  destinatario: Usuario;

  @Column({ type: 'boolean', default: false })
  @Index()
  leida: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  fechaLeida: Date;

  @Column({ type: 'text', nullable: true })
  observacion: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  urlAccion: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Index()
  createdAt: Date;
}
