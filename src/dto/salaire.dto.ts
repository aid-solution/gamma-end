import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SalaireDTO {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Globale', 'Individuelle'])
  paie: string;

  @IsString()
  @IsOptional()
  matricule: string;

  @IsString()
  @IsOptional()
  service: string;

  @IsString()
  @IsNotEmpty()
  mois: string;

  @IsString()
  @IsNotEmpty()
  annee: string;
}
