/**
 * SIGP - Upload Controller
 * Endpoints para subida de archivos
 */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Usuario } from '../../auth/entities/usuario.entity';

import { ArchivoService } from '../services/archivo.service';
import { MinioService } from '../services/minio.service';

import {
  RequestUploadUrlDto,
  UploadUrlResponseDto,
  ConfirmUploadDto,
} from '../dto/upload-request.dto';
import { ArchivoResponseDto } from '../dto/archivo.dto';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly archivoService: ArchivoService,
    private readonly minioService: MinioService,
  ) {}

  // =========================================================================
  // FLUJO PRESIGNADO (Recomendado para archivos grandes)
  // =========================================================================

  @Post('request-url')
  @ApiOperation({
    summary: 'Solicitar URL presignada para subida',
    description: `
      Genera una URL presignada para subir archivos directamente a MinIO.

      Flujo:
      1. Cliente llama a este endpoint con metadata del archivo
      2. Backend genera URL presignada y crea registro en BD (estado: pendiente)
      3. Cliente sube archivo directamente a MinIO usando la URL
      4. Cliente llama a POST /upload/confirm para confirmar
    `,
  })
  @ApiResponse({ status: 201, type: UploadUrlResponseDto })
  @ApiResponse({ status: 400, description: 'Formato o tamaño no permitido' })
  async requestUploadUrl(
    @Body() dto: RequestUploadUrlDto,
    @CurrentUser() user: Usuario,
  ): Promise<UploadUrlResponseDto> {
    return this.archivoService.requestUploadUrl(dto, user.id);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar subida completada',
    description: `
      Confirma que el archivo fue subido exitosamente a MinIO.
      Cambia el estado del archivo de "pendiente" a "disponible".
    `,
  })
  @ApiResponse({ status: 200, type: ArchivoResponseDto })
  @ApiResponse({ status: 400, description: 'Archivo no encontrado en almacenamiento' })
  @ApiResponse({ status: 404, description: 'Registro de archivo no encontrado' })
  async confirmUpload(
    @Body() dto: ConfirmUploadDto,
    @CurrentUser() user: Usuario,
  ): Promise<ArchivoResponseDto> {
    return this.archivoService.confirmUpload(dto, user.id);
  }

  // =========================================================================
  // SUBIDA DIRECTA (Para archivos pequeños o versiones)
  // =========================================================================

  @Post('direct')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subida directa de archivo',
    description: `
      Sube un archivo directamente al servidor (multipart).
      Recomendado solo para archivos pequeños (< 10MB).
      Para archivos grandes, usar el flujo presignado.
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entidadTipo: {
          type: 'string',
          enum: [
            'PROYECTO',
            'SUBPROYECTO',
            'ACTIVIDAD',
            'TAREA',
            'SUBTAREA',
            'USUARIO',
          ],
        },
        entidadId: {
          type: 'number',
        },
        categoria: {
          type: 'string',
          enum: ['documento', 'evidencia', 'acta', 'informe', 'avatar', 'adjunto'],
        },
        metadata: {
          type: 'object',
        },
      },
      required: ['file', 'entidadTipo', 'entidadId', 'categoria'],
    },
  })
  @ApiResponse({ status: 201, type: ArchivoResponseDto })
  @ApiResponse({ status: 400, description: 'Formato o tamaño no permitido' })
  async uploadDirect(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max para directa
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
    @CurrentUser() user: Usuario,
  ): Promise<ArchivoResponseDto> {
    // Primero solicitar URL (crea registro en BD)
    const uploadInfo = await this.archivoService.requestUploadUrl(
      {
        entidadTipo: body.entidadTipo,
        entidadId: parseInt(body.entidadId, 10),
        categoria: body.categoria,
        nombreArchivo: file.originalname,
        mimeType: file.mimetype,
        tamano: file.size,
        metadata: body.metadata ? JSON.parse(body.metadata) : undefined,
      },
      user.id,
    );

    // Subir archivo a MinIO usando el buffer
    await this.minioService.putObject(
      uploadInfo.bucket,
      uploadInfo.objectKey,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    // Confirmar subida (actualiza estado a disponible)
    return this.archivoService.confirmUpload(
      { archivoId: uploadInfo.archivoId },
      user.id,
    );
  }

  // =========================================================================
  // VERSIONADO
  // =========================================================================

  @Post(':id/version')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Crear nueva versión de un archivo',
    description: `
      Crea una nueva versión de un archivo existente.
      La versión anterior se mantiene pero se marca como no actual.
    `,
  })
  @ApiParam({ name: 'id', description: 'UUID del archivo original' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        comentario: {
          type: 'string',
          description: 'Comentario opcional sobre la nueva versión',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: ArchivoResponseDto })
  async createVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB max
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: Usuario,
  ): Promise<ArchivoResponseDto> {
    return this.archivoService.createVersion(id, file, user.id);
  }
}
