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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccionEstrategicaService } from '../services/accion-estrategica.service';
import { CreateAccionEstrategicaDto } from '../dto/create-accion-estrategica.dto';
import { UpdateAccionEstrategicaDto } from '../dto/update-accion-estrategica.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@ApiTags('AE - Acciones Estratégicas')
@ApiBearerAuth()
@Controller('acciones-estrategicas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccionEstrategicaController {
  constructor(private readonly accionEstrategicaService: AccionEstrategicaService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Crear una nueva Acción Estratégica' })
  create(
    @Body() createDto: CreateAccionEstrategicaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.accionEstrategicaService.create(createDto, userId);
  }

  @Get('next-codigo')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Obtener el siguiente código AE disponible para un OEGD' })
  getNextCodigo(@Query('oegdId', ParseIntPipe) oegdId: number) {
    return this.accionEstrategicaService.getNextCodigo(oegdId);
  }

  @Get()
  findAll(
    @Query('oegdId') oegdId?: string,
    @Query('activo') activo?: string,
    @Query('pgdId') pgdId?: string,
  ) {
    return this.accionEstrategicaService.findAll(
      oegdId ? parseInt(oegdId, 10) : undefined,
      activo !== undefined ? activo === 'true' : undefined,
      pgdId ? parseInt(pgdId, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accionEstrategicaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAccionEstrategicaDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.accionEstrategicaService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.accionEstrategicaService.remove(id, userId);
  }
}

@Controller('oegd/:oegdId/acciones-estrategicas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OegdAccionEstrategicaController {
  constructor(private readonly accionEstrategicaService: AccionEstrategicaService) {}

  @Get()
  findByOegd(@Param('oegdId', ParseIntPipe) oegdId: number) {
    return this.accionEstrategicaService.findByOegd(oegdId);
  }
}
