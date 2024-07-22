import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AffectationRubriqueDTO } from './affectationRubrique.dto';

export class AffectationRubriqueAgentDTO {
  @IsString()
  @IsNotEmpty()
  agent: string;

  @ValidateNested({ each: true })
  @Type(() => AffectationRubriqueDTO)
  rubrique: AffectationRubriqueDTO[];
}
