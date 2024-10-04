import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class TenantAccountDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  tenant: string;

  @IsString()
  @IsNotEmpty()
  banque: string;

  @IsString()
  @IsNotEmpty()
  compte: string;
}
