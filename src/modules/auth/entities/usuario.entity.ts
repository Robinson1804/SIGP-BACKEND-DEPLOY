import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/constants/roles.constant';

@Entity('usuarios', { schema: 'public' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true, length: 255 })
  email: string;

  @Index()
  @Column({ unique: true, length: 100 })
  @ApiProperty({
    example: 'jperez',
    description: 'Nombre de usuario unico (3-100 caracteres alfanumericos y guiones)',
  })
  username: string;

  @Exclude()
  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    enum: Role,
  })
  rol: Role;

  // Roles adicionales para usuarios con múltiples roles
  @Column({
    name: 'roles_adicionales',
    type: 'jsonb',
    default: '[]',
  })
  rolesAdicionales: Role[];

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Index()
  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'ultimo_acceso', type: 'timestamp with time zone', nullable: true })
  ultimoAcceso: Date;

  @Column({ name: 'intentos_fallidos', default: 0 })
  intentosFallidos: number;

  @Column({ name: 'bloqueado_hasta', type: 'timestamp with time zone', nullable: true })
  bloqueadoHasta: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
