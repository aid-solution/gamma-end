import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTenantAccountDTO {
  @IsNotEmpty()
  @IsMongoId()
  tenant: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  banque: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  numero: string;
}
