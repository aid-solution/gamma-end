import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFonctionDTO {
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
