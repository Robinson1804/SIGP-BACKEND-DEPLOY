import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { HuPrioridad, HuEstimacion, HuEstado } from '../enums/historia-usuario.enum';
import { Proyecto } from '../../../poi/proyectos/entities/proyecto.entity';
import { Epica } from '../../epicas/entities/epica.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { CriterioAceptacion } from './criterio-aceptacion.entity';
import { HuDependencia } from './hu-dependencia.entity';
import { Requerimiento } from '../../../poi/requerimientos/entities/requerimiento.entity';
import { DateOnlyTransformer } from '../../../../common/transformers/date.transformer';

@Entity({ schema: 'agile', name: 'historias_usuario' })
export class HistoriaUsuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proyecto_id' })
  proyectoId: number;

  @Column({ name: 'epica_id', nullable: true })
  epicaId: number | null;

  @Column({ name: 'sprint_id', nullable: true })
  sprintId: number | null;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  rol: string | null;

  @Column({ type: 'text', nullable: true })
  quiero: string | null;

  @Column({ type: 'text', nullable: true })
  para: string | null;

  @Column({
    type: 'enum',
    enum: HuPrioridad,
    nullable: true,
    default: HuPrioridad.MEDIA,
  })
  prioridad: HuPrioridad | null;

  @Column({
    type: 'enum',
    enum: HuEstimacion,
    nullable: true,
  })
  estimacion: HuEstimacion | null;

  @Column({ name: 'story_points', type: 'int', nullable: true })
  storyPoints: number | null;

  @Column({
    type: 'enum',
    enum: HuEstado,
    default: HuEstado.POR_HACER,
  })
  estado: HuEstado;

  // Campo asignado_a ahora almacena múltiples IDs como array separado por comas
  @Column({ name: 'asignado_a', type: 'simple-array', nullable: true })
  asignadoA: number[];

  @Column({ name: 'orden_backlog', type: 'int', nullable: true })
  ordenBacklog: number | null;

  @Column({ name: 'requerimiento_id', nullable: true })
  requerimientoId: number | null;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true, transformer: DateOnlyTransformer })
  fechaInicio: string | null;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true, transformer: DateOnlyTransformer })
  fechaFin: string | null;

  @Column({ name: 'imagen_url', type: 'text', nullable: true })
  imagenUrl: string | null;

  /**
   * URL del documento PDF generado con las evidencias de todas las tareas.
   * Se genera automáticamente cuando todas las tareas de la HU tienen
   * evidencias adjuntas y están en estado "Finalizado".
   * Al generarse, la HU pasa a estado "En revisión".
   */
  @Column({ name: 'documento_evidencias_url', type: 'text', nullable: true })
  documentoEvidenciasUrl: string | null;

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

  @ManyToOne(() => Epica, { nullable: true })
  @JoinColumn({ name: 'epica_id' })
  epica: Epica;

  @ManyToOne(() => Sprint, { nullable: true })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint;

  // Nota: La relación asignado fue removida porque asignado_a ahora es un array de IDs
  // Para obtener los datos del personal, se debe hacer una consulta separada

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creador: Usuario;

  @ManyToOne(() => Requerimiento, { nullable: true })
  @JoinColumn({ name: 'requerimiento_id' })
  requerimiento: Requerimiento;

  @OneToMany(() => CriterioAceptacion, (criterio) => criterio.historiaUsuario)
  criteriosAceptacion: CriterioAceptacion[];

  @OneToMany(() => HuDependencia, (dep) => dep.historiaUsuario)
  dependencias: HuDependencia[];
}
