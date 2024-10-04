import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class ParseImprimeDTO {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['CNSS', 'DAR', 'IUTS', 'SALAIRE', 'VIREMENT'])
  type: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Mensuelle', 'Trimestruelle', 'Annuelle'])
  periode: string;

  @IsNumber()
  @IsOptional()
  mois: number;

  @IsNumber()
  @IsNotEmpty()
  annee: number;
}
