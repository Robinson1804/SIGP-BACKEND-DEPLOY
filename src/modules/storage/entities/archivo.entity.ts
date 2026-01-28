/**
 * SIGP - Archivo Entity
 * Entidad principal para gestión de archivos
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';

// Enums
export enum ArchivoEntidadTipo {
  PROYECTO = 'PROYECTO',
  SUBPROYECTO = 'SUBPROYECTO',
  ACTIVIDAD = 'ACTIVIDAD',
  ACTA_CONSTITUCION = 'ACTA_CONSTITUCION',
  ACTA_REUNION = 'ACTA_REUNION',
  DOCUMENTO = 'DOCUMENTO',
  REQUERIMIENTO = 'REQUERIMIENTO',
  CRONOGRAMA = 'CRONOGRAMA',
  INFORME_SPRINT = 'INFORME_SPRINT',
  INFORME_ACTIVIDAD = 'INFORME_ACTIVIDAD',
  HISTORIA_USUARIO = 'HISTORIA_USUARIO',
  TAREA = 'TAREA',
  SUBTAREA = 'SUBTAREA',
  DAILY_MEETING = 'DAILY_MEETING',
  USUARIO = 'USUARIO',
}

export enum ArchivoCategoria {
  DOCUMENTO = 'documento',
  EVIDENCIA = 'evidencia',
  ACTA = 'acta',
  INFORME = 'informe',
  CRONOGRAMA = 'cronograma',
  AVATAR = 'avatar',
  ADJUNTO = 'adjunto',
  BACKUP = 'backup',
}

export enum ArchivoEstado {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  DISPONIBLE = 'disponible',
  ERROR = 'error',
  ELIMINADO = 'eliminado',
}

@Entity('archivos', { schema: 'public' })
@Index('idx_archivos_entidad', ['entidadTipo', 'entidadId'])
@Index('idx_archivos_bucket_key', ['bucket', 'objectKey'])
@Index('idx_archivos_categoria', ['categoria'])
@Index('idx_archivos_estado', ['estado'])
@Index('idx_archivos_created_by', ['createdBy'])
@Check('chk_tamano_positivo', '"tamano_bytes" > 0')
@Check('chk_tamano_maximo', '"tamano_bytes" <= 52428800')
@Check('chk_version_positiva', '"version" > 0')
export class Archivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // =========================================================================
  // RELACIÓN POLIMÓRFICA
  // =========================================================================

  @Column({
    type: 'enum',
    enum: ArchivoEntidadTipo,
    name: 'entidad_tipo',
  })
  entidadTipo: ArchivoEntidadTipo;

  @Column({ name: 'entidad_id' })
  entidadId: number;

  // =========================================================================
  // METADATA DEL ARCHIVO
  // =========================================================================

  @Column({ name: 'nombre_original', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'nombre_almacenado', length: 255 })
  nombreAlmacenado: string;

  @Column({ length: 20 })
  extension: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ name: 'tamano_bytes', type: 'bigint' })
  tamanoBytes: number;

  // =========================================================================
  // UBICACIÓN EN MINIO
  // =========================================================================

  @Column({ length: 100 })
  bucket: string;

  @Column({ name: 'object_key', length: 500, unique: true })
  objectKey: string;

  @Column({ length: 50, default: 'us-east-1' })
  region: string;

  // =========================================================================
  // CATEGORIZACIÓN Y ESTADO
  // =========================================================================

  @Column({
    type: 'enum',
    enum: ArchivoCategoria,
  })
  categoria: ArchivoCategoria;

  @Column({
    type: 'enum',
    enum: ArchivoEstado,
    default: ArchivoEstado.PENDIENTE,
  })
  estado: ArchivoEstado;

  @Column({ name: 'es_publico', default: false })
  esPublico: boolean;

  @Column({ name: 'es_obligatorio', default: false })
  esObligatorio: boolean;

  // =========================================================================
  // VERSIONADO
  // =========================================================================

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'archivo_padre_id', type: 'uuid', nullable: true })
  archivoPadreId: string;

  @ManyToOne(() => Archivo, { nullable: true })
  @JoinColumn({ name: 'archivo_padre_id' })
  archivoPadre: Archivo;

  @Column({ name: 'es_version_actual', default: true })
  esVersionActual: boolean;

  // =========================================================================
  // SEGURIDAD Y VALIDACIÓN
  // =========================================================================

  @Column({ name: 'checksum_md5', length: 32, nullable: true })
  checksumMd5: string;

  @Column({ name: 'checksum_sha256', length: 64, nullable: true })
  checksumSha256: string;

  @Column({ name: 'escaneado_virus', default: false })
  escaneadoVirus: boolean;

  @Column({ name: 'virus_detectado', default: false })
  virusDetectado: boolean;

  @Column({ name: 'fecha_escaneo', type: 'timestamptz', nullable: true })
  fechaEscaneo: Date;

  @Column({ name: 'resultado_escaneo', type: 'text', nullable: true })
  resultadoEscaneo: string;

  // =========================================================================
  // URLs PRESIGNADAS (CACHE)
  // =========================================================================

  @Column({ name: 'url_descarga_cache', type: 'varchar', length: 2000, nullable: true })
  urlDescargaCache: string | null;

  @Column({ name: 'url_descarga_expira', type: 'timestamptz', nullable: true })
  urlDescargaExpira: Date | null;

  // =========================================================================
  // METADATA ADICIONAL
  // =========================================================================

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  // =========================================================================
  // AUDITORÍA
  // =========================================================================

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creador: Usuario;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  actualizador: Usuario;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  eliminador: Usuario;

  // =========================================================================
  // COMPUTED PROPERTIES
  // =========================================================================

  get tamanoLegible(): string {
    const bytes = Number(this.tamanoBytes);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  get estaDisponible(): boolean {
    return this.estado === ArchivoEstado.DISPONIBLE && !this.deletedAt;
  }

  get urlExpirada(): boolean {
    if (!this.urlDescargaExpira) return true;
    return new Date() > this.urlDescargaExpira;
  }
}
