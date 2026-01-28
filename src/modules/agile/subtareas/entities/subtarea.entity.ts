import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tarea } from '../../tareas/entities/tarea.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { TareaEstado, TareaPrioridad } from '../../tareas/enums/tarea.enum';

@Entity({ schema: 'agile', name: 'subtareas' })
export class Subtarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tarea_id' })
  tareaId: number;

  @ManyToOne(() => Tarea)
  @JoinColumn({ name: 'tarea_id' })
  tarea: Tarea;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TareaEstado.POR_HACER,
  })
  estado: TareaEstado;

  @Column({
    type: 'varchar',
    length: 10,
    default: TareaPrioridad.MEDIA,
  })
  prioridad: TareaPrioridad;

  @Column({ name: 'responsable_id', nullable: true })
  responsableId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsable_id' })
  responsable: Usuario;

  @Column({ name: 'horas_estimadas', type: 'decimal', precision: 6, scale: 2, nullable: true })
  horasEstimadas: number;

  @Column({ name: 'horas_reales', type: 'decimal', precision: 6, scale: 2, nullable: true })
  horasReales: number;

  @Column({ name: 'evidencia_url', type: 'text', nullable: true })
  evidenciaUrl: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null | undefined;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null | undefined;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: Usuario;
}
