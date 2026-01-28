import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NotificacionService } from '../services/notificacion.service';
import { TipoNotificacion } from '../enums/tipo-notificacion.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Get()
  findAll(
    @CurrentUser('id') usuarioId: number,
    @Query('leida') leida?: string,
    @Query('tipo') tipo?: TipoNotificacion,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificacionService.findAll(usuarioId, {
      leida: leida !== undefined ? leida === 'true' : undefined,
      tipo,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('conteo')
  getConteo(@CurrentUser('id') usuarioId: number) {
    return this.notificacionService.getConteo(usuarioId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.notificacionService.findOne(id, usuarioId);
  }

  @Patch(':id/leer')
  marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.notificacionService.marcarLeida(id, usuarioId);
  }

  @Patch('leer-todas')
  marcarTodasLeidas(@CurrentUser('id') usuarioId: number) {
    return this.notificacionService.marcarTodasLeidas(usuarioId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.notificacionService.remove(id, usuarioId);
  }
}
