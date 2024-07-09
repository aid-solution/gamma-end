import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EchellonDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;
}
