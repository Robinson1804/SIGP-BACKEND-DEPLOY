import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateParticipanteDto {
  @IsString()
  @IsOptional()
  queHiceAyer?: string;

  @IsString()
  @IsOptional()
  queHareHoy?: string;

  @IsString()
  @IsOptional()
  impedimentos?: string;

  @IsBoolean()
  @IsOptional()
  asistio?: boolean;
}
