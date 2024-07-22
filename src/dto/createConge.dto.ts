import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateCongeDTO {
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
