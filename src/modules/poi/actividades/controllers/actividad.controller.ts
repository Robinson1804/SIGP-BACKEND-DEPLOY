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
import { ActividadService } from '../services/actividad.service';
import { CreateActividadDto } from '../dto/create-actividad.dto';
import { UpdateActividadDto } from '../dto/update-actividad.dto';
import { ActividadEstado } from '../enums/actividad-estado.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('actividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() createDto: CreateActividadDto, @CurrentUser('id') userId: number) {
    return this.actividadService.create(createDto, userId);
  }

  @Get('next-codigo')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  getNextCodigo() {
    return this.actividadService.getNextCodigo();
  }

  @Get()
  findAll(
    @Query('estado') estado?: ActividadEstado,
    @Query('coordinadorId') coordinadorId?: string,
    @Query('accionEstrategicaId') accionEstrategicaId?: string,
    @Query('activo') activo?: string,
    @Query('pgdId') pgdId?: string,
  ) {
    return this.actividadService.findAll({
      estado,
      coordinadorId: coordinadorId ? parseInt(coordinadorId, 10) : undefined,
      accionEstrategicaId: accionEstrategicaId ? parseInt(accionEstrategicaId, 10) : undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
      pgdId: pgdId ? parseInt(pgdId, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actividadService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateActividadDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.actividadService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.actividadService.remove(id, userId);
  }
}

@Controller('acciones-estrategicas/:accionEstrategicaId/actividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccionEstrategicaActividadesController {
  constructor(private readonly actividadService: ActividadService) {}

  @Get()
  findByAccionEstrategica(@Param('accionEstrategicaId', ParseIntPipe) accionEstrategicaId: number) {
    return this.actividadService.findByAccionEstrategica(accionEstrategicaId);
  }
}
