import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Modalidad } from '../enums/modalidad.enum';
import { Division } from '../../divisiones/entities/division.entity';

@Entity({ schema: 'rrhh', name: 'personal' })
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  // Vinculación opcional con usuario del sistema
  @Index()
  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: any;

  // División a la que pertenece
  @Index()
  @Column({ name: 'division_id', nullable: true })
  divisionId: number;

  @ManyToOne(() => Division, (division) => division.personal, { nullable: true })
  @JoinColumn({ name: 'division_id' })
  division: Division;

  @Index()
  @Column({ name: 'codigo_empleado', unique: true, length: 20 })
  codigoEmpleado: string;

  @Index()
  @Column({ length: 15, nullable: true })
  dni: string;

  @Column({ length: 100 })
  nombres: string;

  @Column({ length: 100 })
  apellidos: string;

  @Index()
  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 150, nullable: true })
  cargo: string;

  @Column({ name: 'fecha_ingreso', type: 'date', nullable: true })
  fechaIngreso: Date;

  @Index()
  @Column({
    type: 'varchar',
    length: 30,
    default: Modalidad.NOMBRADO,
  })
  modalidad: Modalidad;

  @Column({
    name: 'horas_semanales',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 40,
  })
  horasSemanales: number;

  // Campo calculado: disponible para asignaciones
  @Index()
  @Column({ default: true })
  disponible: boolean;

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

  // Relaciones inversas
  @OneToMany('PersonalHabilidad', 'personal')
  habilidades: any[];

  @OneToMany('Asignacion', 'personal')
  asignaciones: any[];
}
