import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type AgentDocument = HydratedDocument<Agent>;

@Schema()
export class Agent {
  @Prop({
    required: true,
    trim: true,
  })
  expatrie: boolean;

  @Prop({
    required: true,
    trim: true,
  })
  nom: string;

  @Prop({
    required: true,
    trim: true,
  })
  prenom: string;

  @Prop({ required: true })
  dateNaissance: Date;

  @Prop({
    required: true,
    trim: true,
    enum: ['Masculin', 'Féminin'],
  })
  sexe: string;

  @Prop({
    required: true,
    trim: true,
  })
  pays: string;

  @Prop({
    required: true,

    trim: true,
    enum: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'],
  })
  situationMatrimoniale: string;

  @Prop({
    required: false,

    trim: true,
  })
  diplome: string;

  @Prop({
    required: false,
    trim: true,
  })
  telephone: string;

  @Prop({
    required: false,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['CDD', 'CDI'],
  })
  contrat: string;

  @Prop({
    required: false,
    trim: true,
  })
  dureeContrat: number;

  @Prop({
    required: true,
    trim: true,
  })
  matricule: string;

  @Prop({
    required: false,
  })
  dateEmbauche: Date;

  @Prop({
    required: false,
    trim: true,
  })
  lieuNaissance: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['CNSS', 'FNR'],
  })
  cotisation: string;

  @Prop({
    required: false,
    trim: true,
  })
  cotisationNumero: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['Billetage', 'Chèque de paiement', 'Virement bancaire'],
  })
  modePaiement: string;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
