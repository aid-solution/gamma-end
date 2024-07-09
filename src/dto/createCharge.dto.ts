import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateChargeDTO {
  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Enfant', 'Conjoint(e)'])
  type: string;

  @IsString()
  @IsNotEmpty()
  nomPrenom: string;

  @IsString()
  @IsNotEmpty()
  dateNaissance: string;

  @IsString()
  @IsNotEmpty()
  lieuNaissance: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Masculin', 'Féminin'])
  sexe: string;

  @IsBoolean()
  @IsOptional()
  handicap: string;

  @IsBoolean()
  @IsOptional()
  scolarite: string;

  @IsBoolean()
  @IsOptional()
  asujetiCnss: string;
}
