import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAgentAccountDTO {
  @IsNotEmpty()
  @IsMongoId()
  agent: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  banque: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  compte: string;
}
