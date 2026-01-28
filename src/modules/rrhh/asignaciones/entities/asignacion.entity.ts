import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { TipoAsignacion } from '../enums/tipo-asignacion.enum';
import { Personal } from '../../personal/entities/personal.entity';

@Entity({ schema: 'rrhh', name: 'asignaciones' })
@Check(`"porcentaje_dedicacion" > 0 AND "porcentaje_dedicacion" <= 100`)
export class Asignacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'personal_id' })
  personalId: number;

  @ManyToOne(() => Personal, (personal) => personal.asignaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'personal_id' })
  personal: Personal;

  @Index()
  @Column({
    name: 'tipo_asignacion',
    type: 'varchar',
    length: 30,
  })
  tipoAsignacion: TipoAsignacion;

  // Referencias polimórficas: solo una debe estar poblada según tipoAsignacion
  @Index()
  @Column({ name: 'proyecto_id', nullable: true })
  proyectoId: number;

  @ManyToOne('Proyecto', { nullable: true })
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: any;

  @Index()
  @Column({ name: 'actividad_id', nullable: true })
  actividadId: number;

  @ManyToOne('Actividad', { nullable: true })
  @JoinColumn({ name: 'actividad_id' })
  actividad: any;

  @Index()
  @Column({ name: 'subproyecto_id', nullable: true })
  subproyectoId: number;

  @ManyToOne('Subproyecto', { nullable: true })
  @JoinColumn({ name: 'subproyecto_id' })
  subproyecto: any;

  @Column({ name: 'rol_equipo', length: 50, nullable: true })
  rolEquipo: string;

  @Column({
    name: 'porcentaje_dedicacion',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  porcentajeDedicacion: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date;

  @Index()
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
}
