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
import { OeiService } from '../services/oei.service';
import { CreateOeiDto } from '../dto/create-oei.dto';
import { UpdateOeiDto } from '../dto/update-oei.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('oei')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OeiController {
  constructor(private readonly oeiService: OeiService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() createOeiDto: CreateOeiDto, @CurrentUser('id') userId: number) {
    return this.oeiService.create(createOeiDto, userId);
  }

  @Get('next-codigo')
  @Roles(Role.ADMIN, Role.PMO)
  getNextCodigo(@Query('pgdId', ParseIntPipe) pgdId: number) {
    return this.oeiService.getNextCodigo(pgdId);
  }

  @Get()
  findAll(
    @Query('pgdId') pgdId?: string,
    @Query('activo') activo?: string,
  ) {
    return this.oeiService.findAll(
      pgdId ? parseInt(pgdId, 10) : undefined,
      activo !== undefined ? activo === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.oeiService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOeiDto: UpdateOeiDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.oeiService.update(id, updateOeiDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.oeiService.remove(id, userId);
  }
}

@Controller('pgd/:pgdId/oei')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PgdOeiController {
  constructor(private readonly oeiService: OeiService) {}

  @Get()
  findByPgd(@Param('pgdId', ParseIntPipe) pgdId: number) {
    return this.oeiService.findByPgd(pgdId);
  }
}
