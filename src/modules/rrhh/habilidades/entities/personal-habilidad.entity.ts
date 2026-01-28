import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { NivelHabilidad } from '../enums/nivel-habilidad.enum';
import { Habilidad } from './habilidad.entity';

@Entity({ schema: 'rrhh', name: 'personal_habilidades' })
@Unique(['personalId', 'habilidadId'])
export class PersonalHabilidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'personal_id' })
  personalId: number;

  @ManyToOne('Personal', 'habilidades', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personal_id' })
  personal: any;

  @Index()
  @Column({ name: 'habilidad_id' })
  habilidadId: number;

  @ManyToOne(() => Habilidad, (habilidad) => habilidad.personalHabilidades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'habilidad_id' })
  habilidad: Habilidad;

  @Column({
    type: 'varchar',
    length: 30,
    default: NivelHabilidad.BASICO,
  })
  nivel: NivelHabilidad;

  @Column({
    name: 'anios_experiencia',
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
  })
  aniosExperiencia: number;

  @Column({ default: false })
  certificado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
