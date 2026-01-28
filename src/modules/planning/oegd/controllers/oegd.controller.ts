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
import { OegdService } from '../services/oegd.service';
import { CreateOegdDto } from '../dto/create-oegd.dto';
import { UpdateOegdDto } from '../dto/update-oegd.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@ApiTags('OEGD - Objetivos Específicos de Gobierno Digital')
@ApiBearerAuth()
@Controller('oegd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OegdController {
  constructor(private readonly oegdService: OegdService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Crear un nuevo OEGD' })
  create(@Body() createOegdDto: CreateOegdDto, @CurrentUser('id') userId: number) {
    return this.oegdService.create(createOegdDto, userId);
  }

  @Get('next-codigo')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Obtener el siguiente código OEGD disponible para un OGD' })
  getNextCodigo(@Query('ogdId', ParseIntPipe) ogdId: number) {
    return this.oegdService.getNextCodigo(ogdId);
  }

  @Get()
  findAll(
    @Query('ogdId') ogdId?: string,
    @Query('activo') activo?: string,
    @Query('pgdId') pgdId?: string,
  ) {
    return this.oegdService.findAll(
      ogdId ? parseInt(ogdId, 10) : undefined,
      activo !== undefined ? activo === 'true' : undefined,
      pgdId ? parseInt(pgdId, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.oegdService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOegdDto: UpdateOegdDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.oegdService.update(id, updateOegdDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.oegdService.remove(id, userId);
  }
}

@Controller('ogd/:ogdId/oegd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OgdOegdController {
  constructor(private readonly oegdService: OegdService) {}

  @Get()
  findByOgd(@Param('ogdId', ParseIntPipe) ogdId: number) {
    return this.oegdService.findByOgd(ogdId);
  }
}
