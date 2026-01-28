import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { HabilidadCategoria } from '../enums/habilidad-categoria.enum';

@Entity({ schema: 'rrhh', name: 'habilidades' })
export class Habilidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 100 })
  nombre: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
  })
  categoria: HabilidadCategoria;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Index()
  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relación inversa
  @OneToMany('PersonalHabilidad', 'habilidad')
  personalHabilidades: any[];
}
