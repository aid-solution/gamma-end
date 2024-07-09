import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AffectationRubriqueDTO } from './affectationRubrique.dto';

export class DirectionDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @ValidateNested({ each: true })
  @Type(() => AffectationRubriqueDTO)
  rubrique: AffectationRubriqueDTO[];
}
