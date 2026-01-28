import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { Proyecto } from '../entities/proyecto.entity';
import { CreateProyectoDto } from '../dto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';
import { CambiarEstadoProyectoDto } from '../dto/cambiar-estado.dto';
import { ProyectoEstado } from '../enums/proyecto-estado.enum';

describe('ProyectoService', () => {
  let service: ProyectoService;
  let repository: jest.Mocked<Repository<Proyecto>>;

  const mockProyecto: Partial<Proyecto> = {
    id: 1,
    codigo: 'PRY001',
    nombre: 'Sistema de Gestión Integral',
    descripcion: 'Sistema web para gestionar proyectos',
    estado: ProyectoEstado.EN_DESARROLLO,
    clasificacion: 'Gestion interna',
    accionEstrategicaId: 5,
    coordinadorId: 2,
    scrumMasterId: 3,
    patrocinadorId: 4,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectoService,
        {
          provide: getRepositoryToken(Proyecto),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => createQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<ProyectoService>(ProyectoService);
    repository = module.get(getRepositoryToken(Proyecto));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateProyectoDto = {
      codigo: 'PRY002',
      nombre: 'Portal de Consultas',
      descripcion: 'Portal interactivo',
      clasificacion: 'Al ciudadano',
      accionEstrategicaId: 5,
      coordinadorId: 2,
      scrumMasterId: 3,
      patrocinadorId: 4,
      coordinacion: 'Dirección de Tecnología',
      areasFinancieras: ['1000', '2000'],
      montoAnual: 500000,
      anios: [2024, 2025],
      fechaInicio: new Date('2024-02-01'),
      fechaFin: new Date('2024-12-31'),
    };

    it('should create a proyecto successfully', async () => {
      repository.findOne.mockResolvedValue(null);
      const createdProyecto = { ...mockProyecto, ...createDto };
      repository.create.mockReturnValue(createdProyecto as Proyecto);
      repository.save.mockResolvedValue(createdProyecto as Proyecto);

      const result = await service.create(createDto, 1);

      expect(result).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { codigo: createDto.codigo },
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: createDto.codigo,
          metodoGestion: 'Scrum',
          createdBy: 1,
          updatedBy: 1,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if codigo already exists', async () => {
      repository.findOne.mockResolvedValue(mockProyecto as Proyecto);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto, 1)).rejects.toThrow(
        `Ya existe un proyecto con el código ${createDto.codigo}`,
      );
    });

    it('should throw BadRequestException if fechaFin is before fechaInicio', async () => {
      repository.findOne.mockResolvedValue(null);
      const invalidDto = {
        ...createDto,
        fechaInicio: new Date('2024-12-31'),
        fechaFin: new Date('2024-01-01'),
      };

      await expect(service.create(invalidDto, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto, 1)).rejects.toThrow(
        'La fecha de fin debe ser mayor o igual a la fecha de inicio',
      );
    });

    it('should create proyecto without userId (createdBy undefined)', async () => {
      repository.findOne.mockResolvedValue(null);
      const createdProyecto = { ...mockProyecto, ...createDto };
      repository.create.mockReturnValue(createdProyecto as Proyecto);
      repository.save.mockResolvedValue(createdProyecto as Proyecto);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: undefined,
          updatedBy: undefined,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all proyectos without filters', async () => {
      const proyectos = [mockProyecto];
      createQueryBuilder.getMany.mockResolvedValue(proyectos);

      const result = await service.findAll();

      expect(result).toEqual(proyectos);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(createQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
    });

    it('should filter by estado', async () => {
      const proyectos = [mockProyecto];
      createQueryBuilder.getMany.mockResolvedValue(proyectos);

      await service.findAll({ estado: ProyectoEstado.EN_DESARROLLO });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'proyecto.estado = :estado',
        { estado: ProyectoEstado.EN_DESARROLLO },
      );
    });

    it('should filter by coordinadorId', async () => {
      const proyectos = [mockProyecto];
      createQueryBuilder.getMany.mockResolvedValue(proyectos);

      await service.findAll({ coordinadorId: 2 });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'proyecto.coordinadorId = :coordinadorId',
        { coordinadorId: 2 },
      );
    });

    it('should filter by activo', async () => {
      const proyectos = [mockProyecto];
      createQueryBuilder.getMany.mockResolvedValue(proyectos);

      await service.findAll({ activo: true });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'proyecto.activo = :activo',
        { activo: true },
      );
    });

    it('should filter by multiple criteria', async () => {
      const proyectos = [mockProyecto];
      createQueryBuilder.getMany.mockResolvedValue(proyectos);

      await service.findAll({
        estado: ProyectoEstado.EN_DESARROLLO,
        coordinadorId: 2,
        activo: true,
      });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return a proyecto by id', async () => {
      repository.findOne.mockResolvedValue(mockProyecto as Proyecto);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProyecto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'coordinador',
          'scrumMaster',
          'patrocinador',
          'accionEstrategica',
          'subproyectos',
        ],
      });
    });

    it('should throw NotFoundException if proyecto not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Proyecto con ID 999 no encontrado',
      );
    });
  });

  describe('findByCodigo', () => {
    it('should return a proyecto by codigo', async () => {
      repository.findOne.mockResolvedValue(mockProyecto as Proyecto);

      const result = await service.findByCodigo('PRY001');

      expect(result).toEqual(mockProyecto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { codigo: 'PRY001' },
        relations: ['coordinador', 'scrumMaster', 'patrocinador'],
      });
    });

    it('should throw NotFoundException if proyecto not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByCodigo('NONEXISTENT')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByCodigo('NONEXISTENT')).rejects.toThrow(
        'Proyecto con código NONEXISTENT no encontrado',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateProyectoDto = {
      nombre: 'Sistema de Gestión Integral - v2',
      descripcion: 'Actualización de descripción',
    };

    it('should update a proyecto successfully', async () => {
      repository.findOne.mockResolvedValue(mockProyecto as Proyecto);
      const updatedProyecto = { ...mockProyecto, ...updateDto };
      repository.save.mockResolvedValue(updatedProyecto as Proyecto);

      const result = await service.update(1, updateDto, 1);

      expect(result).toBeDefined();
      expect(result.nombre).toBe(updateDto.nombre);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if proyecto not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if fechaFin is before fechaInicio', async () => {
      repository.findOne.mockResolvedValue(mockProyecto as Proyecto);
      const invalidDto = {
        fechaInicio: new Date('2024-12-31'),
        fechaFin: new Date('2024-01-01'),
      };

      await expect(service.update(1, invalidDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cambiarEstado', () => {
    it('should change estado from PENDIENTE to EN_PLANIFICACION', async () => {
      const proyecto = { ...mockProyecto, estado: ProyectoEstado.PENDIENTE };
      repository.findOne.mockResolvedValue(proyecto as Proyecto);
      repository.save.mockResolvedValue({
        ...proyecto,
        estado: ProyectoEstado.EN_PLANIFICACION,
      } as Proyecto);

      const dto: CambiarEstadoProyectoDto = {
        estado: ProyectoEstado.EN_PLANIFICACION,
      };
      const result = await service.cambiarEstado(1, dto, 1);

      expect(result.estado).toBe(ProyectoEstado.EN_PLANIFICACION);
    });

    it('should throw BadRequestException for invalid state transition', async () => {
      const proyecto = { ...mockProyecto, estado: ProyectoEstado.FINALIZADO };
      repository.findOne.mockResolvedValue(proyecto as Proyecto);

      const dto: CambiarEstadoProyectoDto = {
        estado: ProyectoEstado.EN_DESARROLLO,
      };

      await expect(service.cambiarEstado(1, dto, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cambiarEstado(1, dto, 1)).rejects.toThrow(
        'No se puede cambiar el estado de Finalizado a En desarrollo',
      );
    });

    it('should allow PENDIENTE to CANCELADO', async () => {
      const proyecto = { ...mockProyecto, estado: ProyectoEstado.PENDIENTE };
      repository.findOne.mockResolvedValue(proyecto as Proyecto);
      repository.save.mockResolvedValue({
        ...proyecto,
        estado: ProyectoEstado.CANCELADO,
      } as Proyecto);

      const dto: CambiarEstadoProyectoDto = {
        estado: ProyectoEstado.CANCELADO,
      };
      const result = await service.cambiarEstado(1, dto, 1);

      expect(result.estado).toBe(ProyectoEstado.CANCELADO);
    });
  });

  describe('remove', () => {
    it('should soft delete a proyecto (set activo to false)', async () => {
      repository.findOne.mockResolvedValue(mockProyecto as Proyecto);
      repository.save.mockResolvedValue({
        ...mockProyecto,
        activo: false,
      } as Proyecto);

      const result = await service.remove(1, 1);

      expect(result.activo).toBe(false);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if proyecto not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAccionEstrategica', () => {
    it('should return proyectos by accionEstrategicaId', async () => {
      const proyectos = [mockProyecto];
      repository.find.mockResolvedValue(proyectos as Proyecto[]);

      const result = await service.findByAccionEstrategica(5);

      expect(result).toEqual(proyectos);
      expect(repository.find).toHaveBeenCalledWith({
        where: { accionEstrategicaId: 5, activo: true },
        order: { codigo: 'ASC' },
      });
    });

    it('should return empty array if no proyectos found', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByAccionEstrategica(999);

      expect(result).toEqual([]);
    });
  });
});
