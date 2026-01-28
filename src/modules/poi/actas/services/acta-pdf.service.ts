import { Injectable } from '@nestjs/common';
import { Acta } from '../entities/acta.entity';
import { ActaTipo } from '../enums/acta.enum';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PdfPrinter = require('pdfmake/src/printer');

// Tipos básicos de pdfmake
type Content = any;
type TDocumentDefinitions = any;

// Usar fuentes estándar de PDF (no necesitan archivos externos)
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

@Injectable()
export class ActaPdfService {
  private printer: any;

  constructor() {
    this.printer = new PdfPrinter(fonts);
  }

  async generatePdf(acta: Acta, proyecto: { codigo: string; nombre: string }): Promise<Buffer> {
    if (acta.tipo === ActaTipo.CONSTITUCION) {
      return this.generateActaConstitucionPdf(acta, proyecto);
    } else if (acta.tipo === ActaTipo.DAILY_MEETING) {
      return this.generateActaDailyPdf(acta, proyecto);
    } else {
      return this.generateActaReunionPdf(acta, proyecto);
    }
  }

  private async generateActaConstitucionPdf(
    acta: Acta,
    proyecto: { codigo: string; nombre: string },
  ): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Encabezado
        {
          columns: [
            {
              text: 'INEI',
              style: 'headerLogo',
              width: 60,
            },
            {
              stack: [
                { text: 'ACTA DE CONSTITUCIÓN DEL PROYECTO', style: 'header' },
                { text: `Proyecto: ${proyecto.codigo} - ${proyecto.nombre}`, style: 'subheader' },
                {
                  text: `Fecha: ${this.formatDate(acta.fecha)}`,
                  style: 'subheader',
                },
              ],
              width: '*',
              alignment: 'center',
            },
            { text: '', width: 60 },
          ],
          margin: [0, 0, 0, 20],
        },
        // Línea separadora
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#004272' }],
          margin: [0, 0, 0, 20],
        },

        // 1. Objetivo del Proyecto
        this.createSection('1. OBJETIVO DEL PROYECTO', acta.objetivoSmart || 'No definido'),

        // 2. Justificación
        this.createSection('2. JUSTIFICACIÓN', acta.justificacion || 'No definida'),

        // 3. Alcance
        this.createListSection('3. ALCANCE', this.parseArrayField(acta.alcance)),

        // 4. Fuera de Alcance
        this.createListSection('4. FUERA DE ALCANCE', this.parseArrayField(acta.fueraDeAlcance)),

        // 5. Entregables Principales
        this.createEntregablesTable(acta.entregables),

        // 6. Supuestos
        this.createListSection('6. SUPUESTOS', acta.supuestos || []),

        // 7. Restricciones
        this.createListSection('7. RESTRICCIONES', acta.restricciones || []),

        // 8. Riesgos Identificados
        this.createRiesgosTable(acta.riesgos),

        // 9. Presupuesto Estimado
        this.createSection(
          '9. PRESUPUESTO ESTIMADO',
          acta.presupuestoEstimado
            ? `S/ ${Number(acta.presupuestoEstimado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
            : 'No definido',
        ),

        // 10. Cronograma de Alto Nivel
        this.createCronogramaTable(acta.cronogramaHitos),

        // 11. Equipo del Proyecto
        this.createEquipoTable(acta.equipoProyecto),

        // Sección de firmas
        { text: '', pageBreak: 'after' },
        this.createFirmasSection(),
      ],
      styles: {
        headerLogo: {
          fontSize: 18,
          bold: true,
          color: '#004272',
        },
        header: {
          fontSize: 16,
          bold: true,
          color: '#004272',
          margin: [0, 0, 0, 5],
        },
        subheader: {
          fontSize: 11,
          color: '#333333',
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#004272',
          margin: [0, 15, 0, 8],
        },
        sectionContent: {
          fontSize: 10,
          lineHeight: 1.3,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#004272',
        },
        tableCell: {
          fontSize: 9,
        },
        firmaLabel: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
        },
        firmaLinea: {
          margin: [0, 40, 0, 5],
        },
      },
      defaultStyle: {
        font: 'Helvetica',
      },
    };

    return this.createPdfBuffer(docDefinition);
  }

  private async generateActaReunionPdf(
    acta: Acta,
    proyecto: { codigo: string; nombre: string },
  ): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Encabezado
        {
          columns: [
            {
              text: 'INEI',
              style: 'headerLogo',
              width: 60,
            },
            {
              stack: [
                { text: 'ACTA DE REUNIÓN', style: 'header' },
                { text: `N° ${acta.codigo}`, style: 'subheader' },
                { text: `Proyecto: ${proyecto.codigo} - ${proyecto.nombre}`, style: 'subheader' },
              ],
              width: '*',
              alignment: 'center',
            },
            { text: '', width: 60 },
          ],
          margin: [0, 0, 0, 20],
        },
        // Línea separadora
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#004272' }],
          margin: [0, 0, 0, 15],
        },

        // Datos de la reunión
        this.createDatosReunionSection(acta),

        // Asistentes
        this.createAsistentesSection(acta.asistentes, acta.ausentes),

        // Agenda
        this.createAgendaSection(acta.agenda),

        // Desarrollo de Temas
        this.createTemasSection(acta.temasDesarrollados),

        // Acuerdos y Compromisos
        this.createAcuerdosTable(acta.acuerdos),

        // Próximos Pasos
        this.createProximosPasosSection(acta.proximosPasos),

        // Observaciones
        acta.observaciones
          ? this.createSection('OBSERVACIONES', acta.observaciones)
          : { text: '' },

        // Próxima reunión
        acta.proximaReunionFecha
          ? this.createSection('PRÓXIMA REUNIÓN', this.formatDate(acta.proximaReunionFecha))
          : { text: '' },

        // Sección de firmas
        { text: '', margin: [0, 30, 0, 0] },
        this.createFirmasReunionSection(),
      ],
      styles: {
        headerLogo: {
          fontSize: 18,
          bold: true,
          color: '#004272',
        },
        header: {
          fontSize: 16,
          bold: true,
          color: '#004272',
          margin: [0, 0, 0, 5],
        },
        subheader: {
          fontSize: 11,
          color: '#333333',
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#004272',
          margin: [0, 15, 0, 8],
        },
        sectionContent: {
          fontSize: 10,
          lineHeight: 1.3,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#004272',
        },
        tableCell: {
          fontSize: 9,
        },
        label: {
          fontSize: 10,
          bold: true,
          color: '#004272',
        },
        value: {
          fontSize: 10,
        },
        firmaLabel: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
        },
      },
      defaultStyle: {
        font: 'Helvetica',
      },
    };

    return this.createPdfBuffer(docDefinition);
  }

  private async generateActaDailyPdf(
    acta: Acta,
    proyecto: { codigo: string; nombre: string },
  ): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Encabezado
        {
          columns: [
            {
              text: 'INEI',
              style: 'headerLogo',
              width: 60,
            },
            {
              stack: [
                { text: 'ACTA DE DAILY MEETING', style: 'header' },
                { text: `N° ${acta.codigo}`, style: 'subheader' },
                { text: `Proyecto: ${proyecto.codigo} - ${proyecto.nombre}`, style: 'subheader' },
              ],
              width: '*',
              alignment: 'center',
            },
            { text: '', width: 60 },
          ],
          margin: [0, 0, 0, 20],
        },
        // Línea separadora
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#004272' }],
          margin: [0, 0, 0, 15],
        },

        // Datos del Daily Meeting
        this.createDatosDailySection(acta),

        // Participantes con sus respuestas
        this.createParticipantesDailySection(acta.participantesDaily),

        // Impedimentos Generales
        this.createImpedimentosGeneralesSection(acta.impedimentosGenerales),

        // Notas Adicionales
        acta.notasAdicionales
          ? this.createSection('NOTAS ADICIONALES', acta.notasAdicionales)
          : { text: '' },

        // Observaciones
        acta.observaciones
          ? this.createSection('OBSERVACIONES', acta.observaciones)
          : { text: '' },

        // Sección de firmas
        { text: '', margin: [0, 30, 0, 0] },
        this.createFirmasDailySection(),
      ],
      styles: {
        headerLogo: {
          fontSize: 18,
          bold: true,
          color: '#004272',
        },
        header: {
          fontSize: 16,
          bold: true,
          color: '#004272',
          margin: [0, 0, 0, 5],
        },
        subheader: {
          fontSize: 11,
          color: '#333333',
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#004272',
          margin: [0, 15, 0, 8],
        },
        sectionContent: {
          fontSize: 10,
          lineHeight: 1.3,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#004272',
        },
        tableCell: {
          fontSize: 9,
        },
        label: {
          fontSize: 10,
          bold: true,
          color: '#004272',
        },
        value: {
          fontSize: 10,
        },
        firmaLabel: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
        },
        participantName: {
          fontSize: 10,
          bold: true,
          color: '#004272',
          margin: [0, 10, 0, 5],
        },
      },
      defaultStyle: {
        font: 'Helvetica',
      },
    };

    return this.createPdfBuffer(docDefinition);
  }

  private createDatosDailySection(acta: Acta): Content {
    const duracion = acta.duracionMinutos ? `${acta.duracionMinutos} minutos` : '';

    return {
      table: {
        widths: [100, '*', 100, '*'],
        body: [
          [
            { text: 'Fecha:', style: 'label' },
            { text: this.formatDate(acta.fecha), style: 'value' },
            { text: 'Hora:', style: 'label' },
            { text: `${acta.horaInicio || ''} - ${acta.horaFin || ''}`, style: 'value' },
          ],
          [
            { text: 'Sprint:', style: 'label' },
            { text: acta.sprintNombre || 'No especificado', style: 'value' },
            { text: 'Duración:', style: 'label' },
            { text: duracion || 'No especificada', style: 'value' },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 15],
    };
  }

  private createParticipantesDailySection(participantes: any[]): Content {
    if (!participantes || participantes.length === 0) {
      return this.createSection('PARTICIPANTES', 'No hay participantes registrados');
    }

    const content: Content[] = [{ text: 'PARTICIPANTES Y RESPUESTAS SCRUM', style: 'sectionTitle' }];

    // Tabla con las 3 preguntas para cada participante
    const tableBody = [
      [
        { text: 'Participante', style: 'tableHeader' },
        { text: '¿Qué hizo ayer?', style: 'tableHeader' },
        { text: '¿Qué hará hoy?', style: 'tableHeader' },
        { text: 'Impedimentos', style: 'tableHeader' },
      ],
      ...participantes.map((p) => [
        {
          stack: [
            { text: p.nombre || '', style: 'tableCell', bold: true },
            p.cargo ? { text: p.cargo, style: 'tableCell', fontSize: 8, italics: true } : { text: '' },
          ],
        },
        { text: p.ayer || 'Sin información', style: 'tableCell' },
        { text: p.hoy || 'Sin información', style: 'tableCell' },
        { text: p.impedimentos || 'Ninguno', style: 'tableCell' },
      ]),
    ];

    content.push({
      table: {
        headerRows: 1,
        widths: [90, '*', '*', '*'],
        body: tableBody,
      },
      layout: {
        hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
        vLineWidth: () => 0.5,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
        paddingTop: () => 6,
        paddingBottom: () => 6,
        paddingLeft: () => 4,
        paddingRight: () => 4,
      },
      margin: [0, 0, 0, 15],
    } as Content);

    return { stack: content };
  }

  private createImpedimentosGeneralesSection(impedimentos: string[]): Content {
    if (!impedimentos || impedimentos.length === 0) {
      return { text: '' };
    }

    return {
      stack: [
        { text: 'IMPEDIMENTOS GENERALES DEL EQUIPO', style: 'sectionTitle' },
        {
          ul: impedimentos.map((imp) => ({
            text: imp,
            fontSize: 10,
            margin: [0, 2, 0, 2],
          })),
          margin: [15, 0, 0, 10],
        },
      ],
    };
  }

  private createFirmasDailySection(): Content {
    return {
      columns: [
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
            { text: 'Scrum Master', style: 'firmaLabel', margin: [0, 5, 0, 0] },
          ],
          width: '*',
          alignment: 'center',
        },
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
            { text: 'Product Owner', style: 'firmaLabel', margin: [0, 5, 0, 0] },
          ],
          width: '*',
          alignment: 'center',
        },
      ],
    };
  }

  private createSection(title: string, content: string): Content {
    return {
      stack: [
        { text: title, style: 'sectionTitle' },
        { text: content, style: 'sectionContent' },
      ],
    };
  }

  private createListSection(title: string, items: string[]): Content {
    if (!items || items.length === 0) {
      return this.createSection(title, 'No definido');
    }

    return {
      stack: [
        { text: title, style: 'sectionTitle' },
        {
          ul: items.map((item) => ({ text: item, fontSize: 10 })),
          margin: [15, 0, 0, 10],
        },
      ],
    };
  }

  private createEntregablesTable(entregables: any[]): Content {
    if (!entregables || entregables.length === 0) {
      return this.createSection('5. ENTREGABLES PRINCIPALES', 'No definidos');
    }

    return {
      stack: [
        { text: '5. ENTREGABLES PRINCIPALES', style: 'sectionTitle' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 80],
            body: [
              [
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Fecha Est.', style: 'tableHeader' },
              ],
              ...entregables.map((e) => [
                { text: e.nombre || '', style: 'tableCell' },
                { text: e.descripcion || '', style: 'tableCell' },
                { text: e.fechaEstimada ? this.formatDate(e.fechaEstimada) : '', style: 'tableCell' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ],
    };
  }

  private createRiesgosTable(riesgos: any[]): Content {
    if (!riesgos || riesgos.length === 0) {
      return this.createSection('8. RIESGOS IDENTIFICADOS', 'No definidos');
    }

    return {
      stack: [
        { text: '8. RIESGOS IDENTIFICADOS', style: 'sectionTitle' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 60, 60, '*'],
            body: [
              [
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Prob.', style: 'tableHeader' },
                { text: 'Impacto', style: 'tableHeader' },
                { text: 'Mitigación', style: 'tableHeader' },
              ],
              ...riesgos.map((r) => [
                { text: r.descripcion || '', style: 'tableCell' },
                { text: r.probabilidad || '', style: 'tableCell' },
                { text: r.impacto || '', style: 'tableCell' },
                { text: r.mitigacion || '', style: 'tableCell' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ],
    };
  }

  private createCronogramaTable(hitos: any[]): Content {
    if (!hitos || hitos.length === 0) {
      return this.createSection('10. CRONOGRAMA DE ALTO NIVEL', 'No definido');
    }

    return {
      stack: [
        { text: '10. CRONOGRAMA DE ALTO NIVEL', style: 'sectionTitle' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, '*'],
            body: [
              [
                { text: 'Hito', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
              ],
              ...hitos.map((h) => [
                { text: h.nombre || '', style: 'tableCell' },
                { text: h.fechaEstimada ? this.formatDate(h.fechaEstimada) : '', style: 'tableCell' },
                { text: h.descripcion || '', style: 'tableCell' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ],
    };
  }

  private createEquipoTable(equipo: any[]): Content {
    if (!equipo || equipo.length === 0) {
      return this.createSection('11. EQUIPO DEL PROYECTO', 'No definido');
    }

    return {
      stack: [
        { text: '11. EQUIPO DEL PROYECTO', style: 'sectionTitle' },
        {
          table: {
            headerRows: 1,
            widths: [100, '*', '*'],
            body: [
              [
                { text: 'Rol', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Responsabilidad', style: 'tableHeader' },
              ],
              ...equipo.map((e) => [
                { text: e.rol || '', style: 'tableCell' },
                { text: e.nombre || '', style: 'tableCell' },
                { text: e.responsabilidad || '', style: 'tableCell' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ],
    };
  }

  private createFirmasSection(): Content {
    return {
      stack: [
        { text: 'FIRMAS DE APROBACIÓN', style: 'sectionTitle', alignment: 'center', margin: [0, 20, 0, 40] },
        {
          columns: [
            {
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                { text: 'Scrum Master', style: 'firmaLabel', margin: [0, 5, 0, 0] },
                { text: 'Nombre: _________________', fontSize: 9, margin: [0, 10, 0, 0] },
                { text: 'Fecha: _________________', fontSize: 9, margin: [0, 5, 0, 0] },
              ],
              width: '*',
              alignment: 'center',
            },
            {
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                { text: 'Coordinador', style: 'firmaLabel', margin: [0, 5, 0, 0] },
                { text: 'Nombre: _________________', fontSize: 9, margin: [0, 10, 0, 0] },
                { text: 'Fecha: _________________', fontSize: 9, margin: [0, 5, 0, 0] },
              ],
              width: '*',
              alignment: 'center',
            },
          ],
          margin: [0, 0, 0, 40],
        },
        {
          columns: [
            { text: '', width: '*' },
            {
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                { text: 'Patrocinador', style: 'firmaLabel', margin: [0, 5, 0, 0] },
                { text: 'Nombre: _________________', fontSize: 9, margin: [0, 10, 0, 0] },
                { text: 'Fecha: _________________', fontSize: 9, margin: [0, 5, 0, 0] },
              ],
              width: 180,
              alignment: 'center',
            },
            { text: '', width: '*' },
          ],
        },
      ],
    };
  }

  private createDatosReunionSection(acta: Acta): Content {
    return {
      table: {
        widths: [100, '*', 100, '*'],
        body: [
          [
            { text: 'Fecha:', style: 'label' },
            { text: this.formatDate(acta.fecha), style: 'value' },
            { text: 'Hora:', style: 'label' },
            { text: `${acta.horaInicio || ''} - ${acta.horaFin || ''}`, style: 'value' },
          ],
          [
            { text: 'Tipo:', style: 'label' },
            { text: acta.tipoReunion || '', style: 'value' },
            { text: 'Modalidad:', style: 'label' },
            { text: acta.modalidad || '', style: 'value' },
          ],
          [
            { text: 'Fase:', style: 'label' },
            { text: acta.fasePerteneciente || '', style: 'value' },
            { text: 'Lugar/Link:', style: 'label' },
            { text: acta.lugarLink || '', style: 'value' },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 15],
    };
  }

  private createAsistentesSection(asistentes: any[], ausentes: any[]): Content {
    const content: Content[] = [{ text: 'PARTICIPANTES', style: 'sectionTitle' }];

    if (asistentes && asistentes.length > 0) {
      content.push({
        text: 'Asistentes:',
        bold: true,
        fontSize: 10,
        margin: [0, 5, 0, 5],
      } as Content);
      content.push({
        table: {
          headerRows: 1,
          widths: ['*', '*', 60],
          body: [
            [
              { text: 'Nombre', style: 'tableHeader' },
              { text: 'Cargo', style: 'tableHeader' },
              { text: 'Tipo', style: 'tableHeader' },
            ],
            ...asistentes.map((a) => [
              { text: a.nombre || '', style: 'tableCell' },
              { text: a.cargo || '', style: 'tableCell' },
              { text: a.esExterno ? 'Externo' : 'Interno', style: 'tableCell' },
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      } as Content);
    }

    if (ausentes && ausentes.length > 0) {
      content.push({
        text: 'Ausentes:',
        bold: true,
        fontSize: 10,
        margin: [0, 5, 0, 5],
      } as Content);
      content.push({
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [
              { text: 'Nombre', style: 'tableHeader' },
              { text: 'Motivo', style: 'tableHeader' },
            ],
            ...ausentes.map((a) => [
              { text: a.nombre || '', style: 'tableCell' },
              { text: a.motivo || '', style: 'tableCell' },
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      } as Content);
    }

    return { stack: content };
  }

  private createAgendaSection(agenda: any[]): Content {
    if (!agenda || agenda.length === 0) {
      return { text: '' };
    }

    return {
      stack: [
        { text: 'AGENDA', style: 'sectionTitle' },
        {
          ol: agenda.map((item) => ({
            text: item.tema || '',
            fontSize: 10,
            margin: [0, 2, 0, 2],
          })),
          margin: [15, 0, 0, 10],
        },
      ],
    };
  }

  private createTemasSection(temas: any[]): Content {
    if (!temas || temas.length === 0) {
      return { text: '' };
    }

    return {
      stack: [
        { text: 'DESARROLLO DE TEMAS', style: 'sectionTitle' },
        ...temas.map((tema, index) => ({
          stack: [
            { text: `${index + 1}. ${tema.tema || ''}`, bold: true, fontSize: 10, margin: [0, 8, 0, 4] },
            tema.notas ? { text: tema.notas, fontSize: 9, margin: [10, 0, 0, 4] } : { text: '' },
            tema.conclusiones
              ? {
                  text: `Conclusión: ${tema.conclusiones}`,
                  fontSize: 9,
                  italics: true,
                  margin: [10, 0, 0, 4],
                }
              : { text: '' },
          ],
        })),
      ],
      margin: [0, 0, 0, 10],
    };
  }

  private createAcuerdosTable(acuerdos: any[]): Content {
    if (!acuerdos || acuerdos.length === 0) {
      return { text: '' };
    }

    return {
      stack: [
        { text: 'ACUERDOS Y COMPROMISOS', style: 'sectionTitle' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 100, 70, 50],
            body: [
              [
                { text: 'Acuerdo', style: 'tableHeader' },
                { text: 'Responsable', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Prioridad', style: 'tableHeader' },
              ],
              ...acuerdos.map((a) => [
                { text: a.descripcion || '', style: 'tableCell' },
                {
                  text: a.responsables?.join(', ') || a.responsable || '',
                  style: 'tableCell',
                },
                { text: a.fechaCompromiso ? this.formatDate(a.fechaCompromiso) : '', style: 'tableCell' },
                { text: a.prioridad || '', style: 'tableCell' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ],
    };
  }

  private createProximosPasosSection(pasos: any[]): Content {
    if (!pasos || pasos.length === 0) {
      return { text: '' };
    }

    return {
      stack: [
        { text: 'PRÓXIMOS PASOS', style: 'sectionTitle' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 120, 80],
            body: [
              [
                { text: 'Acción', style: 'tableHeader' },
                { text: 'Responsable', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
              ],
              ...pasos.map((p) => [
                { text: p.descripcion || '', style: 'tableCell' },
                { text: p.responsable || '', style: 'tableCell' },
                { text: p.fecha ? this.formatDate(p.fecha) : '', style: 'tableCell' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ],
    };
  }

  private createFirmasReunionSection(): Content {
    return {
      columns: [
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
            { text: 'Moderador', style: 'firmaLabel', margin: [0, 5, 0, 0] },
          ],
          width: '*',
          alignment: 'center',
        },
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
            { text: 'Secretario', style: 'firmaLabel', margin: [0, 5, 0, 0] },
          ],
          width: '*',
          alignment: 'center',
        },
      ],
    };
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private parseArrayField(field: any): string[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [field];
      } catch {
        return field.split('\n').filter((s: string) => s.trim());
      }
    }
    return [];
  }

  private createPdfBuffer(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
          const result = Buffer.concat(chunks);
          resolve(result);
        });

        pdfDoc.on('error', (err: Error) => {
          reject(err);
        });

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
