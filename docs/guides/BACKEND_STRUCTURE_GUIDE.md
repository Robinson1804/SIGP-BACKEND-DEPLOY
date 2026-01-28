# SIGP NestJS Backend Structure Guide

## Complete Structure Created

This document describes the complete NestJS backend structure for SIGP (Sistema Integral de Gestión de Proyectos).

### ✅ Files Already Created

```
src/
├── main.ts                                    ✅ CREATED
├── app.module.ts                              ✅ CREATED
├── config/
│   ├── database.config.ts                     ✅ CREATED
│   ├── jwt.config.ts                          ✅ CREATED
│   ├── redis.config.ts                        ✅ CREATED
│   └── app.config.ts                          ✅ CREATED
├── common/
│   ├── constants/
│   │   └── roles.constant.ts                  ✅ CREATED
│   ├── decorators/
│   │   ├── current-user.decorator.ts          ✅ CREATED
│   │   ├── roles.decorator.ts                 ✅ CREATED
│   │   └── public.decorator.ts                ✅ CREATED
│   ├── guards/
│   │   ├── jwt-auth.guard.ts                  ✅ CREATED
│   │   └── roles.guard.ts                     ✅ CREATED
│   ├── filters/
│   │   └── http-exception.filter.ts           ✅ CREATED
│   ├── interceptors/
│   │   └── transform.interceptor.ts           ✅ CREATED
│   ├── pipes/
│   │   └── validation.pipe.ts                 ✅ CREATED
│   ├── dto/
│   │   ├── pagination.dto.ts                  ✅ CREATED
│   │   └── response.dto.ts                    ✅ CREATED
│   └── common.module.ts                       ✅ CREATED
└── modules/
    ├── auth/                                   ✅ FULLY CREATED
    │   ├── entities/
    │   │   ├── usuario.entity.ts              ✅
    │   │   └── sesion.entity.ts               ✅
    │   ├── dto/
    │   │   ├── login.dto.ts                   ✅
    │   │   ├── register.dto.ts                ✅
    │   │   ├── refresh-token.dto.ts           ✅
    │   │   ├── change-password.dto.ts         ✅
    │   │   └── auth-response.dto.ts           ✅
    │   ├── services/
    │   │   └── auth.service.ts                ✅
    │   ├── controllers/
    │   │   └── auth.controller.ts             ✅
    │   ├── strategies/
    │   │   ├── jwt.strategy.ts                ✅
    │   │   └── local.strategy.ts              ✅
    │   └── auth.module.ts                     ✅
    └── storage/                                ✅ ALREADY EXISTS
```

---

## 📋 Module Templates to Create

Below are detailed templates for creating the remaining modules. Each module follows the same pattern:
- **entities/** - TypeORM entities based on database schema
- **dto/** - Request/Response DTOs with validation
- **services/** - Business logic
- **controllers/** - REST API endpoints
- **{module}.module.ts** - NestJS module definition

---

## 1. PLANNING MODULE

### File Structure
```
src/modules/planning/
├── planning.module.ts
├── pgd/
│   ├── entities/pgd.entity.ts
│   ├── dto/create-pgd.dto.ts
│   ├── dto/update-pgd.dto.ts
│   ├── services/pgd.service.ts
│   └── controllers/pgd.controller.ts
├── oei/
│   ├── entities/oei.entity.ts
│   ├── dto/create-oei.dto.ts
│   ├── dto/update-oei.dto.ts
│   ├── services/oei.service.ts
│   └── controllers/oei.controller.ts
├── ogd/
│   ├── entities/ogd.entity.ts
│   ├── dto/create-ogd.dto.ts
│   ├── dto/update-ogd.dto.ts
│   ├── services/ogd.service.ts
│   └── controllers/ogd.controller.ts
├── oegd/
│   ├── entities/oegd.entity.ts
│   ├── dto/create-oegd.dto.ts
│   ├── dto/update-oegd.dto.ts
│   ├── services/oegd.service.ts
│   └── controllers/oegd.controller.ts
└── acciones-estrategicas/
    ├── entities/accion-estrategica.entity.ts
    ├── dto/create-accion-estrategica.dto.ts
    ├── dto/update-accion-estrategica.dto.ts
    ├── services/accion-estrategica.service.ts
    └── controllers/accion-estrategica.controller.ts
```

### Example Entity: PGD

```typescript
// src/modules/planning/pgd/entities/pgd.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { OEI } from '../../oei/entities/oei.entity';
import { OGD } from '../../ogd/entities/ogd.entity';

@Entity('pgd', { schema: 'planning' })
export class PGD {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'anio_inicio', type: 'integer' })
  anioInicio: number;

  @Column({ name: 'anio_fin', type: 'integer' })
  anioFin: number;

  @Column({ length: 50, default: 'Activo' })
  estado: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'created_by' })
  createdBy: Usuario;

  @OneToMany(() => OEI, oei => oei.pgd)
  oeis: OEI[];

  @OneToMany(() => OGD, ogd => ogd.pgd)
  ogds: OGD[];
}
```

### Example DTO

```typescript
// src/modules/planning/pgd/dto/create-pgd.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreatePGDDto {
  @ApiProperty({ example: 'Plan de Gobierno Digital 2024-2027' })
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2024)
  @Max(2050)
  anioInicio: number;

  @ApiProperty({ example: 2027 })
  @IsInt()
  @Min(2024)
  @Max(2050)
  anioFin: number;
}

// src/modules/planning/pgd/dto/update-pgd.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePGDDto } from './create-pgd.dto';

export class UpdatePGDDto extends PartialType(CreatePGDDto) {}
```

### Example Service

```typescript
// src/modules/planning/pgd/services/pgd.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PGD } from '../entities/pgd.entity';
import { CreatePGDDto } from '../dto/create-pgd.dto';
import { UpdatePGDDto } from '../dto/update-pgd.dto';
import { PaginationDto, PaginatedResult } from '../../../../common/dto/pagination.dto';

@Injectable()
export class PGDService {
  constructor(
    @InjectRepository(PGD)
    private readonly pgdRepository: Repository<PGD>,
  ) {}

  async create(createDto: CreatePGDDto, userId: number): Promise<PGD> {
    const pgd = this.pgdRepository.create({
      ...createDto,
      createdBy: { id: userId },
    });
    return this.pgdRepository.save(pgd);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<PGD>> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.pgdRepository.findAndCount({
      where: { activo: true },
      take: limit,
      skip,
      order: { [sortBy]: sortOrder },
      relations: ['createdBy'],
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<PGD> {
    const pgd = await this.pgdRepository.findOne({
      where: { id, activo: true },
      relations: ['oeis', 'ogds'],
    });

    if (!pgd) {
      throw new NotFoundException(`PGD with ID ${id} not found`);
    }

    return pgd;
  }

  async update(id: number, updateDto: UpdatePGDDto): Promise<PGD> {
    await this.findOne(id); // Check exists
    await this.pgdRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check exists
    await this.pgdRepository.update(id, { activo: false });
  }
}
```

### Example Controller

```typescript
// src/modules/planning/pgd/controllers/pgd.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PGDService } from '../services/pgd.service';
import { CreatePGDDto } from '../dto/create-pgd.dto';
import { UpdatePGDDto } from '../dto/update-pgd.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/roles.constant';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

@ApiTags('planning')
@Controller('pgd')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PGDController {
  constructor(private readonly pgdService: PGDService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Create new PGD' })
  @ApiResponse({ status: 201, description: 'PGD created successfully' })
  create(@Body() createDto: CreatePGDDto, @CurrentUser('id') userId: number) {
    return this.pgdService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all PGDs' })
  findAll(@Query() pagination: PaginationDto) {
    return this.pgdService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PGD by ID' })
  findOne(@Param('id') id: number) {
    return this.pgdService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Update PGD' })
  update(@Param('id') id: number, @Body() updateDto: UpdatePGDDto) {
    return this.pgdService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PMO)
  @ApiOperation({ summary: 'Delete PGD (soft delete)' })
  remove(@Param('id') id: number) {
    return this.pgdService.remove(id);
  }
}
```

### Module Definition

```typescript
// src/modules/planning/planning.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PGD } from './pgd/entities/pgd.entity';
import { OEI } from './oei/entities/oei.entity';
import { OGD } from './ogd/entities/ogd.entity';
import { OEGD } from './oegd/entities/oegd.entity';
import { AccionEstrategica } from './acciones-estrategicas/entities/accion-estrategica.entity';
import { PGDService } from './pgd/services/pgd.service';
import { PGDController } from './pgd/controllers/pgd.controller';
// Import all other services and controllers...

@Module({
  imports: [
    TypeOrmModule.forFeature([PGD, OEI, OGD, OEGD, AccionEstrategica]),
  ],
  controllers: [PGDController /* , OEIController, ... */],
  providers: [PGDService /* , OEIService, ... */],
  exports: [PGDService /* , ... */],
})
export class PlanningModule {}
```

---

## 2. POI MODULE

### File Structure
```
src/modules/poi/
├── poi.module.ts
├── proyectos/
│   ├── entities/proyecto.entity.ts
│   ├── enums/proyecto-estado.enum.ts
│   ├── dto/create-proyecto.dto.ts
│   ├── dto/update-proyecto.dto.ts
│   ├── dto/cambiar-estado.dto.ts
│   ├── services/proyecto.service.ts
│   └── controllers/proyecto.controller.ts
├── actividades/
│   ├── entities/actividad.entity.ts
│   ├── enums/actividad-estado.enum.ts
│   ├── dto/create-actividad.dto.ts
│   ├── dto/update-actividad.dto.ts
│   ├── services/actividad.service.ts
│   └── controllers/actividad.controller.ts
├── subproyectos/
│   ├── entities/subproyecto.entity.ts
│   ├── dto/create-subproyecto.dto.ts
│   ├── dto/update-subproyecto.dto.ts
│   ├── services/subproyecto.service.ts
│   └── controllers/subproyecto.controller.ts
├── documentos/
│   ├── entities/documento.entity.ts
│   ├── enums/documento-fase.enum.ts
│   ├── dto/create-documento.dto.ts
│   ├── dto/aprobar-documento.dto.ts
│   ├── services/documento.service.ts
│   └── controllers/documento.controller.ts
├── actas/
│   ├── entities/acta.entity.ts
│   ├── enums/acta-tipo.enum.ts
│   ├── dto/create-acta-reunion.dto.ts
│   ├── dto/create-acta-constitucion.dto.ts
│   ├── dto/aprobar-acta.dto.ts
│   ├── services/acta.service.ts
│   └── controllers/acta.controller.ts
├── requerimientos/
│   ├── entities/requerimiento.entity.ts
│   ├── dto/create-requerimiento.dto.ts
│   ├── dto/update-requerimiento.dto.ts
│   ├── services/requerimiento.service.ts
│   └── controllers/requerimiento.controller.ts
├── cronogramas/
│   ├── entities/cronograma.entity.ts
│   ├── dto/create-cronograma.dto.ts
│   ├── dto/update-cronograma.dto.ts
│   ├── services/cronograma.service.ts
│   └── controllers/cronograma.controller.ts
├── informes-sprint/
│   ├── entities/informe-sprint.entity.ts
│   ├── dto/generar-informe-sprint.dto.ts
│   ├── dto/aprobar-informe-sprint.dto.ts
│   ├── services/informe-sprint.service.ts
│   └── controllers/informe-sprint.controller.ts
└── informes-actividad/
    ├── entities/informe-actividad.entity.ts
    ├── dto/create-informe-actividad.dto.ts
    ├── dto/aprobar-informe-actividad.dto.ts
    ├── services/informe-actividad.service.ts
    └── controllers/informe-actividad.controller.ts
```

### Key Enums

```typescript
// src/modules/poi/proyectos/enums/proyecto-estado.enum.ts
export enum ProyectoEstado {
  PENDIENTE = 'Pendiente',
  EN_PLANIFICACION = 'En planificacion',
  EN_DESARROLLO = 'En desarrollo',
  FINALIZADO = 'Finalizado',
  CANCELADO = 'Cancelado',
}

// src/modules/poi/documentos/enums/documento-fase.enum.ts
export enum DocumentoFase {
  ANALISIS_PLANIFICACION = 'Analisis y Planificacion',
  DISENO = 'Diseno',
  DESARROLLO = 'Desarrollo',
  PRUEBAS = 'Pruebas',
  IMPLEMENTACION = 'Implementacion',
  MANTENIMIENTO = 'Mantenimiento',
}
```

### Example: Proyecto Entity

```typescript
// src/modules/poi/proyectos/entities/proyecto.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { AccionEstrategica } from '../../../planning/acciones-estrategicas/entities/accion-estrategica.entity';
import { ProyectoEstado } from '../enums/proyecto-estado.enum';

@Entity('proyectos', { schema: 'poi' })
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 20, default: 'Proyecto' })
  tipo: string;

  @Column({ length: 50, nullable: true })
  clasificacion: string;

  @Index()
  @Column({ type: 'varchar', length: 50, default: ProyectoEstado.PENDIENTE })
  estado: ProyectoEstado;

  // Vinculacion estrategica
  @ManyToOne(() => AccionEstrategica)
  @JoinColumn({ name: 'accion_estrategica_id' })
  accionEstrategica: AccionEstrategica;

  @Column({ name: 'accion_estrategica_id', nullable: true })
  accionEstrategicaId: number;

  // Responsables
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'coordinador_id' })
  coordinador: Usuario;

  @Column({ name: 'coordinador_id', nullable: true })
  coordinadorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'scrum_master_id' })
  scrumMaster: Usuario;

  @Column({ name: 'scrum_master_id', nullable: true })
  scrumMasterId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'patrocinador_id' })
  patrocinador: Usuario;

  @Column({ name: 'patrocinador_id', nullable: true })
  patrocinadorId: number;

  // Financiero
  @Column({ length: 100, nullable: true })
  coordinacion: string;

  @Column({ type: 'text', array: true, nullable: true })
  areasFinancieras: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  montoAnual: number;

  @Column({ type: 'integer', array: true, nullable: true })
  anios: number[];

  // Fechas
  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaFin: Date;

  // Metodologia
  @Column({ name: 'metodo_gestion', length: 20, default: 'Scrum' })
  metodoGestion: string;

  // Auditoria
  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'created_by' })
  createdBy: Usuario;
}
```

---

## 3. AGILE MODULE

### File Structure
```
src/modules/agile/
├── agile.module.ts
├── epicas/
│   ├── entities/epica.entity.ts
│   ├── dto/create-epica.dto.ts
│   ├── dto/update-epica.dto.ts
│   ├── services/epica.service.ts
│   └── controllers/epica.controller.ts
├── sprints/
│   ├── entities/sprint.entity.ts
│   ├── enums/sprint-estado.enum.ts
│   ├── dto/create-sprint.dto.ts
│   ├── dto/update-sprint.dto.ts
│   ├── dto/cerrar-sprint.dto.ts
│   ├── services/sprint.service.ts
│   ├── services/sprint-metricas.service.ts
│   └── controllers/sprint.controller.ts
├── historias-usuario/
│   ├── entities/historia-usuario.entity.ts
│   ├── entities/hu-criterio-aceptacion.entity.ts
│   ├── entities/hu-requerimiento.entity.ts
│   ├── entities/hu-dependencia.entity.ts
│   ├── enums/hu-estado.enum.ts
│   ├── enums/hu-prioridad.enum.ts
│   ├── dto/create-hu.dto.ts
│   ├── dto/update-hu.dto.ts
│   ├── dto/mover-hu-sprint.dto.ts
│   ├── dto/cambiar-estado-hu.dto.ts
│   ├── dto/vincular-requerimiento.dto.ts
│   ├── services/historia-usuario.service.ts
│   └── controllers/historia-usuario.controller.ts
├── tareas/
│   ├── entities/tarea.entity.ts
│   ├── enums/tarea-tipo.enum.ts
│   ├── enums/tarea-estado.enum.ts
│   ├── dto/create-tarea.dto.ts
│   ├── dto/update-tarea.dto.ts
│   ├── dto/finalizar-tarea.dto.ts
│   ├── dto/validar-tarea.dto.ts
│   ├── services/tarea.service.ts
│   └── controllers/tarea.controller.ts
├── subtareas/
│   ├── entities/subtarea.entity.ts
│   ├── dto/create-subtarea.dto.ts
│   ├── dto/update-subtarea.dto.ts
│   ├── services/subtarea.service.ts
│   └── controllers/subtarea.controller.ts
├── tablero/
│   ├── dto/tablero-scrum.dto.ts
│   ├── dto/tablero-kanban.dto.ts
│   ├── dto/mover-item.dto.ts
│   ├── services/tablero-scrum.service.ts
│   ├── services/tablero-kanban.service.ts
│   └── controllers/tablero.controller.ts
├── backlog/
│   ├── dto/reordenar-backlog.dto.ts
│   ├── dto/filtros-backlog.dto.ts
│   ├── services/backlog.service.ts
│   └── controllers/backlog.controller.ts
└── daily-meeting/
    ├── entities/daily-meeting.entity.ts
    ├── entities/daily-participante.entity.ts
    ├── dto/create-daily.dto.ts
    ├── services/daily-meeting.service.ts
    └── controllers/daily-meeting.controller.ts
```

### Key Enums

```typescript
// src/modules/agile/tareas/enums/tarea-tipo.enum.ts
export enum TareaTipo {
  SCRUM = 'SCRUM',
  KANBAN = 'KANBAN',
}

// src/modules/agile/tareas/enums/tarea-estado.enum.ts
export enum TareaEstado {
  POR_HACER = 'Por hacer',
  EN_PROGRESO = 'En progreso',
  EN_REVISION = 'En revision',
  FINALIZADO = 'Finalizado',
}

// src/modules/agile/historias-usuario/enums/hu-prioridad.enum.ts
export enum HUPrioridad {
  MUST = 'Must',
  SHOULD = 'Should',
  COULD = 'Could',
  WONT = 'Wont',
}
```

### Example: Tarea Entity (Unified)

```typescript
// src/modules/agile/tareas/entities/tarea.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Usuario } from '../../../auth/entities/usuario.entity';
import { HistoriaUsuario } from '../../historias-usuario/entities/historia-usuario.entity';
import { Actividad } from '../../../poi/actividades/entities/actividad.entity';
import { Subtarea } from '../../subtareas/entities/subtarea.entity';
import { TareaTipo } from '../enums/tarea-tipo.enum';
import { TareaEstado } from '../enums/tarea-estado.enum';

@Entity('tareas', { schema: 'agile' })
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  codigo: string;

  @Index()
  @Column({ type: 'varchar', length: 10 })
  tipo: TareaTipo;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Relaciones condicionales (polimorfismo)
  @Index()
  @ManyToOne(() => HistoriaUsuario, { nullable: true })
  @JoinColumn({ name: 'historia_usuario_id' })
  historiaUsuario: HistoriaUsuario;

  @Column({ name: 'historia_usuario_id', nullable: true })
  historiaUsuarioId: number;

  @Index()
  @ManyToOne(() => Actividad, { nullable: true })
  @JoinColumn({ name: 'actividad_id' })
  actividad: Actividad;

  @Column({ name: 'actividad_id', nullable: true })
  actividadId: number;

  // Subtareas (solo para KANBAN)
  @OneToMany(() => Subtarea, subtarea => subtarea.tarea)
  subtareas: Subtarea[];

  @Index()
  @Column({ type: 'varchar', length: 50, default: TareaEstado.POR_HACER })
  estado: TareaEstado;

  @Column({ length: 20, default: 'Media' })
  prioridad: string;

  @Index()
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignado_a' })
  asignadoA: Usuario;

  @Column({ name: 'asignado_a', nullable: true })
  asignadoAId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  horasEstimadas: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  horasReales: number;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaFin: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fechaCompletado: Date;

  @Column({ nullable: true })
  evidenciaUrl: string;

  // Validacion (SM/Coordinador)
  @Column({ default: false })
  validada: boolean;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'validada_por' })
  validadaPor: Usuario;

  @Column({ type: 'timestamp with time zone', nullable: true })
  validadaEn: Date;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'created_by' })
  createdBy: Usuario;
}
```

---

## 4. RRHH MODULE

### File Structure
```
src/modules/rrhh/
├── rrhh.module.ts
├── personal/
│   ├── entities/personal.entity.ts
│   ├── dto/create-personal.dto.ts
│   ├── dto/update-personal.dto.ts
│   ├── services/personal.service.ts
│   └── controllers/personal.controller.ts
├── divisiones/
│   ├── entities/division.entity.ts
│   ├── dto/create-division.dto.ts
│   ├── dto/update-division.dto.ts
│   ├── services/division.service.ts
│   └── controllers/division.controller.ts
├── habilidades/
│   ├── entities/habilidad.entity.ts
│   ├── entities/personal-habilidad.entity.ts
│   ├── dto/create-habilidad.dto.ts
│   ├── dto/asignar-habilidad.dto.ts
│   ├── services/habilidad.service.ts
│   └── controllers/habilidad.controller.ts
└── asignaciones/
    ├── entities/asignacion.entity.ts
    ├── dto/create-asignacion.dto.ts
    ├── dto/update-asignacion.dto.ts
    ├── services/asignacion.service.ts
    └── controllers/asignacion.controller.ts
```

---

## 5. NOTIFICACIONES MODULE

### File Structure
```
src/modules/notificaciones/
├── notificaciones.module.ts
├── entities/
│   ├── notificacion.entity.ts
│   └── preferencia-notificacion.entity.ts
├── dto/
│   ├── create-notificacion.dto.ts
│   └── update-preferencias.dto.ts
├── services/
│   └── notificacion.service.ts
└── controllers/
    └── notificacion.controller.ts
```

---

## 6. DASHBOARD MODULE

### File Structure
```
src/modules/dashboard/
├── dashboard.module.ts
├── dto/
│   ├── dashboard-general.dto.ts
│   ├── dashboard-proyecto.dto.ts
│   └── avance-oei.dto.ts
├── services/
│   ├── dashboard.service.ts
│   └── metricas.service.ts
└── controllers/
    └── dashboard.controller.ts
```

---

## Next Steps

### 1. Install Required Dependencies

```bash
npm install --save @nestjs/common @nestjs/core @nestjs/platform-express
npm install --save @nestjs/typeorm typeorm pg
npm install --save @nestjs/config
npm install --save @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install --save @nestjs/swagger swagger-ui-express
npm install --save @nestjs/schedule
npm install --save class-validator class-transformer
npm install --save bcrypt
npm install --save-dev @types/node @types/passport-jwt @types/passport-local @types/bcrypt
```

### 2. Create `.env` File

```env
# Application
PORT=3010
NODE_ENV=development
CORS_ORIGIN=*

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=sigp_user
DATABASE_PASSWORD=sigp_pass
DATABASE_NAME=sigp_db
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true
DATABASE_SSL=false

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=sigp:
```

### 3. Create Module Files

Use the templates above to create each remaining module. Follow this pattern for each entity:

1. Create entity based on database schema (see `04_ARQUITECTURA_BD.md`)
2. Create DTOs with proper validation decorators
3. Create service with CRUD operations + pagination
4. Create controller with all API endpoints from `05_ESPECIFICACION_APIs.md`
5. Wire everything in the module file

### 4. Key Implementation Notes

**Pagination:** All `findAll()` methods should support pagination using `PaginationDto`

**Soft Delete:** Use `activo: false` instead of actual deletion

**Audit Fields:** All entities include `created_at`, `updated_at`, `created_by`

**Role-Based Access:** Use `@Roles()` decorator on controller methods

**API Documentation:** Use Swagger decorators (`@ApiOperation`, `@ApiResponse`, etc.)

**Validation:** All DTOs use `class-validator` decorators

**Response Format:** Use `TransformInterceptor` for standard response format

---

## Summary

### ✅ Completed
- Main application structure (main.ts, app.module.ts)
- Configuration files (database, jwt, redis, app)
- Common module (guards, decorators, filters, pipes, interceptors, DTOs)
- **Auth module** (fully implemented)
- Storage module (already exists)

### 📝 To Create
Follow the templates above to create:
- **Planning module** (5 sub-modules: PGD, OEI, OGD, OEGD, Acciones Estratégicas)
- **POI module** (9 sub-modules: Proyectos, Actividades, Subproyectos, Documentos, Actas, Requerimientos, Cronogramas, Informes Sprint, Informes Actividad)
- **Agile module** (7 sub-modules: Épicas, Sprints, HUs, Tareas, Subtareas, Tablero, Backlog, Daily Meetings)
- **RRHH module** (4 sub-modules: Personal, Divisiones, Habilidades, Asignaciones)
- **Notificaciones module** (1 module with preferences)
- **Dashboard module** (1 module with metrics)

Each module follows the same structure pattern shown in the examples above.
