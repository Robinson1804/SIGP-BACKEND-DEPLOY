/**
 * SIGP - ArchivoColaProcesamiento Entity
 * Cola para procesamiento asíncrono de archivos (escaneo virus, thumbnails, etc)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { Archivo } from './archivo.entity';

export enum TipoProcesamiento {
  ESCANEO_VIRUS = 'escaneo_virus',
  GENERAR_THUMBNAIL = 'generar_thumbnail',
  EXTRAER_METADATA = 'extraer_metadata',
  COMPRIMIR = 'comprimir',
  CONVERTIR_PDF = 'convertir_pdf',
}

export enum EstadoCola {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  COMPLETADO = 'completado',
  ERROR = 'error',
}

@Entity('archivos_cola_procesamiento', { schema: 'public' })
@Index('idx_cola_pendientes', ['estado', 'createdAt'])
@Check('chk_estado_cola', `"estado" IN ('pendiente', 'procesando', 'completado', 'error')`)
export class ArchivoColaProcesamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'archivo_id', type: 'uuid' })
  archivoId: string;

  @ManyToOne(() => Archivo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'archivo_id' })
  archivo: Archivo;

  @Column({
    name: 'tipo_procesamiento',
    type: 'enum',
    enum: TipoProcesamiento,
  })
  tipoProcesamiento: TipoProcesamiento;

  @Column({
    type: 'enum',
    enum: EstadoCola,
    default: EstadoCola.PENDIENTE,
  })
  estado: EstadoCola;

  @Column({ default: 0 })
  intentos: number;

  @Column({ name: 'max_intentos', default: 3 })
  maxIntentos: number;

  @Column({ type: 'jsonb', nullable: true })
  resultado: Record<string, any>;

  @Column({ name: 'error_mensaje', type: 'text', nullable: true })
  errorMensaje: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'procesado_at', type: 'timestamptz', nullable: true })
  procesadoAt: Date;

  // Computed
  get puedeReintentar(): boolean {
    return this.intentos < this.maxIntentos && this.estado === EstadoCola.ERROR;
  }
}
