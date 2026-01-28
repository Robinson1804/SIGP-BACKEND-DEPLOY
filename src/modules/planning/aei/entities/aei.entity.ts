import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Oei, MetaAnual } from '../../oei/entities/oei.entity';

@Entity('aei', { schema: 'planning' })
@Index(['oeiId', 'codigo'], { unique: true }) // Código único dentro del mismo OEI
export class Aei {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'oei_id' })
  oeiId: number;

  @Index()
  @Column({ length: 50 }) // Removido unique: true, ahora es composite con oeiId
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
  @ManyToOne(() => Oei, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oei_id' })
  oei: Oei;

  // Relación Many-to-Many con OEGD (via tabla oegd_aei)
  @ManyToMany('Oegd', 'aeis')
  oegds: any[];
}
