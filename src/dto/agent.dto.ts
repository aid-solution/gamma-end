import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AffectationDTO } from './affectation.dto';
import { ChargeDTO } from './charge.dto';
import { AgentAccountDTO } from './agentAccount.dto';

export class AgentDTO {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsString()
  @IsNotEmpty()
  dateNaissance: string;

  @IsString()
  @IsNotEmpty()
  lieuNaissance: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Masculin', 'Féminin'])
  sexe: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'])
  situationMatrimoniale: string;

  @IsOptional()
  @IsString()
  diplome: string;

  @IsString()
  @IsNotEmpty()
  pays: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  telephone: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['CDD', 'CDI'])
  contrat: string;

  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsString()
  @IsNotEmpty()
  dateEmbauche: string;

  @ValidateNested({ each: true })
  @Type(() => AffectationDTO)
  affectation: AffectationDTO;

  @IsString()
  @IsOptional()
  dureeContrat: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['CNSS', 'FNR'])
  cotisation: string;

  @IsOptional()
  @IsString()
  cotisationNumero: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Billetage', 'Chèque de paiement', 'Virement bancaire'])
  modePaiement: string;

  @ValidateNested({ each: true })
  @Type(() => AgentAccountDTO)
  agentAccount: AgentAccountDTO;

  @ValidateNested({ each: true })
  @Type(() => ChargeDTO)
  charges: ChargeDTO[];
}
