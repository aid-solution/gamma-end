import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @IsNotEmpty()
  @Length(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
