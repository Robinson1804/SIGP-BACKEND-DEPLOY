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
import { Oegd } from '../oegd/entities/oegd.entity';
import { Aei } from '../aei/entities/aei.entity';

/**
 * Tabla intermedia para relación Many-to-Many entre OEGD y AEI
 * Un OEGD puede estar relacionado con múltiples AEIs y viceversa
 */
@Entity('oegd_aei', { schema: 'planning' })
@Unique(['oegdId', 'aeiId'])
export class OegdAei {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'oegd_id' })
  oegdId: number;

  @Index()
  @Column({ name: 'aei_id' })
  aeiId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Oegd, (oegd) => oegd.oegdAeis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oegd_id' })
  oegd: Oegd;

  @ManyToOne(() => Aei, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aei_id' })
  aei: Aei;
}
