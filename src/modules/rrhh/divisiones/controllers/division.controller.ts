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
import { DivisionService } from '../services/division.service';
import { CreateDivisionDto } from '../dto/create-division.dto';
import { UpdateDivisionDto } from '../dto/update-division.dto';
import { AsignarPersonalDto } from '../dto/asignar-personal.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('divisiones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() createDto: CreateDivisionDto, @CurrentUser('id') userId: number) {
    return this.divisionService.create(createDto, userId);
  }

  @Get()
  findAll(@Query('activo') activo?: string) {
    return this.divisionService.findAll(
      activo !== undefined ? activo === 'true' : undefined,
    );
  }

  @Get('arbol')
  getArbol() {
    return this.divisionService.getArbol();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.divisionService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDivisionDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.divisionService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.divisionService.remove(id, userId);
  }

  // ===== COORDINADOR ENDPOINTS =====

  @Post(':id/coordinador')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Asignar coordinador a una división' })
  @ApiResponse({ status: 200, description: 'Coordinador asignado correctamente' })
  asignarCoordinador(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarPersonalDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.divisionService.asignarCoordinador(id, dto.personalId, userId);
  }

  @Delete(':id/coordinador')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Remover coordinador de una división' })
  removerCoordinador(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.divisionService.removerCoordinador(id, userId);
  }

  // ===== SCRUM MASTERS ENDPOINTS =====

  @Get(':id/scrum-masters')
  @ApiOperation({ summary: 'Obtener scrum masters de una división' })
  getScrumMasters(@Param('id', ParseIntPipe) id: number) {
    return this.divisionService.getScrumMasters(id);
  }

  @Post(':id/scrum-masters')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Asignar scrum master a una división' })
  @ApiResponse({ status: 201, description: 'Scrum master asignado correctamente' })
  asignarScrumMaster(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarPersonalDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.divisionService.asignarScrumMaster(id, dto.personalId, userId);
  }

  @Delete(':id/scrum-masters/:personalId')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Remover scrum master de una división' })
  removerScrumMaster(
    @Param('id', ParseIntPipe) id: number,
    @Param('personalId', ParseIntPipe) personalId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.divisionService.removerScrumMaster(id, personalId, userId);
  }
}
