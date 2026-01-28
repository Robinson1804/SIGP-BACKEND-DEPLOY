import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

// Divisiones
import { Division } from './divisiones/entities/division.entity';
import { DivisionService } from './divisiones/services/division.service';
import { DivisionController } from './divisiones/controllers/division.controller';

// Personal
import { Personal } from './personal/entities/personal.entity';
import { PersonalService } from './personal/services/personal.service';
import {
  PersonalController,
  DivisionPersonalController,
} from './personal/controllers/personal.controller';

// Habilidades
import { Habilidad } from './habilidades/entities/habilidad.entity';
import { PersonalHabilidad } from './habilidades/entities/personal-habilidad.entity';
import { HabilidadService } from './habilidades/services/habilidad.service';
import { PersonalHabilidadService } from './habilidades/services/personal-habilidad.service';
import { HabilidadController } from './habilidades/controllers/habilidad.controller';

// Asignaciones
import { Asignacion } from './asignaciones/entities/asignacion.entity';
import { AsignacionService } from './asignaciones/services/asignacion.service';
import {
  AsignacionController,
  ProyectoAsignacionesController,
  ActividadAsignacionesController,
  SubproyectoAsignacionesController,
} from './asignaciones/controllers/asignacion.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Divisiones
      Division,
      // Personal
      Personal,
      // Habilidades
      Habilidad,
      PersonalHabilidad,
      // Asignaciones
      Asignacion,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [
    // Divisiones
    DivisionController,
    // Personal
    PersonalController,
    DivisionPersonalController,
    // Habilidades
    HabilidadController,
    // Asignaciones
    AsignacionController,
    ProyectoAsignacionesController,
    ActividadAsignacionesController,
    SubproyectoAsignacionesController,
  ],
  providers: [
    // Divisiones
    DivisionService,
    // Personal
    PersonalService,
    // Habilidades
    HabilidadService,
    PersonalHabilidadService,
    // Asignaciones
    AsignacionService,
  ],
  exports: [
    DivisionService,
    PersonalService,
    HabilidadService,
    PersonalHabilidadService,
    AsignacionService,
  ],
})
export class RrhhModule {}
