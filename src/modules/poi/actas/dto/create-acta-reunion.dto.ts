import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsDateString,
  MaxLength,
  IsNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { TipoReunion, Modalidad } from '../enums/acta.enum';

export class CreateActaReunionDto {
  @IsInt()
  proyectoId: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsDateString()
  fecha: string;

  @IsEnum(TipoReunion)
  tipoReunion: TipoReunion;

  @IsNotEmpty({ message: 'La fase del proyecto es obligatoria' })
  @IsString()
  @MaxLength(100)
  fasePerteneciente: string;

  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString()
  horaInicio: string;

  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @IsString()
  horaFin: string;

  // Nuevos campos
  @IsNotEmpty({ message: 'La modalidad es obligatoria' })
  @IsEnum(Modalidad)
  modalidad: Modalidad;

  @IsOptional()
  @IsString()
  lugarLink?: string;

  @IsOptional()
  @IsInt()
  moderadorId?: number;

  @IsOptional()
  @IsDateString()
  proximaReunionFecha?: string;

  @IsNotEmpty({ message: 'Debe incluir al menos un asistente' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un asistente' })
  asistentes: {
    nombre: string;
    cargo?: string;
    organizacion?: string;
    esExterno?: boolean;
    esModerador?: boolean;
    usuarioId?: number;
  }[];

  @IsOptional()
  @IsArray()
  ausentes?: { nombre: string; cargo?: string; motivo?: string }[];

  @IsNotEmpty({ message: 'La agenda es obligatoria' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un tema en la agenda' })
  agenda: { numero: number; tema: string }[];

  @IsNotEmpty({ message: 'Los temas desarrollados son obligatorios' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un tema desarrollado' })
  temasDesarrollados: {
    tema: string;
    notas?: string;
    conclusiones?: string;
  }[];

  @IsNotEmpty({ message: 'Los acuerdos son obligatorios' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un acuerdo' })
  acuerdos: {
    descripcion: string;
    responsables?: string[];
    responsableIds?: number[];
    fechaCompromiso?: string;
    prioridad?: 'Alta' | 'Media' | 'Baja';
  }[];

  @IsOptional()
  @IsArray()
  proximosPasos?: {
    descripcion: string;
    responsable?: string;
    responsableId?: number;
    fecha?: string;
  }[];

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  anexosReferenciados?: { nombre: string; url?: string }[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  archivoUrl?: string;
}
