import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAffectationDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  agent: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Avancement', 'Promotion', 'Cessation', 'Retraite', 'Recruitement'])
  statut: string;

  @IsString()
  @IsNotEmpty()
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
