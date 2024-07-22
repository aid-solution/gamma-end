import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAgentAccountDTO {
  @IsNotEmpty()
  @IsString()
  banque: string;

  @IsString()
  @IsNotEmpty()
  compte: string;
}
