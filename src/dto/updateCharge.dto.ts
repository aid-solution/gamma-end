import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateChargeDTO {
  @IsMongoId()
  _id: Types.ObjectId;

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

  @IsString()
  @IsOptional()
  handicap: string;

  @IsString()
  @IsOptional()
  scolarite: string;

  @IsString()
  @IsOptional()
  asujetiCNSS: string;

  @IsString()
  @IsOptional()
  dateDebut: Date;

  @IsString()
  @IsOptional()
  dateFin: Date;
}
