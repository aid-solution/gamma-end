import {
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRubriqueDTO {
  @IsNumber()
  @IsNotEmpty()
  code: number;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsBoolean()
  @IsNotEmpty()
  assujetiCNSS: boolean;

  @IsBoolean()
  @IsNotEmpty()
  assujetiImpot: boolean;

  @IsBoolean()
  @IsNotEmpty()
  entreBrut: boolean;

  @IsBoolean()
  @IsNotEmpty()
  entreNet: boolean;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Gain', 'Retenue'])
  gainRetenue: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Fixe', 'Variable'])
  type: string;

  @IsNumber()
  @IsOptional()
  montant: number;
}
