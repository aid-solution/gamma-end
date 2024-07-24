import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from './agent.schema';
import { HydratedDocument } from 'mongoose';
import { AgentRubrique } from './agentRubrique.schema';

export type AvancePretDocument = HydratedDocument<AvancePret>;

@Schema()
export class AvancePret {
  @Prop({
    required: true,
    trim: true,
    enum: ['Avance', 'Pret'],
  })
  type: string;

  @Prop({
    required: true,
  })
  dateDebut: Date;

  @Prop({
    required: true,
  })
  dateFin: Date;

  @Prop({
    required: false,
  })
  echeance: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AgentRubrique' })
  agentRubrique: AgentRubrique;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' })
  agent: Agent;
}

export const AvancePretSchema = SchemaFactory.createForClass(AvancePret);
