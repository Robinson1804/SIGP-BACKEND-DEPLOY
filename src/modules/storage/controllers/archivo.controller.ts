/**
 * SIGP - Archivo Controller
 * Endpoints para gestión de archivos
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Usuario } from '../../auth/entities/usuario.entity';

import { ArchivoService } from '../services/archivo.service';
import { ArchivoValidationService } from '../services/archivo-validation.service';
import { MinioService } from '../services/minio.service';

import {
  FilterArchivosDto,
  ArchivoResponseDto,
  ArchivoListResponseDto,
  UpdateArchivoMetadataDto,
  StorageStatsDto,
} from '../dto/archivo.dto';
import { ArchivoEntidadTipo, ArchivoCategoria } from '../entities/archivo.entity';

@ApiTags('Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('archivos')
export class ArchivoController {
  constructor(
    private readonly archivoService: ArchivoService,
    private readonly validationService: ArchivoValidationService,
    private readonly minioService: MinioService,
  ) {}

  // =========================================================================
  // CONSULTAS
  // =========================================================================

  @Get()
  @ApiOperation({ summary: 'Listar archivos con filtros' })
  @ApiResponse({ status: 200, type: ArchivoListResponseDto })
  async findAll(@Query() filters: FilterArchivosDto): Promise<ArchivoListResponseDto> {
    return this.archivoService.findAll(filters);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Obtener estadísticas de almacenamiento' })
  @ApiResponse({ status: 200, type: StorageStatsDto })
  async getStats(): Promise<StorageStatsDto> {
    return this.archivoService.getStorageStats();
  }

  @Get('formatos')
  @ApiOperation({ summary: 'Obtener formatos de archivo permitidos' })
  @ApiResponse({ status: 200 })
  async getFormatos(): Promise<Record<ArchivoCategoria, any>> {
    return this.validationService.getAllFormatos();
  }

  @Get('entidad/:tipo/:id')
  @ApiOperation({ summary: 'Obtener archivos de una entidad específica' })
  @ApiParam({ name: 'tipo', enum: ArchivoEntidadTipo })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'categoria', enum: ArchivoCategoria, required: false })
  @ApiResponse({ status: 200, type: [ArchivoResponseDto] })
  async findByEntidad(
    @Param('tipo') tipo: ArchivoEntidadTipo,
    @Param('id') id: number,
    @Query('categoria') categoria?: ArchivoCategoria,
  ): Promise<ArchivoResponseDto[]> {
    return this.archivoService.findByEntidad(tipo, id, categoria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener archivo por ID' })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200, type: ArchivoResponseDto })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArchivoResponseDto> {
    return this.archivoService.findById(id);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Obtener URL de descarga presignada' })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ downloadUrl: string; expiresIn: number }> {
    const downloadUrl = await this.archivoService.getDownloadUrl(id);
    return {
      downloadUrl,
      expiresIn: 3600, // 1 hora
    };
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Descargar archivo directamente',
    description: 'Descarga el archivo a través del backend (proxy). Útil cuando presigned URLs no son accesibles.',
  })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200, description: 'Archivo descargado' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: any,
  ): Promise<void> {
    // Obtener entidad completa del archivo (incluye objectKey y bucket)
    const archivo = await this.archivoService.findEntityById(id);

    // Obtener el archivo como buffer desde MinIO
    const buffer = await this.minioService.getObjectAsBuffer(archivo.bucket, archivo.objectKey);

    // Configurar headers de respuesta
    res.set({
      'Content-Type': archivo.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(archivo.nombreOriginal)}"`,
      'Content-Length': buffer.length,
    });

    // Enviar el archivo
    res.end(buffer);
  }

  @Get(':id/versiones')
  @ApiOperation({ summary: 'Obtener todas las versiones de un archivo' })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200, type: [ArchivoResponseDto] })
  async getVersiones(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArchivoResponseDto[]> {
    return this.archivoService.getVersiones(id);
  }

  // =========================================================================
  // MODIFICACIONES
  // =========================================================================

  @Patch(':id/metadata')
  @ApiOperation({ summary: 'Actualizar metadata de archivo' })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200, type: ArchivoResponseDto })
  async updateMetadata(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArchivoMetadataDto,
    @CurrentUser() user: Usuario,
  ): Promise<ArchivoResponseDto> {
    return this.archivoService.updateMetadata(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar archivo (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 204, description: 'Archivo eliminado' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: Usuario,
  ): Promise<void> {
    await this.archivoService.delete(id, user.id);
  }
}
