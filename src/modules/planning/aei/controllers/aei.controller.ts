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
import { AeiService } from '../services/aei.service';
import { CreateAeiDto } from '../dto/create-aei.dto';
import { UpdateAeiDto } from '../dto/update-aei.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@ApiTags('AEI - Acciones Estratégicas Institucionales')
@ApiBearerAuth()
@Controller('aei')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AeiController {
  constructor(private readonly aeiService: AeiService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Crear una nueva AEI' })
  create(@Body() createAeiDto: CreateAeiDto, @CurrentUser('id') userId: number) {
    return this.aeiService.create(createAeiDto, userId);
  }

  @Get('next-codigo')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Obtener el siguiente código AEI disponible para un OEI' })
  getNextCodigo(@Query('oeiId', ParseIntPipe) oeiId: number) {
    return this.aeiService.getNextCodigo(oeiId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las AEIs' })
  findAll(
    @Query('oeiId') oeiId?: string,
    @Query('activo') activo?: string,
  ) {
    return this.aeiService.findAll(
      oeiId ? parseInt(oeiId, 10) : undefined,
      activo !== undefined ? activo === 'true' : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una AEI por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aeiService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Actualizar una AEI' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAeiDto: UpdateAeiDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.aeiService.update(id, updateAeiDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Desactivar una AEI (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.aeiService.remove(id, userId);
  }
}

@ApiTags('AEI - Por OEI')
@ApiBearerAuth()
@Controller('oei/:oeiId/aei')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OeiAeiController {
  constructor(private readonly aeiService: AeiService) {}

  @Get()
  @ApiOperation({ summary: 'Listar AEIs de un OEI específico' })
  findByOei(@Param('oeiId', ParseIntPipe) oeiId: number) {
    return this.aeiService.findByOei(oeiId);
  }
}
