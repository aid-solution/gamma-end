import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateServiceDTO {
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsNotEmpty()
  @IsMongoId()
  direction: Types.ObjectId;
}
