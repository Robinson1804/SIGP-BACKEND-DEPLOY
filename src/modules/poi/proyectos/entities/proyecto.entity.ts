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
import { ProyectoEstado, Clasificacion } from '../enums/proyecto-estado.enum';
import { DateOnlyTransformer } from '../../../../common/transformers/date.transformer';

@Entity('proyectos', { schema: 'poi' })
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true, length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 20, default: 'Proyecto' })
  tipo: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    enum: Clasificacion,
  })
  clasificacion: Clasificacion;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    default: ProyectoEstado.PENDIENTE,
    enum: ProyectoEstado,
  })
  estado: ProyectoEstado;

  // Vinculación estratégica
  @Column({ name: 'accion_estrategica_id', nullable: true })
  accionEstrategicaId: number;

  @ManyToOne('AccionEstrategica', { nullable: true })
  @JoinColumn({ name: 'accion_estrategica_id' })
  accionEstrategica: any;

  // Responsables
  @Index()
  @Column({ name: 'coordinador_id', nullable: true })
  coordinadorId: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'coordinador_id' })
  coordinador: any;

  @Index()
  @Column({ name: 'scrum_master_id', nullable: true })
  scrumMasterId: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'scrum_master_id' })
  scrumMaster: any;

  @Column({ name: 'patrocinador_id', nullable: true })
  patrocinadorId: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'patrocinador_id' })
  patrocinador: any;

  // Área Responsable del Proyecto (ej: OTIN, OGD, etc.)
  @Column({ name: 'area_responsable', length: 100, nullable: true })
  areaResponsable: string;

  // Financiero
  @Column({ length: 100, nullable: true })
  coordinacion: string;

  @Column({ name: 'areas_financieras', type: 'text', array: true, nullable: true })
  areasFinancieras: string[];

  @Column({ name: 'monto_anual', type: 'decimal', precision: 15, scale: 2, nullable: true })
  montoAnual: number;

  @Column({ type: 'integer', array: true, nullable: true })
  anios: number[];

  // Costos estimados por año [{anio: number, monto: number}]
  @Column({ name: 'costos_anuales', type: 'jsonb', nullable: true })
  costosAnuales: { anio: number; monto: number }[];

  // Alcance del proyecto (lista de items)
  @Column({ type: 'text', array: true, nullable: true })
  alcances: string[];

  // Problemática identificada
  @Column({ type: 'text', nullable: true })
  problematica: string;

  // Beneficiarios del proyecto
  @Column({ type: 'text', nullable: true })
  beneficiarios: string;

  // Beneficios del proyecto (lista de items)
  @Column({ type: 'text', array: true, nullable: true })
  beneficios: string[];

  // Fechas
  @Column({ name: 'fecha_inicio', type: 'date', nullable: true, transformer: DateOnlyTransformer })
  fechaInicio: string | null;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true, transformer: DateOnlyTransformer })
  fechaFin: string | null;

  // Metodología (siempre Scrum para proyectos)
  @Column({ name: 'metodo_gestion', length: 20, default: 'Scrum' })
  metodoGestion: string;

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
  @OneToMany('Subproyecto', 'proyectoPadre')
  subproyectos: any[];

  @OneToMany('Documento', 'proyecto')
  documentos: any[];

  @OneToMany('Acta', 'proyecto')
  actas: any[];

  @OneToMany('Requerimiento', 'proyecto')
  requerimientos: any[];

  @OneToMany('Cronograma', 'proyecto')
  cronogramas: any[];
}
