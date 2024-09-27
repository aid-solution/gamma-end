import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAvancePretDTO {
  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Avance', 'Pret'])
  type: string;

  @IsString()
  @IsMongoId()
  rubrique: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  montant: number;

  @IsString()
  @IsNotEmpty()
  dateDebut: Date;

  @IsString()
  @IsNotEmpty()
  dateFin: Date;

  @IsNumber()
  @IsOptional()
  dureeEcheance: number;

  @IsNumber()
  @IsOptional()
  montantEcheance: number;
}
