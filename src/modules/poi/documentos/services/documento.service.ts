import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from '../entities/documento.entity';
import { CreateDocumentoDto } from '../dto/create-documento.dto';
import { UpdateDocumentoDto } from '../dto/update-documento.dto';
import { AprobarDocumentoDto } from '../dto/aprobar-documento.dto';
import { DocumentoFase, DocumentoEstado, TipoContenedor } from '../enums/documento.enum';
import { ArchivoService } from '../../../storage/services/archivo.service';

@Injectable()
export class DocumentoService {
  private readonly logger = new Logger(DocumentoService.name);

  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
    private readonly archivoService: ArchivoService,
  ) {}

  async create(createDto: CreateDocumentoDto, userId?: number): Promise<Documento> {
    // Validar relación polimórfica
    if (createDto.tipoContenedor === TipoContenedor.PROYECTO && !createDto.proyectoId) {
      throw new BadRequestException('proyectoId es requerido para tipo PROYECTO');
    }
    if (createDto.tipoContenedor === TipoContenedor.SUBPROYECTO && !createDto.subproyectoId) {
      throw new BadRequestException('subproyectoId es requerido para tipo SUBPROYECTO');
    }

    // Si se proporciona archivoId, obtener información del archivo
    let archivoData: { archivoNombre?: string; archivoTamano?: number; tipoArchivo?: string } = {};
    if (createDto.archivoId) {
      try {
        const archivo = await this.archivoService.findById(createDto.archivoId);
        archivoData = {
          archivoNombre: archivo.nombreOriginal,
          archivoTamano: archivo.tamanoBytes,
          tipoArchivo: archivo.mimeType,
        };
      } catch (error) {
        this.logger.warn(`No se pudo obtener información del archivo ${createDto.archivoId}: ${error.message}`);
      }
    }

    const documento = this.documentoRepository.create({
      ...createDto,
      ...archivoData,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.documentoRepository.save(documento);
  }

  async findAll(filters?: {
    proyectoId?: number;
    subproyectoId?: number;
    fase?: DocumentoFase;
    estado?: DocumentoEstado;
    activo?: boolean;
  }): Promise<Documento[]> {
    const queryBuilder = this.documentoRepository
      .createQueryBuilder('documento')
      .orderBy('documento.fase', 'ASC')
      .addOrderBy('documento.nombre', 'ASC');

    if (filters?.proyectoId) {
      queryBuilder.andWhere('documento.proyectoId = :proyectoId', { proyectoId: filters.proyectoId });
    }

    if (filters?.subproyectoId) {
      queryBuilder.andWhere('documento.subproyectoId = :subproyectoId', { subproyectoId: filters.subproyectoId });
    }

    if (filters?.fase) {
      queryBuilder.andWhere('documento.fase = :fase', { fase: filters.fase });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('documento.estado = :estado', { estado: filters.estado });
    }

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('documento.activo = :activo', { activo: filters.activo });
    }

    return queryBuilder.getMany();
  }

  async findByProyecto(proyectoId: number): Promise<any[]> {
    const documentos = await this.documentoRepository.find({
      where: { proyectoId, activo: true },
      relations: ['creador', 'aprobador'],
      order: { fase: 'ASC', nombre: 'ASC' },
    });

    // Generar URLs presignadas para documentos con archivos
    const transformedDocs = await Promise.all(
      documentos.map((doc) => this.transformDocumentoWithUrl(doc)),
    );

    return transformedDocs;
  }

  async findBySubproyecto(subproyectoId: number): Promise<any[]> {
    const documentos = await this.documentoRepository.find({
      where: { subproyectoId, activo: true },
      relations: ['creador', 'aprobador'],
      order: { fase: 'ASC', nombre: 'ASC' },
    });

    // Generar URLs presignadas para documentos con archivos
    const transformedDocs = await Promise.all(
      documentos.map((doc) => this.transformDocumentoWithUrl(doc)),
    );

    return transformedDocs;
  }

  async findOne(id: number): Promise<Documento> {
    const documento = await this.documentoRepository.findOne({
      where: { id },
      relations: ['proyecto', 'subproyecto', 'aprobador'],
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return documento;
  }

  async update(id: number, updateDto: UpdateDocumentoDto, userId?: number): Promise<Documento> {
    const documento = await this.findOne(id);
    Object.assign(documento, updateDto, { updatedBy: userId });
    return this.documentoRepository.save(documento);
  }

  async aprobar(id: number, aprobarDto: AprobarDocumentoDto, userId: number): Promise<Documento> {
    const documento = await this.findOne(id);

    documento.estado = aprobarDto.estado;
    documento.observacionAprobacion = aprobarDto.observacion ?? null;
    documento.aprobadoPor = userId;
    documento.fechaAprobacion = new Date();
    documento.updatedBy = userId;

    return this.documentoRepository.save(documento);
  }

  async remove(id: number, userId?: number): Promise<Documento> {
    const documento = await this.findOne(id);
    documento.activo = false;
    documento.updatedBy = userId;
    return this.documentoRepository.save(documento);
  }

  /**
   * Transforma un documento para incluir nombreCompleto en creador y aprobador
   */
  private transformDocumento(doc: Documento): any {
    return {
      ...doc,
      creador: doc.creador
        ? {
            id: doc.creador.id,
            nombreCompleto: `${doc.creador.nombre} ${doc.creador.apellido}`.trim(),
            nombres: doc.creador.nombre,
            apellidoPaterno: doc.creador.apellido,
          }
        : undefined,
      aprobador: doc.aprobador
        ? {
            id: doc.aprobador.id,
            nombreCompleto: `${doc.aprobador.nombre} ${doc.aprobador.apellido}`.trim(),
            nombres: doc.aprobador.nombre,
            apellidoPaterno: doc.aprobador.apellido,
          }
        : undefined,
    };
  }

  /**
   * Transforma un documento incluyendo URL presignada para archivos
   */
  private async transformDocumentoWithUrl(doc: Documento): Promise<any> {
    const transformed = this.transformDocumento(doc);

    // Si tiene archivoId, generar URL presignada
    if (doc.archivoId) {
      try {
        const archivoUrl = await this.archivoService.getDownloadUrl(doc.archivoId);
        transformed.archivoUrl = archivoUrl;
      } catch (error) {
        this.logger.warn(`No se pudo obtener URL para archivo ${doc.archivoId}: ${error.message}`);
        // Mantener archivoUrl como null si no se puede generar
        transformed.archivoUrl = null;
      }
    }

    return transformed;
  }

  /**
   * Obtener URL de descarga para un documento específico
   */
  async getDownloadUrl(id: number): Promise<{ downloadUrl: string }> {
    const documento = await this.findOne(id);

    if (!documento.archivoId) {
      throw new BadRequestException('Este documento no tiene un archivo adjunto');
    }

    const downloadUrl = await this.archivoService.getDownloadUrl(documento.archivoId);
    return { downloadUrl };
  }
}
