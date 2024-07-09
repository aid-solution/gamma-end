import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBanqueDTO {
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsString()
  @IsOptional()
  bp: string;

  @IsString()
  @IsOptional()
  adresse: string;
}
