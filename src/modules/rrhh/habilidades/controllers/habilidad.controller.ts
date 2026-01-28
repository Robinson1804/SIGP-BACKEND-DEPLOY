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
import { HabilidadService } from '../services/habilidad.service';
import { CreateHabilidadDto } from '../dto/create-habilidad.dto';
import { UpdateHabilidadDto } from '../dto/update-habilidad.dto';
import { HabilidadCategoria } from '../enums/habilidad-categoria.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('habilidades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HabilidadController {
  constructor(private readonly habilidadService: HabilidadService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() createDto: CreateHabilidadDto) {
    return this.habilidadService.create(createDto);
  }

  @Get()
  findAll(
    @Query('categoria') categoria?: HabilidadCategoria,
    @Query('activo') activo?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.habilidadService.findAll({
      categoria,
      activo: activo !== undefined ? activo === 'true' : undefined,
      busqueda,
    });
  }

  @Get('categorias')
  getCategorias() {
    return Object.values(HabilidadCategoria);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.habilidadService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHabilidadDto,
  ) {
    return this.habilidadService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habilidadService.remove(id);
  }
}
