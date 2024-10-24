import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionDTO } from './permission.dto';

export class ProfilDTO {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDTO)
  permissions: PermissionDTO[];
}
