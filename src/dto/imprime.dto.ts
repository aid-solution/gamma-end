import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ImprimeDTO {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['CNSS', 'DAR', 'IUTS', 'SALAIRE', 'VIREMENT'])
  type: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Mensuelle', 'Trimestruelle', 'Annuelle'])
  periode: string;

  @IsString()
  @IsOptional()
  mois: string;

  @IsString()
  @IsNotEmpty()
  annee: string;
}
