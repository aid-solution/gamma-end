import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSalaireDTO {
  @IsNumber()
  @IsNotEmpty()
  mois: number;

  @IsNumber()
  @IsNotEmpty()
  annee: number;
}
