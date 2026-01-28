/**
 * SIGP - ArchivoFormatoPermitido Entity
 * Catálogo de formatos de archivo permitidos por categoría
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';
import { ArchivoCategoria } from './archivo.entity';

@Entity('archivos_formatos_permitidos', { schema: 'public' })
@Unique('uq_extension_categoria', ['extension', 'categoria'])
export class ArchivoFormatoPermitido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  extension: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: ArchivoCategoria,
  })
  categoria: ArchivoCategoria;

  @Column({ name: 'tamano_maximo_bytes', type: 'bigint' })
  tamanoMaximoBytes: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ length: 200, nullable: true })
  descripcion: string;

  // Computed property
  get tamanoMaximoLegible(): string {
    const bytes = Number(this.tamanoMaximoBytes);
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }
}
