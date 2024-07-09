import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateServiceRubriqueDTO {
  @IsNotEmpty()
  @IsMongoId()
  rubrique: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  service: Types.ObjectId;

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
