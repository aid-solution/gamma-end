import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AffectationDTO {
  @IsString()
  @IsOptional()
  @IsEnum(['Avancement', 'Promotion', 'Cessation', 'Retraite', 'Recruitement'])
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
  @IsNotEmpty()
  salaire: string;
}
