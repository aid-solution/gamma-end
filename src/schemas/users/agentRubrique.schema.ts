import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from './agent.schema';
import { Rubrique } from './rubrique.schema';
import { HydratedDocument } from 'mongoose';

export type AgentRubriqueDocument = HydratedDocument<AgentRubrique>;

@Schema()
export class AgentRubrique {
  @Prop({
    required: true,
  })
  montant: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rubrique',
  })
  rubrique: Rubrique;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  agent: Agent;

  @Prop({
    default: new Date(),
  })
  dateDebut: Date;

  @Prop({
    required: false,
  })
  dateFin: Date;
}

export const AgentRubriqueSchema = SchemaFactory.createForClass(AgentRubrique);
