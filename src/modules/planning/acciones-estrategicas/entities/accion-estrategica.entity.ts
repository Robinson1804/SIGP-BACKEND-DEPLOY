import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Oegd } from '../../oegd/entities/oegd.entity';
import { MetaAnual } from '../../oei/entities/oei.entity';

@Entity('acciones_estrategicas', { schema: 'planning' })
@Index(['oegdId', 'codigo'], { unique: true }) // Código único dentro del mismo OEGD
export class AccionEstrategica {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'oegd_id' })
  oegdId: number;

  @Index()
  @Column({ length: 50 }) // Removido unique: true, ahora es composite con oegdId
  codigo: string;

  @Column({ length: 300 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'indicador_codigo', length: 50, nullable: true })
  indicadorCodigo: string;

  @Column({ name: 'indicador_nombre', length: 500, nullable: true })
  indicadorNombre: string;

  @Column({ name: 'unidad_medida', length: 50, nullable: true })
  unidadMedida: string;

  @Column({ name: 'linea_base_anio', type: 'int', nullable: true })
  lineaBaseAnio: number;

  @Column({ name: 'linea_base_valor', type: 'decimal', precision: 15, scale: 2, nullable: true })
  lineaBaseValor: number;

  @Column({ name: 'metas_anuales', type: 'jsonb', nullable: true })
  metasAnuales: MetaAnual[];

  @Column({ name: 'responsable_area', length: 100, nullable: true })
  responsableArea: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date;

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

  // Relations
  @ManyToOne(() => Oegd, (oegd) => oegd.accionesEstrategicas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oegd_id' })
  oegd: Oegd;
}
