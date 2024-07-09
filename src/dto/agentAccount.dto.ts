import { IsNotEmpty, IsString } from 'class-validator';

export class AgentAccountDTO {
  @IsNotEmpty()
  @IsString()
  banque: string;

  @IsString()
  @IsNotEmpty()
  compte: string;
}
