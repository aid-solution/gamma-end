import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAgentDTO {
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
}
