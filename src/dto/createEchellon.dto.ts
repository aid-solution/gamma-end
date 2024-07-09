import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEchellonDTO {
  @IsString()
  @IsNotEmpty()
  libelle: string;
}
