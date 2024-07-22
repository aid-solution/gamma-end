import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAgentRubriqueDTO {
  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  direction: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  montant: number;

  @IsString()
  @IsOptional()
  dateDebut: string;

  @IsString()
  @IsOptional()
  dateFin: string;
}
