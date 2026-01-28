import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { ActaService } from '../services/acta.service';
import { ActaPdfService } from '../services/acta-pdf.service';
import { CreateActaReunionDto } from '../dto/create-acta-reunion.dto';
import { CreateActaConstitucionDto } from '../dto/create-acta-constitucion.dto';
import { CreateActaDailyDto } from '../dto/create-acta-daily.dto';
import { AprobarActaDto, SubirDocumentoFirmadoDto } from '../dto/aprobar-acta.dto';
import { ActaTipo, ActaEstado } from '../enums/acta.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('actas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActaController {
  constructor(
    private readonly actaService: ActaService,
    private readonly actaPdfService: ActaPdfService,
  ) {}

  @Post('reunion')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  createReunion(@Body() createDto: CreateActaReunionDto, @CurrentUser('id') userId: number) {
    return this.actaService.createReunion(createDto, userId);
  }

  @Post('constitucion')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  createConstitucion(@Body() createDto: CreateActaConstitucionDto, @CurrentUser('id') userId: number) {
    return this.actaService.createConstitucion(createDto, userId);
  }

  @Post('daily')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  createDaily(@Body() createDto: CreateActaDailyDto, @CurrentUser('id') userId: number) {
    return this.actaService.createDaily(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('tipo') tipo?: ActaTipo,
    @Query('estado') estado?: ActaEstado,
    @Query('activo') activo?: string,
  ) {
    return this.actaService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      tipo,
      estado,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actaService.findOne(id);
  }

  @Put(':id/reunion')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  updateReunion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateActaReunionDto>,
    @CurrentUser('id') userId: number,
  ) {
    return this.actaService.updateReunion(id, updateDto, userId);
  }

  @Put(':id/constitucion')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  updateConstitucion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateActaConstitucionDto>,
    @CurrentUser('id') userId: number,
  ) {
    return this.actaService.updateConstitucion(id, updateDto, userId);
  }

  @Put(':id/daily')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  updateDaily(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateActaDailyDto>,
    @CurrentUser('id') userId: number,
  ) {
    return this.actaService.updateDaily(id, updateDto, userId);
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { acta, proyecto } = await this.actaService.findOneWithProyecto(id);
    const pdfBuffer = await this.actaPdfService.generatePdf(acta, proyecto);

    let filename: string;
    if (acta.tipo === ActaTipo.CONSTITUCION) {
      filename = `Acta_Constitucion_${acta.codigo}.pdf`;
    } else if (acta.tipo === ActaTipo.DAILY_MEETING) {
      filename = `Acta_Daily_Meeting_${acta.codigo}.pdf`;
    } else {
      filename = `Acta_Reunion_${acta.codigo}.pdf`;
    }

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Post(':id/documento-firmado')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  subirDocumentoFirmado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubirDocumentoFirmadoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.actaService.subirDocumentoFirmado(id, dto.documentoFirmadoUrl, userId);
  }

  /**
   * Enviar Acta de Constitución a revisión
   * Solo SCRUM_MASTER y COORDINADOR pueden enviar a revisión
   */
  @Post(':id/enviar-revision')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  enviarARevision(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.actaService.enviarARevision(id, userId);
  }

  /**
   * Aprobar o rechazar un acta
   * Para Acta de Constitución: requiere aprobación de PMO y PATROCINADOR
   */
  @Post(':id/aprobar')
  @Roles(Role.ADMIN, Role.PMO, Role.PATROCINADOR)
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarDto: AprobarActaDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('rol') userRole: string,
  ) {
    return this.actaService.aprobar(id, aprobarDto, userId, userRole);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.actaService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/actas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoActasController {
  constructor(private readonly actaService: ActaService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.actaService.findByProyecto(proyectoId);
  }
}
