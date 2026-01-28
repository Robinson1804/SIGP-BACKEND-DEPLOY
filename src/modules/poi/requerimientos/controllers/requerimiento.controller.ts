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
import { RequerimientoService } from '../services/requerimiento.service';
import { CreateRequerimientoDto } from '../dto/create-requerimiento.dto';
import { UpdateRequerimientoDto } from '../dto/update-requerimiento.dto';
import { RequerimientoTipo, RequerimientoPrioridad } from '../enums/requerimiento.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('requerimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequerimientoController {
  constructor(private readonly requerimientoService: RequerimientoService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  create(@Body() createDto: CreateRequerimientoDto, @CurrentUser('id') userId: number) {
    return this.requerimientoService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('tipo') tipo?: RequerimientoTipo,
    @Query('prioridad') prioridad?: RequerimientoPrioridad,
    @Query('activo') activo?: string,
  ) {
    return this.requerimientoService.findAll({
      proyectoId: proyectoId ? parseInt(proyectoId, 10) : undefined,
      tipo,
      prioridad,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requerimientoService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRequerimientoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.requerimientoService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.requerimientoService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/requerimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoRequerimientosController {
  constructor(private readonly requerimientoService: RequerimientoService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.requerimientoService.findByProyecto(proyectoId);
  }
}
