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
import { PersonalService } from '../services/personal.service';
import { CreatePersonalDto } from '../dto/create-personal.dto';
import { UpdatePersonalDto } from '../dto/update-personal.dto';
import { Modalidad } from '../enums/modalidad.enum';
import { AsignarHabilidadDto, UpdatePersonalHabilidadDto } from '../../habilidades/dto/asignar-habilidad.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('personal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() createDto: CreatePersonalDto, @CurrentUser('id') userId: number) {
    return this.personalService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('divisionId') divisionId?: string,
    @Query('modalidad') modalidad?: Modalidad,
    @Query('disponible') disponible?: string,
    @Query('activo') activo?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.personalService.findAll({
      divisionId: divisionId ? parseInt(divisionId, 10) : undefined,
      modalidad,
      disponible: disponible !== undefined ? disponible === 'true' : undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
      busqueda,
    });
  }

  @Get('modalidades')
  getModalidades() {
    return Object.values(Modalidad);
  }

  @Get('next-code')
  getNextCode() {
    return this.personalService.getNextCode();
  }

  /**
   * GET /personal/desarrolladores
   * Obtener personal con rol DESARROLLADOR (para asignar como responsables en Proyectos)
   */
  @Get('desarrolladores')
  getDesarrolladores() {
    return this.personalService.findDesarrolladores();
  }

  /**
   * GET /personal/implementadores
   * Obtener personal con rol IMPLEMENTADOR (para asignar como responsables en Actividades)
   */
  @Get('implementadores')
  getImplementadores() {
    return this.personalService.findImplementadores();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.findOne(id);
  }

  @Get(':id/disponibilidad')
  getDisponibilidad(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.getDisponibilidad(id);
  }

  @Get(':id/habilidades')
  getHabilidades(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.getHabilidades(id);
  }

  @Post(':id/habilidades')
  @Roles(Role.ADMIN, Role.PMO)
  asignarHabilidad(
    @Param('id', ParseIntPipe) id: number,
    @Body() asignarDto: AsignarHabilidadDto,
  ) {
    return this.personalService.asignarHabilidad(id, asignarDto);
  }

  @Patch(':id/habilidades/:habilidadId')
  @Roles(Role.ADMIN, Role.PMO)
  actualizarHabilidad(
    @Param('id', ParseIntPipe) id: number,
    @Param('habilidadId', ParseIntPipe) habilidadId: number,
    @Body() updateDto: UpdatePersonalHabilidadDto,
  ) {
    return this.personalService.actualizarHabilidad(id, habilidadId, updateDto);
  }

  @Delete(':id/habilidades/:habilidadId')
  @Roles(Role.ADMIN, Role.PMO)
  quitarHabilidad(
    @Param('id', ParseIntPipe) id: number,
    @Param('habilidadId', ParseIntPipe) habilidadId: number,
  ) {
    return this.personalService.quitarHabilidad(id, habilidadId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePersonalDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.personalService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.personalService.remove(id, userId);
  }
}

@Controller('divisiones/:divisionId/personal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DivisionPersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Get()
  findByDivision(@Param('divisionId', ParseIntPipe) divisionId: number) {
    return this.personalService.findByDivision(divisionId);
  }
}
