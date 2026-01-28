import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RequerimientoPrioridad, RequerimientoTipo } from '../enums/requerimiento.enum';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';

@Entity({ schema: 'poi', name: 'requerimientos' })
export class Requerimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proyecto_id' })
  proyectoId: number;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: RequerimientoTipo,
    default: RequerimientoTipo.FUNCIONAL,
  })
  tipo: RequerimientoTipo;

  @Column({
    type: 'enum',
    enum: RequerimientoPrioridad,
    default: RequerimientoPrioridad.MEDIA,
  })
  prioridad: RequerimientoPrioridad;

  @Column({ name: 'criterios_aceptacion', type: 'jsonb', nullable: true })
  criteriosAceptacion: { descripcion: string; cumplido?: boolean }[];

  @Column({ name: 'dependencias', type: 'jsonb', nullable: true })
  dependencias: number[];

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null | undefined;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null | undefined;

  // Relations
  @ManyToOne(() => Proyecto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: Proyecto;
}
