import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DocumentoFase, DocumentoEstado, TipoContenedor } from '../enums/documento.enum';

@Entity('documentos', { schema: 'poi' })
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación polimórfica
  @Column({ name: 'tipo_contenedor', type: 'varchar', length: 20, enum: TipoContenedor })
  tipoContenedor: TipoContenedor;

  @Index()
  @Column({ name: 'proyecto_id', nullable: true })
  proyectoId: number;

  @ManyToOne('Proyecto', 'documentos', { nullable: true })
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: any;

  @Index()
  @Column({ name: 'subproyecto_id', nullable: true })
  subproyectoId: number;

  @ManyToOne('Subproyecto', 'documentos', { nullable: true })
  @JoinColumn({ name: 'subproyecto_id' })
  subproyecto: any;

  // Contenido
  @Index()
  @Column({ type: 'varchar', length: 50, enum: DocumentoFase })
  fase: DocumentoFase;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 500, nullable: true })
  link: string;

  // Referencia al archivo en StorageModule (tabla archivos)
  @Column({ name: 'archivo_id', type: 'uuid', nullable: true })
  archivoId: string;

  @Column({ name: 'archivo_url', length: 500, nullable: true })
  archivoUrl: string;

  @Column({ name: 'archivo_nombre', length: 255, nullable: true })
  archivoNombre: string;

  @Column({ name: 'archivo_tamano', nullable: true })
  archivoTamano: number;

  // Tipo MIME del archivo para detectar imagen/pdf
  @Column({ name: 'tipo_archivo', length: 100, nullable: true })
  tipoArchivo: string;

  // Estado
  @Column({ name: 'es_obligatorio', default: false })
  esObligatorio: boolean;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    default: DocumentoEstado.PENDIENTE,
    enum: DocumentoEstado,
  })
  estado: DocumentoEstado;

  // Aprobación
  @Column({ name: 'aprobado_por', nullable: true })
  aprobadoPor: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'aprobado_por' })
  aprobador: any;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp with time zone', nullable: true })
  fechaAprobacion: Date;

  @Column({ name: 'observacion_aprobacion', type: 'text', nullable: true })
  observacionAprobacion: string | null;

  // Auditoría
  @Index()
  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null | undefined;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creador: any;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
