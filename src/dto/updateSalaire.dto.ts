import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateSalaireDTO {
  @IsNotEmpty()
  @IsMongoId()
  _id: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  mois: number;

  @IsNotEmpty()
  @IsNumber()
  annee: number;

  @IsString()
  @IsDate()
  datePaie: Date;

  @IsString()
  @IsBoolean()
  isClose: boolean;

  @IsString()
  @IsBoolean()
  isRemunerated: boolean;
}
