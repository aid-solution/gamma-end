import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GrilleDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsNotEmpty()
  @IsString()
  echellon: string;

  @IsNotEmpty()
  @IsString()
  categorie: string;

  @IsString()
  @IsOptional()
  plafond: string;
}
