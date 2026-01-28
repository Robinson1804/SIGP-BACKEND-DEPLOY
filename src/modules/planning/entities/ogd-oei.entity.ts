import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Ogd } from '../ogd/entities/ogd.entity';
import { Oei } from '../oei/entities/oei.entity';

/**
 * Tabla intermedia para relación Many-to-Many entre OGD y OEI
 * Un OGD puede estar relacionado con múltiples OEIs y viceversa
 */
@Entity('ogd_oei', { schema: 'planning' })
@Unique(['ogdId', 'oeiId'])
export class OgdOei {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'ogd_id' })
  ogdId: number;

  @Index()
  @Column({ name: 'oei_id' })
  oeiId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Ogd, (ogd) => ogd.ogdOeis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ogd_id' })
  ogd: Ogd;

  @ManyToOne(() => Oei, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oei_id' })
  oei: Oei;
}
