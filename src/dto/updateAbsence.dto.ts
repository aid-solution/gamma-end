import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateAbsenceDTO {
  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  motif: string;

  @IsString()
  @IsNotEmpty()
  dateDebut: string;

  @IsString()
  @IsNotEmpty()
  dateFin: string;

  @IsBoolean()
  @IsNotEmpty()
  deduction: boolean;

  @IsString()
  @IsOptional()
  @IsEnum(['Exceptionnelle', 'Non Exceptionnelle'])
  type: string;
}
