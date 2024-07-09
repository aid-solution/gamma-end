import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Agent } from './agent.schema';
import { Salaire } from './salaire.schema';

export type SalaireAgentDocument = HydratedDocument<SalaireAgent>;

@Schema()
export class SalaireAgent {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salaire',
  })
  salaire: Salaire;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  agent: Agent;
}

export const SalaireAgentSchema = SchemaFactory.createForClass(SalaireAgent);
