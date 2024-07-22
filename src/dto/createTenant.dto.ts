import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTenantDTO {
  @IsString()
  @IsNotEmpty()
  raisonSociale: string;

  @IsString()
  @IsNotEmpty()
  nif: string;

  @IsString()
  @IsOptional()
  rccmNumero: string;

  @IsString()
  @IsNotEmpty()
  cotisationNumero: string;

  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  bp: string;

  @IsString()
  @IsOptional()
  _id: string;
}
