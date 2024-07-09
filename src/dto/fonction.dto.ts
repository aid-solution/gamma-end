import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AffectationRubriqueDTO } from './affectationRubrique.dto';

export class FonctionDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsString()
  @IsNotEmpty()
  rattache: string;

  @IsString()
  @IsNotEmpty()
  rattacheA: string;

  @ValidateNested({ each: true })
  @Type(() => AffectationRubriqueDTO)
  rubrique: AffectationRubriqueDTO[];
}
