import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from './agent.schema';
import { Banque } from './banque.schema';
import { HydratedDocument } from 'mongoose';

export type AgentAccountDocument = HydratedDocument<AgentAccount>;

@Schema()
export class AgentAccount {
  @Prop({
    required: true,
    trim: true,
  })
  compte: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banque',
  })
  banque: Banque;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  agent: Agent;
}

export const AgentAccountSchema = SchemaFactory.createForClass(AgentAccount);
