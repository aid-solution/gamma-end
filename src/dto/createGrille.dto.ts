import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateGrilleDTO {
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsNotEmpty()
  @IsMongoId()
  echellon: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  categorie: Types.ObjectId;

  @IsNumber()
  @IsOptional()
  plafond: number;
}
