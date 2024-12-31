import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateFonctionDTO {
  @IsOptional()
  @IsMongoId()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsString()
  @IsNotEmpty()
  rattache: string;

  @IsOptional()
  @IsMongoId()
  service: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  direction: Types.ObjectId;
}
