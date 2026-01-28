import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pgd, PgdEstado } from '../../planning/pgd/entities/pgd.entity';
import { Oei } from '../../planning/oei/entities/oei.entity';
import { AccionEstrategica } from '../../planning/acciones-estrategicas/entities/accion-estrategica.entity';
import { Proyecto } from '../../poi/proyectos/entities/proyecto.entity';
import { Actividad } from '../../poi/actividades/entities/actividad.entity';
import {
  DashboardOeiDto,
  ObjetivoAvanceDto,
} from '../dto/dashboard-oei.dto';

@Injectable()
export class DashboardOeiService {
  constructor(
    @InjectRepository(Pgd)
    private readonly pgdRepository: Repository<Pgd>,
    @InjectRepository(Oei)
    private readonly oeiRepository: Repository<Oei>,
    @InjectRepository(AccionEstrategica)
    private readonly accionEstrategicaRepository: Repository<AccionEstrategica>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async getDashboard(): Promise<DashboardOeiDto> {
    // Obtener el PGD vigente
    const pgd = await this.pgdRepository.findOne({
      where: { estado: PgdEstado.VIGENTE, activo: true },
    });

    if (!pgd) {
      return {
        pgd: null,
        objetivos: [],
        resumen: {
          totalOei: 0,
          enMeta: 0,
          porDebajoMeta: 0,
        },
      };
    }

    // Obtener todos los OEIs del PGD
    const oeis = await this.oeiRepository.find({
      where: { pgdId: pgd.id, activo: true },
      order: { codigo: 'ASC' },
    });

    const anioActual = new Date().getFullYear();
    const objetivos: ObjetivoAvanceDto[] = [];
    let enMeta = 0;
    let porDebajoMeta = 0;

    for (const oei of oeis) {
      const avanceData = await this.calcularAvanceOei(oei, anioActual);
      objetivos.push(avanceData);

      if (avanceData.porcentajeAvance >= 100) {
        enMeta++;
      } else {
        porDebajoMeta++;
      }
    }

    return {
      pgd: {
        id: pgd.id,
        nombre: pgd.nombre,
        anioInicio: pgd.anioInicio,
        anioFin: pgd.anioFin,
      },
      objetivos,
      resumen: {
        totalOei: oeis.length,
        enMeta,
        porDebajoMeta,
      },
    };
  }

  private async calcularAvanceOei(oei: Oei, anioActual: number): Promise<ObjetivoAvanceDto> {
    // Obtener meta del año actual
    const metaAnual = oei.metasAnuales?.find((m) => m.anio === anioActual);
    const meta = metaAnual?.meta || 0;
    const logrado = metaAnual?.logrado || 0;

    // Contar proyectos y actividades vinculadas a este OEI
    // A través de OEI -> OGD -> OEGD -> AccionEstrategica
    const accionesIds = await this.getAccionesEstrategicasDeOei(oei.id);

    const proyectosVinculados = await this.proyectoRepository.count({
      where: {
        accionEstrategicaId: accionesIds.length > 0 ? accionesIds[0] : -1,
        activo: true,
      },
    });

    const actividadesVinculadas = await this.actividadRepository.count({
      where: {
        accionEstrategicaId: accionesIds.length > 0 ? accionesIds[0] : -1,
        activo: true,
      },
    });

    // Contar todas las acciones
    let totalProyectos = 0;
    let totalActividades = 0;

    for (const accionId of accionesIds) {
      const proyectos = await this.proyectoRepository.count({
        where: { accionEstrategicaId: accionId, activo: true },
      });
      const actividades = await this.actividadRepository.count({
        where: { accionEstrategicaId: accionId, activo: true },
      });
      totalProyectos += proyectos;
      totalActividades += actividades;
    }

    const porcentajeAvance = meta > 0 ? Math.round((logrado / meta) * 100) : 0;

    return {
      id: oei.id,
      codigo: oei.codigo,
      nombre: oei.nombre,
      metaAnual: meta,
      logrado,
      porcentajeAvance,
      proyectosVinculados: totalProyectos,
      actividadesVinculadas: totalActividades,
    };
  }

  private async getAccionesEstrategicasDeOei(oeiId: number): Promise<number[]> {
    // OEI está directamente relacionado con el PGD
    // Las acciones estratégicas están en OEGD que están en OGD que están en PGD
    // Simplificamos: buscamos acciones que estén vinculadas al mismo PGD del OEI

    const oei = await this.oeiRepository.findOne({ where: { id: oeiId } });
    if (!oei) return [];

    // Obtener todas las acciones estratégicas activas
    // En un modelo más complejo, habría que navegar OEI -> OGD -> OEGD -> Accion
    // Por ahora, simplificamos obteniendo acciones del mismo PGD
    const acciones = await this.accionEstrategicaRepository
      .createQueryBuilder('ae')
      .innerJoin('ae.oegd', 'oegd')
      .innerJoin('oegd.ogd', 'ogd')
      .where('ogd.pgdId = :pgdId', { pgdId: oei.pgdId })
      .andWhere('ae.activo = true')
      .select('ae.id')
      .getMany();

    return acciones.map((a) => a.id);
  }

  async getAvancePorOei(oeiId: number): Promise<number> {
    const oei = await this.oeiRepository.findOne({ where: { id: oeiId } });
    if (!oei) return 0;

    const anioActual = new Date().getFullYear();
    const metaAnual = oei.metasAnuales?.find((m) => m.anio === anioActual);

    if (!metaAnual || !metaAnual.meta) return 0;

    return Math.round(((metaAnual.logrado || 0) / metaAnual.meta) * 100);
  }
}
