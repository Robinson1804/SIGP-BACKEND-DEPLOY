import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Personal } from '../../personal/entities/personal.entity';

@Entity({ schema: 'rrhh', name: 'divisiones' })
export class Division {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Jerarquía: self-reference
  @Column({ name: 'division_padre_id', nullable: true })
  divisionPadreId: number;

  @ManyToOne(() => Division, (division) => division.hijos, { nullable: true })
  @JoinColumn({ name: 'division_padre_id' })
  divisionPadre: Division;

  @OneToMany(() => Division, (division) => division.divisionPadre)
  hijos: Division[];

  // Jefe de división (referencia a Personal)
  @Column({ name: 'jefe_id', nullable: true })
  jefeId: number;

  @ManyToOne('Personal', { nullable: true })
  @JoinColumn({ name: 'jefe_id' })
  jefe: any;

  // Coordinador de la división (referencia a Personal)
  @Index()
  @Column({ name: 'coordinador_id', nullable: true })
  coordinadorId: number;

  @ManyToOne(() => Personal, { nullable: true })
  @JoinColumn({ name: 'coordinador_id' })
  coordinador: Personal;

  // Scrum Masters asignados (Many-to-Many con Personal)
  @ManyToMany(() => Personal)
  @JoinTable({
    name: 'division_scrum_masters',
    schema: 'rrhh',
    joinColumn: { name: 'division_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'personal_id', referencedColumnName: 'id' },
  })
  scrumMasters: Personal[];

  // Relación inversa con Personal
  @OneToMany('Personal', 'division')
  personal: any[];

  @Index()
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
}
