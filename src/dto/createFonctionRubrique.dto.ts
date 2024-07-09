import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateFonctionRubriqueDTO {
  @IsNotEmpty()
  @IsMongoId()
  rubrique: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  fonction: Types.ObjectId;

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
