/**
 * SIGP - Archivo Validation Service
 * Servicio para validación de formatos y tamaños de archivos
 */

import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArchivoFormatoPermitido } from '../entities/archivo-formato-permitido.entity';
import { ArchivoCategoria } from '../entities/archivo.entity';

interface FormatoConfig {
  extensions: string[];
  mimeTypes: string[];
  maxSize: number;
}

@Injectable()
export class ArchivoValidationService implements OnModuleInit {
  // Cache de formatos permitidos
  private formatosCache: Map<ArchivoCategoria, FormatoConfig> = new Map();

  // Configuración por defecto (fallback)
  private readonly defaultFormatos: Record<ArchivoCategoria, FormatoConfig> = {
    [ArchivoCategoria.DOCUMENTO]: {
      extensions: ['pdf', 'docx', 'xlsx', 'pptx', 'png', 'jpg', 'jpeg'],
      mimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/png',
        'image/jpeg',
      ],
      maxSize: 50 * 1024 * 1024, // 50MB
    },
    [ArchivoCategoria.EVIDENCIA]: {
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip', 'docx', 'doc'],
      mimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ],
      maxSize: 25 * 1024 * 1024, // 25MB
    },
    [ArchivoCategoria.ACTA]: {
      extensions: ['pdf', 'docx'],
      mimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      maxSize: 50 * 1024 * 1024, // 50MB
    },
    [ArchivoCategoria.INFORME]: {
      extensions: ['pdf', 'xlsx'],
      mimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      maxSize: 50 * 1024 * 1024, // 50MB
    },
    [ArchivoCategoria.CRONOGRAMA]: {
      extensions: ['xlsx', 'pdf', 'mpp'],
      mimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        'application/vnd.ms-project',
      ],
      maxSize: 25 * 1024 * 1024, // 25MB
    },
    [ArchivoCategoria.AVATAR]: {
      extensions: ['jpg', 'jpeg', 'png', 'webp'],
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 2 * 1024 * 1024, // 2MB
    },
    [ArchivoCategoria.ADJUNTO]: {
      extensions: ['pdf', 'docx', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'],
      mimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'application/zip',
      ],
      maxSize: 25 * 1024 * 1024, // 25MB
    },
    [ArchivoCategoria.BACKUP]: {
      extensions: ['sql', 'zip', 'tar', 'gz'],
      mimeTypes: [
        'application/sql',
        'application/zip',
        'application/x-tar',
        'application/gzip',
      ],
      maxSize: 500 * 1024 * 1024, // 500MB
    },
  };

  constructor(
    @InjectRepository(ArchivoFormatoPermitido)
    private formatoRepository: Repository<ArchivoFormatoPermitido>,
  ) {}

  /**
   * Cargar formatos desde BD al iniciar
   */
  async onModuleInit(): Promise<void> {
    await this.loadFormatosFromDB();
  }

  /**
   * Cargar formatos permitidos desde la base de datos
   */
  async loadFormatosFromDB(): Promise<void> {
    try {
      const formatos = await this.formatoRepository.find({
        where: { activo: true },
      });

      // Agrupar por categoría
      for (const categoria of Object.values(ArchivoCategoria)) {
        const formatosCategoria = formatos.filter((f) => f.categoria === categoria);

        if (formatosCategoria.length > 0) {
          this.formatosCache.set(categoria, {
            extensions: formatosCategoria.map((f) => f.extension.toLowerCase()),
            mimeTypes: formatosCategoria.map((f) => f.mimeType),
            maxSize: Math.max(...formatosCategoria.map((f) => Number(f.tamanoMaximoBytes))),
          });
        }
      }
    } catch (error) {
      // Si falla, usar configuración por defecto
      console.warn('No se pudieron cargar formatos desde BD, usando defaults');
    }
  }

  /**
   * Validar formato de archivo
   */
  async validateFormat(
    extension: string,
    categoria: ArchivoCategoria,
    tamano: number,
  ): Promise<void> {
    const config = this.getFormatoConfig(categoria);

    // Validar extensión
    if (!config.extensions.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        `Formato no permitido para ${categoria}. ` +
          `Extensiones permitidas: ${config.extensions.join(', ')}`,
      );
    }

    // Validar tamaño
    if (tamano > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(0);
      const actualSizeMB = (tamano / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(
        `Archivo muy grande (${actualSizeMB} MB). ` +
          `Tamaño máximo para ${categoria}: ${maxSizeMB} MB`,
      );
    }
  }

  /**
   * Validar MIME type
   */
  async validateMimeType(
    mimeType: string,
    categoria: ArchivoCategoria,
  ): Promise<void> {
    const config = this.getFormatoConfig(categoria);

    if (!config.mimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${mimeType}. ` +
          `Tipos permitidos para ${categoria}: ${config.mimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Obtener extensiones permitidas para una categoría
   */
  getAllowedExtensions(categoria: ArchivoCategoria): string[] {
    return this.getFormatoConfig(categoria).extensions;
  }

  /**
   * Obtener tamaño máximo para una categoría
   */
  getMaxSize(categoria: ArchivoCategoria): number {
    return this.getFormatoConfig(categoria).maxSize;
  }

  /**
   * Verificar si una extensión es imagen
   */
  isImage(extension: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    return imageExtensions.includes(extension.toLowerCase());
  }

  /**
   * Verificar si un MIME type es imagen
   */
  isImageMimeType(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Obtener configuración de formato (cache o default)
   */
  private getFormatoConfig(categoria: ArchivoCategoria): FormatoConfig {
    return this.formatosCache.get(categoria) || this.defaultFormatos[categoria];
  }

  /**
   * Refrescar cache de formatos (para llamar después de actualizar BD)
   */
  async refreshCache(): Promise<void> {
    this.formatosCache.clear();
    await this.loadFormatosFromDB();
  }

  /**
   * Obtener todos los formatos permitidos (para mostrar en UI)
   */
  async getAllFormatos(): Promise<Record<ArchivoCategoria, FormatoConfig>> {
    const result: Record<string, FormatoConfig> = {};

    for (const categoria of Object.values(ArchivoCategoria)) {
      result[categoria] = this.getFormatoConfig(categoria);
    }

    return result as Record<ArchivoCategoria, FormatoConfig>;
  }
}
