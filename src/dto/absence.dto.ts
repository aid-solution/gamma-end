import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AbsenceDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Oui', 'Non'])
  deduction: string;

  @IsString()
  @IsNotEmpty()
  agent: string;

  @IsString()
  @IsNotEmpty()
  motif: string;

  @IsString()
  @IsNotEmpty()
  dateDebut: string;

  @IsString()
  @IsNotEmpty()
  dateFin: string;

  @IsString()
  @IsEnum(['Exceptionnelle', 'Non Exceptionnelle'])
  type: string;
}
