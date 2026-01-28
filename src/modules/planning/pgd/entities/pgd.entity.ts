import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum PgdEstado {
  BORRADOR = 'BORRADOR',
  VIGENTE = 'VIGENTE',
  FINALIZADO = 'FINALIZADO',
}

@Entity('pgd', { schema: 'planning' })
export class Pgd {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Index()
  @Column({ name: 'anio_inicio', type: 'int' })
  anioInicio: number;

  @Column({ name: 'anio_fin', type: 'int' })
  anioFin: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    enum: PgdEstado,
    default: PgdEstado.BORRADOR,
  })
  estado: PgdEstado;

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
  @OneToMany('Oei', 'pgd')
  objetivosEstrategicos: any[];

  @OneToMany('Ogd', 'pgd')
  objetivosGobiernoDigital: any[];
}
