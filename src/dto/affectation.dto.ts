import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AffectationDTO {
  @IsString()
  @IsOptional()
  @IsEnum(['Avancement', 'Promotion', 'Cessation', 'Retraite', 'Recrutement'])
  statut: string;

  @IsString()
  @IsOptional()
  dateDebut: string;

  @IsString()
  @IsOptional()
  dateFin: string;

  @IsString()
  @IsNotEmpty()
  fonction: string;

  @IsString()
  @IsNotEmpty()
  grille: string;

  @IsString()
  @IsOptional()
  salaire: string;

  @IsString()
  @IsOptional()
  dureeContrat: string;
}
