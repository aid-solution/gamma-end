import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectionDTO {
  @IsString()
  @IsNotEmpty()
  libelle: string;
}
