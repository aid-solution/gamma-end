import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AvancePretDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  agent: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Avance', 'Pret'])
  type: string;

  @IsString()
  @IsNotEmpty()
  rubrique: string;

  @IsString()
  @IsNotEmpty()
  montant: string;

  @IsString()
  @IsNotEmpty()
  dateDebut: string;

  @IsString()
  @IsOptional()
  dureeEcheance: string;

  @IsString()
  @IsOptional()
  montantEcheance: string;
}
