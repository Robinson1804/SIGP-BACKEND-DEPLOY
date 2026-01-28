import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SprintService } from './sprint.service';
import { Sprint } from '../entities/sprint.entity';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { CerrarSprintDto } from '../dto/cerrar-sprint.dto';
import { SprintEstado } from '../enums/sprint.enum';

describe('SprintService', () => {
  let service: SprintService;
  let repository: jest.Mocked<Repository<Sprint>>;

  const mockSprint: Partial<Sprint> = {
    id: 1,
    proyectoId: 1,
    nombre: 'Sprint 1',
    estado: SprintEstado.ACTIVO,
    sprintGoal: 'Completar módulo de autenticación',
    fechaInicio: new Date('2024-01-15'),
    fechaFin: new Date('2024-01-29'),
    capacidadEquipo: 40,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createQueryBuilder: any = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockManager = {
    createQueryBuilder: jest.fn(() => createQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintService,
        {
          provide: getRepositoryToken(Sprint),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => createQueryBuilder),
            manager: mockManager,
          },
        },
      ],
    }).compile();

    service = module.get<SprintService>(SprintService);
    repository = module.get(getRepositoryToken(Sprint));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateSprintDto = {
      proyectoId: 1,
      nombre: 'Sprint 2',
      sprintGoal: 'Completar módulo de proyectos',
      fechaInicio: new Date('2024-02-01'),
      fechaFin: new Date('2024-02-15'),
      capacidadEquipo: 45,
    };

    it('should create a sprint successfully', async () => {
      const createdSprint = { ...mockSprint, ...createDto };
      repository.create.mockReturnValue(createdSprint as Sprint);
      repository.save.mockResolvedValue(createdSprint as Sprint);

      const result = await service.create(createDto, 1);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          proyectoId: createDto.proyectoId,
          nombre: createDto.nombre,
          createdBy: 1,
          updatedBy: 1,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create sprint without userId', async () => {
      const createdSprint = { ...mockSprint, ...createDto };
      repository.create.mockReturnValue(createdSprint as Sprint);
      repository.save.mockResolvedValue(createdSprint as Sprint);

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
    it('should return all sprints without filters', async () => {
      const sprints = [mockSprint];
      createQueryBuilder.getMany.mockResolvedValue(sprints);

      const result = await service.findAll();

      expect(result).toEqual(sprints);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by proyectoId', async () => {
      const sprints = [mockSprint];
      createQueryBuilder.getMany.mockResolvedValue(sprints);

      await service.findAll({ proyectoId: 1 });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sprint.proyectoId = :proyectoId',
        { proyectoId: 1 },
      );
    });

    it('should filter by estado', async () => {
      const sprints = [mockSprint];
      createQueryBuilder.getMany.mockResolvedValue(sprints);

      await service.findAll({ estado: SprintEstado.ACTIVO });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sprint.estado = :estado',
        { estado: SprintEstado.ACTIVO },
      );
    });

    it('should filter by activo', async () => {
      const sprints = [mockSprint];
      createQueryBuilder.getMany.mockResolvedValue(sprints);

      await service.findAll({ activo: true });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sprint.activo = :activo',
        { activo: true },
      );
    });
  });

  describe('findOne', () => {
    it('should return a sprint by id', async () => {
      repository.findOne.mockResolvedValue(mockSprint as Sprint);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSprint);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['proyecto'],
      });
    });

    it('should throw NotFoundException if sprint not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Sprint con ID 999 no encontrado',
      );
    });
  });

  describe('findByProyecto', () => {
    it('should return sprints by proyectoId', async () => {
      const sprints = [mockSprint];
      repository.find.mockResolvedValue(sprints as Sprint[]);

      const result = await service.findByProyecto(1);

      expect(result).toEqual(sprints);
      expect(repository.find).toHaveBeenCalledWith({
        where: { proyectoId: 1, activo: true },
        order: { fechaInicio: 'DESC' },
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateSprintDto = {
      nombre: 'Sprint 1 - Actualizado',
      sprintGoal: 'Nuevo objetivo',
    };

    it('should update a sprint successfully', async () => {
      repository.findOne.mockResolvedValue(mockSprint as Sprint);
      const updatedSprint = { ...mockSprint, ...updateDto };
      repository.save.mockResolvedValue(updatedSprint as Sprint);

      const result = await service.update(1, updateDto, 1);

      expect(result).toBeDefined();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if sprint not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if sprint is completed', async () => {
      const completedSprint = {
        ...mockSprint,
        estado: SprintEstado.COMPLETADO,
      };
      repository.findOne.mockResolvedValue(completedSprint as Sprint);

      await expect(service.update(1, updateDto, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, updateDto, 1)).rejects.toThrow(
        'No se puede modificar un sprint completado',
      );
    });
  });

  describe('iniciar', () => {
    it('should start a planned sprint successfully', async () => {
      const plannedSprint = {
        ...mockSprint,
        estado: SprintEstado.PLANIFICADO,
      };
      repository.findOne.mockResolvedValueOnce(plannedSprint as Sprint);
      repository.findOne.mockResolvedValueOnce(null); // No active sprint
      repository.save.mockResolvedValue({
        ...plannedSprint,
        estado: SprintEstado.ACTIVO,
        fechaInicioReal: expect.any(Date),
      } as Sprint);

      const result = await service.iniciar(1, 1);

      expect(result.estado).toBe(SprintEstado.ACTIVO);
      expect(result.fechaInicioReal).toBeDefined();
    });

    it('should throw BadRequestException if sprint is not planned', async () => {
      const activeSprint = { ...mockSprint, estado: SprintEstado.ACTIVO };
      repository.findOne.mockResolvedValue(activeSprint as Sprint);

      await expect(service.iniciar(1, 1)).rejects.toThrow(BadRequestException);
      await expect(service.iniciar(1, 1)).rejects.toThrow(
        'Solo se puede iniciar un sprint en estado Planificado',
      );
    });

    it('should throw ConflictException if another sprint is active', async () => {
      const plannedSprint = {
        ...mockSprint,
        estado: SprintEstado.PLANIFICADO,
      };
      const activeSprint = {
        id: 2,
        nombre: 'Sprint Activo',
        estado: SprintEstado.ACTIVO,
        proyectoId: 1,
      };
      // First call to findOne in iniciar (findOne by id) - returns planned sprint
      repository.findOne.mockResolvedValueOnce(plannedSprint as Sprint);
      // Second call to findOne in iniciar (check for active sprint) - returns active sprint
      repository.findOne.mockResolvedValueOnce(activeSprint as Sprint);

      await expect(service.iniciar(1, 1)).rejects.toThrow(
        `Ya existe un sprint activo (${activeSprint.nombre}) para este proyecto`,
      );
    });
  });

  describe('cerrar', () => {
    const cerrarDto: CerrarSprintDto = {
      linkEvidencia: 'https://example.com/evidencia',
    };

    it('should close an active sprint successfully', async () => {
      const activeSprint = { ...mockSprint, estado: SprintEstado.ACTIVO };
      repository.findOne.mockResolvedValue(activeSprint as Sprint);
      repository.save.mockResolvedValue({
        ...activeSprint,
        estado: SprintEstado.COMPLETADO,
        fechaFinReal: expect.any(Date),
        linkEvidencia: cerrarDto.linkEvidencia,
      } as Sprint);

      const result = await service.cerrar(1, cerrarDto, 1);

      expect(result.estado).toBe(SprintEstado.COMPLETADO);
      expect(result.fechaFinReal).toBeDefined();
      expect(result.linkEvidencia).toBe(cerrarDto.linkEvidencia);
    });

    it('should throw BadRequestException if sprint is not active', async () => {
      const plannedSprint = {
        ...mockSprint,
        estado: SprintEstado.PLANIFICADO,
      };
      repository.findOne.mockResolvedValue(plannedSprint as Sprint);

      await expect(service.cerrar(1, cerrarDto, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cerrar(1, cerrarDto, 1)).rejects.toThrow(
        'Solo se puede cerrar un sprint activo',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a sprint (set activo to false)', async () => {
      const completedSprint = {
        ...mockSprint,
        estado: SprintEstado.COMPLETADO,
      };
      repository.findOne.mockResolvedValue(completedSprint as Sprint);
      repository.save.mockResolvedValue({
        ...completedSprint,
        activo: false,
      } as Sprint);

      const result = await service.remove(1, 1);

      expect(result.activo).toBe(false);
    });

    it('should throw BadRequestException if sprint is active', async () => {
      const activeSprint = { ...mockSprint, estado: SprintEstado.ACTIVO };
      repository.findOne.mockResolvedValue(activeSprint as Sprint);

      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
      await expect(service.remove(1, 1)).rejects.toThrow(
        'No se puede eliminar un sprint activo',
      );
    });
  });

  describe('getBurndown', () => {
    it('should return burndown data for a sprint', async () => {
      repository.findOne.mockResolvedValue(mockSprint as Sprint);
      createQueryBuilder.getRawOne.mockResolvedValue({ totalSP: '40' });

      const result = await service.getBurndown(1);

      expect(result).toBeDefined();
      expect(result.sprintId).toBe(1);
      expect(result.totalStoryPoints).toBe(40);
      expect(result.dias).toBeDefined();
      expect(result.dias.length).toBeGreaterThan(0);
    });

    it('should handle sprint with no story points', async () => {
      repository.findOne.mockResolvedValue(mockSprint as Sprint);
      createQueryBuilder.getRawOne.mockResolvedValue({ totalSP: '0' });

      const result = await service.getBurndown(1);

      expect(result.totalStoryPoints).toBe(0);
    });
  });

  describe('getMetricas', () => {
    it('should return metrics for a sprint', async () => {
      repository.findOne.mockResolvedValue(mockSprint as Sprint);
      createQueryBuilder.getRawOne.mockResolvedValue({
        totalHUs: '10',
        husCompletadas: '6',
        husEnProgreso: '2',
        husPendientes: '2',
        totalSP: '40',
        spCompletados: '24',
        spEnProgreso: '8',
        spPendientes: '8',
      });

      const result = await service.getMetricas(1);

      expect(result).toBeDefined();
      expect(result.sprintId).toBe(1);
      expect(result.totalHUs).toBe(10);
      expect(result.husCompletadas).toBe(6);
      expect(result.velocidad).toBe(24);
      expect(result.porcentajeAvanceHUs).toBe(60);
      expect(result.porcentajeAvanceSP).toBe(60);
    });

    it('should handle sprint with no HUs', async () => {
      repository.findOne.mockResolvedValue(mockSprint as Sprint);
      createQueryBuilder.getRawOne.mockResolvedValue({
        totalHUs: '0',
        husCompletadas: '0',
        husEnProgreso: '0',
        husPendientes: '0',
        totalSP: '0',
        spCompletados: '0',
        spEnProgreso: '0',
        spPendientes: '0',
      });

      const result = await service.getMetricas(1);

      expect(result.totalHUs).toBe(0);
      expect(result.velocidad).toBe(0);
      expect(result.porcentajeAvanceHUs).toBe(0);
      expect(result.porcentajeAvanceSP).toBe(0);
    });
  });
});
