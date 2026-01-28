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
import { OgdService } from '../services/ogd.service';
import { CreateOgdDto } from '../dto/create-ogd.dto';
import { UpdateOgdDto } from '../dto/update-ogd.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@ApiTags('OGD - Objetivos de Gobierno Digital')
@ApiBearerAuth()
@Controller('ogd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OgdController {
  constructor(private readonly ogdService: OgdService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Crear un nuevo OGD' })
  create(@Body() createOgdDto: CreateOgdDto, @CurrentUser('id') userId: number) {
    return this.ogdService.create(createOgdDto, userId);
  }

  @Get('next-codigo')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Obtener el siguiente código OGD disponible para un PGD' })
  getNextCodigo(@Query('pgdId', ParseIntPipe) pgdId: number) {
    return this.ogdService.getNextCodigo(pgdId);
  }

  @Get()
  findAll(
    @Query('pgdId') pgdId?: string,
    @Query('activo') activo?: string,
  ) {
    return this.ogdService.findAll(
      pgdId ? parseInt(pgdId, 10) : undefined,
      activo !== undefined ? activo === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ogdService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOgdDto: UpdateOgdDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.ogdService.update(id, updateOgdDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.ogdService.remove(id, userId);
  }
}

@Controller('pgd/:pgdId/ogd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PgdOgdController {
  constructor(private readonly ogdService: OgdService) {}

  @Get()
  findByPgd(@Param('pgdId', ParseIntPipe) pgdId: number) {
    return this.ogdService.findByPgd(pgdId);
  }
}
