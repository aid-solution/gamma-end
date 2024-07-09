import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategorieDTO {
  @IsString()
  @IsNotEmpty()
  libelle: string;
}
