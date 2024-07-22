import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Agent } from './agent.schema';
import { Fonction } from './fonction.schema';
import { Grille } from './grille.schema';
import { AgentRubrique } from './agentRubrique.schema';

export type AffectationDocument = HydratedDocument<Affectation>;

@Schema()
export class Affectation {
  @Prop({
    required: true,
    trim: true,
    enum: ['Avancement', 'Promotion', 'Cessation', 'Retraite', 'Recruitement'],
  })
  statut: string;

  @Prop({
    required: true,
    default: new Date(),
  })
  dateDebut: Date;

  @Prop({
    required: false,
  })
  dateFin: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  agent: Agent;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fonction',
  })
  fonction: Fonction;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grille',
    required: true,
  })
  grille: Grille;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AgentRubrique',
  })
  agentRubrique: AgentRubrique;
}

export const AffectationSchema = SchemaFactory.createForClass(Affectation);
