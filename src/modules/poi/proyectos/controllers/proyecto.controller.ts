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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProyectoService } from '../services/proyecto.service';
import { CreateProyectoDto } from '../dto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';
import { CambiarEstadoProyectoDto } from '../dto/cambiar-estado.dto';
import { ProyectoEstado } from '../enums/proyecto-estado.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@ApiTags('Proyectos')
@Controller('proyectos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Get('next-codigo')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Obtener el siguiente código de proyecto disponible (por PGD si se proporciona accionEstrategicaId)' })
  @ApiResponse({ status: 200, description: 'Código generado exitosamente' })
  getNextCodigo(@Query('accionEstrategicaId') accionEstrategicaId?: string) {
    return this.proyectoService.getNextCodigo(
      accionEstrategicaId ? parseInt(accionEstrategicaId, 10) : undefined,
    );
  }

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() createDto: CreateProyectoDto, @CurrentUser('id') userId: number) {
    return this.proyectoService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('estado') estado?: ProyectoEstado,
    @Query('coordinadorId') coordinadorId?: string,
    @Query('scrumMasterId') scrumMasterId?: string,
    @Query('accionEstrategicaId') accionEstrategicaId?: string,
    @Query('activo') activo?: string,
    @Query('pgdId') pgdId?: string,
  ) {
    return this.proyectoService.findAll({
      estado,
      coordinadorId: coordinadorId ? parseInt(coordinadorId, 10) : undefined,
      scrumMasterId: scrumMasterId ? parseInt(scrumMasterId, 10) : undefined,
      accionEstrategicaId: accionEstrategicaId ? parseInt(accionEstrategicaId, 10) : undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
      pgdId: pgdId ? parseInt(pgdId, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proyectoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.proyectoService.findByCodigo(codigo);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProyectoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.proyectoService.update(id, updateDto, userId);
  }

  @Post(':id/cambiar-estado')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoProyectoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.proyectoService.cambiarEstado(id, cambiarEstadoDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.proyectoService.remove(id, userId);
  }
}

@Controller('acciones-estrategicas/:accionEstrategicaId/proyectos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccionEstrategicaProyectosController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Get()
  findByAccionEstrategica(@Param('accionEstrategicaId', ParseIntPipe) accionEstrategicaId: number) {
    return this.proyectoService.findByAccionEstrategica(accionEstrategicaId);
  }
}
