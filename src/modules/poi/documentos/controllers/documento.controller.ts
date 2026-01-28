import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DocumentoService } from '../services/documento.service';
import { CreateDocumentoDto } from '../dto/create-documento.dto';
import { UpdateDocumentoDto } from '../dto/update-documento.dto';
import { AprobarDocumentoDto } from '../dto/aprobar-documento.dto';
import { DocumentoFase, DocumentoEstado } from '../enums/documento.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateDocumentoDto, @CurrentUser('id') userId: number) {
    return this.documentoService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('subproyectoId') subproyectoId?: string,
    @Query('fase') fase?: DocumentoFase,
    @Query('estado') estado?: DocumentoEstado,
    @Query('activo') activo?: string,
  ) {
    return this.documentoService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      subproyectoId: subproyectoId ? parseInt(subproyectoId, 10) : undefined,
      fase,
      estado,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.findOne(id);
  }

  @Get(':id/download')
  getDownloadUrl(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.getDownloadUrl(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocumentoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.documentoService.update(id, updateDto, userId);
  }

  @Post(':id/aprobar')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarDto: AprobarDocumentoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.documentoService.aprobar(id, aprobarDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.documentoService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoDocumentosController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.documentoService.findByProyecto(proyectoId);
  }
}

@Controller('subproyectos/:subproyectoId/documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubproyectoDocumentosController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Get()
  findBySubproyecto(@Param('subproyectoId', ParseIntPipe) subproyectoId: number) {
    return this.documentoService.findBySubproyecto(subproyectoId);
  }
}
