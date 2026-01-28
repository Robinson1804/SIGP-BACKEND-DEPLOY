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
import { SubproyectoService } from '../services/subproyecto.service';
import { CreateSubproyectoDto } from '../dto/create-subproyecto.dto';
import { UpdateSubproyectoDto } from '../dto/update-subproyecto.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('subproyectos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubproyectoController {
  constructor(private readonly subproyectoService: SubproyectoService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  create(@Body() createDto: CreateSubproyectoDto, @CurrentUser('id') userId: number) {
    return this.subproyectoService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('proyectoPadreId') proyectoPadreId?: string,
    @Query('activo') activo?: string,
  ) {
    return this.subproyectoService.findAll(
      proyectoPadreId ? parseInt(proyectoPadreId, 10) : undefined,
      activo !== undefined ? activo === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subproyectoService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR, Role.SCRUM_MASTER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubproyectoDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.subproyectoService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO, Role.COORDINADOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.subproyectoService.remove(id, userId);
  }
}

@Controller('proyectos/:proyectoId/subproyectos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoSubproyectosController {
  constructor(private readonly subproyectoService: SubproyectoService) {}

  @Get()
  findByProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.subproyectoService.findByProyecto(proyectoId);
  }
}
