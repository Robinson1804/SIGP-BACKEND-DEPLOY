import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './usuario.entity';

export enum TipoDato {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

@Entity('configuraciones', { schema: 'public' })
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  clave: string;

  @Column({ type: 'text', nullable: true })
  valor: string;

  @Column({ name: 'valor_json', type: 'jsonb', nullable: true })
  valorJson: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'tipo_dato', type: 'varchar', length: 20, nullable: true, enum: TipoDato })
  tipoDato: TipoDato;

  @Column({ name: 'es_publica', type: 'boolean', default: false })
  @Index()
  esPublica: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: Usuario;
}
