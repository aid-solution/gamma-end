import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionDTO } from './permission.dto';

export class CreateProfilDTO {
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDTO)
  permissions: PermissionDTO[];
}
