import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserDTO {
  @IsString()
  @IsOptional()
  _id: string;

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
