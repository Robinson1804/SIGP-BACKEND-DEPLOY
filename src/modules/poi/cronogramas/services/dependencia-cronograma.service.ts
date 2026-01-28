import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DependenciaCronograma } from '../entities/dependencia-cronograma.entity';
import { TareaCronograma } from '../entities/tarea-cronograma.entity';
import { CreateDependenciaDto } from '../dto/create-dependencia.dto';
import { TipoDependencia } from '../enums/cronograma.enum';

@Injectable()
export class DependenciaCronogramaService {
  constructor(
    @InjectRepository(DependenciaCronograma)
    private readonly dependenciaRepository: Repository<DependenciaCronograma>,
    @InjectRepository(TareaCronograma)
    private readonly tareaRepository: Repository<TareaCronograma>,
  ) {}

  async create(
    cronogramaId: number,
    createDto: CreateDependenciaDto,
  ): Promise<DependenciaCronograma> {
    // Validar que las tareas existen y pertenecen al cronograma
    const tareaOrigen = await this.tareaRepository.findOne({
      where: { id: createDto.tareaOrigenId, cronogramaId },
    });

    if (!tareaOrigen) {
      throw new NotFoundException(
        `Tarea origen con ID ${createDto.tareaOrigenId} no encontrada en el cronograma`,
      );
    }

    const tareaDestino = await this.tareaRepository.findOne({
      where: { id: createDto.tareaDestinoId, cronogramaId },
    });

    if (!tareaDestino) {
      throw new NotFoundException(
        `Tarea destino con ID ${createDto.tareaDestinoId} no encontrada en el cronograma`,
      );
    }

    // Validar que no es auto-referencia
    if (createDto.tareaOrigenId === createDto.tareaDestinoId) {
      throw new BadRequestException('Una tarea no puede depender de sí misma');
    }

    // Verificar que no existe ya esta dependencia
    const existente = await this.dependenciaRepository.findOne({
      where: {
        tareaOrigenId: createDto.tareaOrigenId,
        tareaDestinoId: createDto.tareaDestinoId,
      },
    });

    if (existente) {
      throw new BadRequestException('Esta dependencia ya existe');
    }

    // Verificar que no crea un ciclo
    const creaCiclo = await this.detectarCiclo(
      cronogramaId,
      createDto.tareaOrigenId,
      createDto.tareaDestinoId,
    );

    if (creaCiclo) {
      throw new BadRequestException(
        'Esta dependencia crearía una referencia circular',
      );
    }

    const dependencia = this.dependenciaRepository.create({
      cronogramaId,
      tareaOrigenId: createDto.tareaOrigenId,
      tareaDestinoId: createDto.tareaDestinoId,
      tipo: createDto.tipo || TipoDependencia.FS,
      lag: createDto.lag || 0,
    });

    return this.dependenciaRepository.save(dependencia);
  }

  async findByCronograma(cronogramaId: number): Promise<DependenciaCronograma[]> {
    return this.dependenciaRepository.find({
      where: { cronogramaId },
      relations: ['tareaOrigen', 'tareaDestino'],
    });
  }

  async findByTarea(tareaId: number): Promise<{
    predecesoras: DependenciaCronograma[];
    sucesoras: DependenciaCronograma[];
  }> {
    const [predecesoras, sucesoras] = await Promise.all([
      this.dependenciaRepository.find({
        where: { tareaDestinoId: tareaId },
        relations: ['tareaOrigen'],
      }),
      this.dependenciaRepository.find({
        where: { tareaOrigenId: tareaId },
        relations: ['tareaDestino'],
      }),
    ]);

    return { predecesoras, sucesoras };
  }

  async remove(id: number): Promise<void> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id },
    });

    if (!dependencia) {
      throw new NotFoundException(`Dependencia con ID ${id} no encontrada`);
    }

    await this.dependenciaRepository.remove(dependencia);
  }

  async removeByTarea(tareaId: number): Promise<void> {
    await this.dependenciaRepository.delete([
      { tareaOrigenId: tareaId },
      { tareaDestinoId: tareaId },
    ]);
  }

  /**
   * Detecta si agregar una dependencia crearía un ciclo
   * Usando DFS para detectar ciclos en el grafo de dependencias
   */
  private async detectarCiclo(
    cronogramaId: number,
    origenId: number,
    destinoId: number,
  ): Promise<boolean> {
    // Si agregar esta dependencia significa que destino -> ... -> origen existe
    // entonces hay un ciclo
    const dependencias = await this.dependenciaRepository.find({
      where: { cronogramaId },
    });

    // Construir grafo de adyacencia
    const grafo = new Map<number, number[]>();
    for (const dep of dependencias) {
      if (!grafo.has(dep.tareaOrigenId)) {
        grafo.set(dep.tareaOrigenId, []);
      }
      grafo.get(dep.tareaOrigenId)!.push(dep.tareaDestinoId);
    }

    // Agregar la nueva dependencia temporalmente
    if (!grafo.has(origenId)) {
      grafo.set(origenId, []);
    }
    grafo.get(origenId)!.push(destinoId);

    // DFS desde destino para ver si podemos llegar a origen
    const visitados = new Set<number>();
    const pila = [destinoId];

    while (pila.length > 0) {
      const actual = pila.pop()!;

      if (actual === origenId) {
        return true; // Ciclo detectado
      }

      if (visitados.has(actual)) {
        continue;
      }

      visitados.add(actual);

      const sucesores = grafo.get(actual) || [];
      for (const sucesor of sucesores) {
        pila.push(sucesor);
      }
    }

    return false;
  }
}
