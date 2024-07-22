import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CongeDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  agent: string;

  @IsString()
  @IsNotEmpty()
  dateDebut: string;

  @IsString()
  @IsNotEmpty()
  dateFin: string;

  @IsString()
  @IsEnum(['Annuel', 'Maternité', 'Sans solde'])
  type: string;
}
