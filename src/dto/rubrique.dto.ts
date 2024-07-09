import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RubriqueDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsString()
  @IsNotEmpty()
  assujetiCNSS: string;

  @IsString()
  @IsNotEmpty()
  assujetiImpot: string;

  @IsString()
  @IsNotEmpty()
  entreBrut: string;

  @IsString()
  @IsNotEmpty()
  entreNet: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Gain', 'Retenue'])
  gainRetenue: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Fixe', 'Variable'])
  type: string;

  @IsString()
  @IsOptional()
  montant: string;
}
