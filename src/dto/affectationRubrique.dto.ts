import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AffectationRubriqueDTO {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNumber()
  @IsNotEmpty()
  montant: number;
}
