import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Pgd } from './pgd/entities/pgd.entity';
import { Oei } from './oei/entities/oei.entity';
import { Ogd } from './ogd/entities/ogd.entity';
import { Oegd } from './oegd/entities/oegd.entity';
import { AccionEstrategica } from './acciones-estrategicas/entities/accion-estrategica.entity';
import { Aei } from './aei/entities/aei.entity';
import { OgdOei } from './entities/ogd-oei.entity';
import { OegdAei } from './entities/oegd-aei.entity';

// Services
import { PgdService } from './pgd/services/pgd.service';
import { OeiService } from './oei/services/oei.service';
import { OgdService } from './ogd/services/ogd.service';
import { OegdService } from './oegd/services/oegd.service';
import { AccionEstrategicaService } from './acciones-estrategicas/services/accion-estrategica.service';
import { AeiService } from './aei/services/aei.service';

// Controllers
import { PgdController } from './pgd/controllers/pgd.controller';
import { OeiController, PgdOeiController } from './oei/controllers/oei.controller';
import { OgdController, PgdOgdController } from './ogd/controllers/ogd.controller';
import { OegdController, OgdOegdController } from './oegd/controllers/oegd.controller';
import {
  AccionEstrategicaController,
  OegdAccionEstrategicaController,
} from './acciones-estrategicas/controllers/accion-estrategica.controller';
import { AeiController, OeiAeiController } from './aei/controllers/aei.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pgd,
      Oei,
      Ogd,
      Oegd,
      AccionEstrategica,
      Aei,
      OgdOei,
      OegdAei,
    ]),
  ],
  controllers: [
    PgdController,
    OeiController,
    PgdOeiController,
    OgdController,
    PgdOgdController,
    OegdController,
    OgdOegdController,
    AccionEstrategicaController,
    OegdAccionEstrategicaController,
    AeiController,
    OeiAeiController,
  ],
  providers: [
    PgdService,
    OeiService,
    OgdService,
    OegdService,
    AccionEstrategicaService,
    AeiService,
  ],
  exports: [
    PgdService,
    OeiService,
    OgdService,
    OegdService,
    AccionEstrategicaService,
    AeiService,
  ],
})
export class PlanningModule {}
