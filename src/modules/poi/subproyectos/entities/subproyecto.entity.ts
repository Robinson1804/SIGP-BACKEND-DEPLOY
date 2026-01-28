import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProyectoEstado } from '../../proyectos/enums/proyecto-estado.enum';

@Entity('subproyectos', { schema: 'poi' })
export class Subproyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'proyecto_padre_id' })
  proyectoPadreId: number;

  @ManyToOne('Proyecto', 'subproyectos')
  @JoinColumn({ name: 'proyecto_padre_id' })
  proyectoPadre: any;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monto: number;

  // Años del subproyecto
  @Column({ type: 'simple-array', nullable: true })
  anios: number[];

  // Áreas financieras
  @Column({ name: 'areas_financieras', type: 'simple-array', nullable: true })
  areasFinancieras: string[];

  /**
   * @deprecated Los responsables ahora se manejan via tabla rrhh.asignaciones
   * con tipoAsignacion='Subproyecto'. Este campo se mantiene por compatibilidad
   * pero no se usa activamente.
   */
  @Column({ type: 'simple-array', nullable: true })
  responsables: number[];

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    default: ProyectoEstado.PENDIENTE,
    enum: ProyectoEstado,
  })
  estado: ProyectoEstado;

  // Equipo propio
  @Column({ name: 'scrum_master_id', nullable: true })
  scrumMasterId: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'scrum_master_id' })
  scrumMaster: any;

  // Fechas
  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date;

  // Auditoría
  @Index()
  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null | undefined;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relaciones inversas
  @OneToMany('Documento', 'subproyecto')
  documentos: any[];
}
