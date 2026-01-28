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
  HttpCode,
} from '@nestjs/common';
import { PgdService } from '../services/pgd.service';
import { CreatePgdDto } from '../dto/create-pgd.dto';
import { UpdatePgdDto } from '../dto/update-pgd.dto';
import { FilterPgdDto } from '../dto/filter-pgd.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';

@Controller('pgd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PgdController {
  constructor(private readonly pgdService: PgdService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  create(@Body() createPgdDto: CreatePgdDto, @CurrentUser('id') userId: number) {
    return this.pgdService.create(createPgdDto, userId);
  }

  @Get()
  findAll(@Query() filterDto: FilterPgdDto) {
    return this.pgdService.findAll(filterDto);
  }

  @Get('vigente')
  findVigente() {
    return this.pgdService.findVigente();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pgdService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePgdDto: UpdatePgdDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.pgdService.update(id, updatePgdDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.pgdService.hardDelete(id);
  }

  @Post(':id/set-vigente')
  @HttpCode(200)
  @Roles(Role.ADMIN, Role.PMO)
  setVigente(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.pgdService.setVigente(id, userId);
  }
}
