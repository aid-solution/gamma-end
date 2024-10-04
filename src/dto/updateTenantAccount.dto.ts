import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateTenantAccountDTO {
  @IsNotEmpty()
  @IsMongoId()
  _id: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  tenant: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  banque: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  compte: string;
}
