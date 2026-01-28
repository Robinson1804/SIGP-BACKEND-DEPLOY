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
import { Pgd } from '../../pgd/entities/pgd.entity';
import { MetaAnual } from '../../oei/entities/oei.entity';

@Entity('ogd', { schema: 'planning' })
@Index(['pgdId', 'codigo'], { unique: true }) // Código único dentro del mismo PGD
export class Ogd {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'pgd_id' })
  pgdId: number;

  @Index()
  @Column({ length: 50 }) // Removido unique: true, ahora es composite con pgdId
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
  @ManyToOne(() => Pgd, (pgd) => pgd.objetivosGobiernoDigital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pgd_id' })
  pgd: Pgd;

  @OneToMany('Oegd', 'ogd')
  objetivosEspecificos: any[];

  // Relación Many-to-Many con OEI (via tabla ogd_oei)
  @OneToMany('OgdOei', 'ogd')
  ogdOeis: any[];
}
