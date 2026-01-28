import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InformeSprintEstado } from '../enums/informe-sprint.enum';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';

@Entity({ schema: 'poi', name: 'informes_sprint' })
export class InformeSprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proyecto_id' })
  proyectoId: number;

  @Column({ length: 20 })
  codigo: string;

  @Column({ name: 'numero_sprint', type: 'int' })
  numeroSprint: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @Column({ name: 'objetivo_sprint', type: 'text', nullable: true })
  objetivoSprint: string;

  @Column({ name: 'historias_planificadas', type: 'jsonb', nullable: true })
  historiasPlanificadas: {
    id: string;
    titulo: string;
    puntos: number;
    estado: string;
  }[];

  @Column({ name: 'historias_completadas', type: 'jsonb', nullable: true })
  historiasCompletadas: {
    id: string;
    titulo: string;
    puntos: number;
  }[];

  @Column({ name: 'puntos_planificados', type: 'int', nullable: true })
  puntosPlanificados: number;

  @Column({ name: 'puntos_completados', type: 'int', nullable: true })
  puntosCompletados: number;

  @Column({ name: 'velocidad_sprint', type: 'decimal', precision: 5, scale: 2, nullable: true })
  velocidadSprint: number;

  @Column({ type: 'jsonb', nullable: true })
  impedimentos: { descripcion: string; resolucion?: string; resuelto: boolean }[];

  @Column({ type: 'jsonb', nullable: true })
  retrospectiva: {
    queFueBien: string[];
    queMejorar: string[];
    accionesProximoSprint: string[];
  };

  @Column({ name: 'burndown_data', type: 'jsonb', nullable: true })
  burndownData: { dia: number; puntosRestantes: number }[];

  @Column({
    type: 'enum',
    enum: InformeSprintEstado,
    default: InformeSprintEstado.BORRADOR,
  })
  estado: InformeSprintEstado;

  @Column({ name: 'aprobado_por', nullable: true })
  aprobadoPor: number;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
  fechaAprobacion: Date;

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

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'aprobado_por' })
  aprobador: Usuario;
}
