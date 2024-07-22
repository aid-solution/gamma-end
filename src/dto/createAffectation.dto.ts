import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAffectationDTO {
  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

  @IsString()
  @IsOptional()
  @IsEnum(['Avancement', 'Promotion', 'Cessation', 'Retraite'])
  statut: string;

  @IsString()
  @IsOptional()
  dateDebut: string;

  @IsString()
  @IsOptional()
  dateFin: string;

  @IsString()
  @IsNotEmpty()
  fonction: string;

  @IsString()
  @IsNotEmpty()
  grille: string;

  @IsNotEmpty()
  @IsMongoId()
  agentRubrique: Types.ObjectId;
}
