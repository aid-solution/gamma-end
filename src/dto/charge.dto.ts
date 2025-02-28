import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ChargeDTO {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Enfant', 'Conjoint(e)'])
  type: string;

  @IsString()
  @IsNotEmpty()
  nomPrenom: string;

  @IsString()
  @IsNotEmpty()
  dateNaissance: string;

  @IsString()
  @IsNotEmpty()
  lieuNaissance: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Masculin', 'Féminin'])
  sexe: string;

  @IsString()
  @IsOptional()
  handicap: string;

  @IsString()
  @IsOptional()
  scolarite: string;

  @IsString()
  @IsOptional()
  assujetiCNSS: string;

  @IsString()
  @IsOptional()
  dateDebut: Date;

  @IsString()
  @IsOptional()
  dateFin: Date;
}
