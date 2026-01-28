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
import { EpicaPrioridad } from '../enums/epica.enum';
import { Proyecto } from '../../../poi/proyectos/entities/proyecto.entity';
import { HistoriaUsuario } from '../../historias-usuario/entities/historia-usuario.entity';

@Entity({ schema: 'agile', name: 'epicas' })
export class Epica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proyecto_id' })
  proyectoId: number;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 7, default: '#6366F1' })
  color: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  prioridad: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Por hacer',
  })
  estado: string;

  @Column({ type: 'int', nullable: true })
  orden: number;

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

  @OneToMany(() => HistoriaUsuario, (hu) => hu.epica)
  historiasUsuario: HistoriaUsuario[];
}
