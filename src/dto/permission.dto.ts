import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class PermissionDTO {
  @IsString()
  @IsNotEmpty()
  module: string;

  @IsBoolean()
  @IsNotEmpty()
  read: boolean;

  @IsBoolean()
  @IsNotEmpty()
  create: boolean;

  @IsBoolean()
  @IsNotEmpty()
  update: boolean;
}
