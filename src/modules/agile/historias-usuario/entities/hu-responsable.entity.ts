import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { HistoriaUsuario } from './historia-usuario.entity';
import { Personal } from '../../../rrhh/personal/entities/personal.entity';

@Entity({ schema: 'agile', name: 'hu_responsables' })
@Unique(['historiaUsuarioId', 'personalId'])
export class HuResponsable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'historia_usuario_id' })
  historiaUsuarioId: number;

  @Column({ name: 'personal_id' })
  personalId: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  // Relations
  // Nota: Se removió la referencia bidireccional porque asignadoA ahora es un campo array
  @ManyToOne(() => HistoriaUsuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_usuario_id' })
  historiaUsuario: HistoriaUsuario;

  @ManyToOne(() => Personal, { eager: true })
  @JoinColumn({ name: 'personal_id' })
  personal: Personal;
}
