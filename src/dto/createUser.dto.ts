import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsString()
  login: string;

  @IsString()
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  agent: string;

  @IsString()
  @IsNotEmpty()
  profil: string;
}
