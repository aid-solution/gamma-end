import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAbsenceDTO {
  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

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

  @IsString()
  @IsOptional()
  nature: string;
}
