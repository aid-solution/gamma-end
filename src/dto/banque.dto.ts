import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BanqueDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsOptional()
  @IsString()
  bp: string;

  @IsOptional()
  @IsString()
  adresse: string;
}
