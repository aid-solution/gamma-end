import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateAgentRubriqueDTO {
  @IsNotEmpty()
  @IsMongoId()
  _id: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  rubrique: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  montant: number;

  @IsString()
  @IsOptional()
  dateDebut: Date;

  @IsString()
  @IsOptional()
  dateFin: Date;
}
