import { IsNotEmpty, IsString } from 'class-validator';

export class CreateValidationTokenDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  tenantName: string;
}
