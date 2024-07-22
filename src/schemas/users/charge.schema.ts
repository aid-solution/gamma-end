import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from './agent.schema';
import { HydratedDocument } from 'mongoose';

export type ChargeDocument = HydratedDocument<Charge>;

@Schema()
export class Charge {
  @Prop({
    required: true,
    trim: true,
    enum: ['Enfant', 'Conjoint(e)'],
  })
  type: string;

  @Prop({
    required: true,
    trim: true,
  })
  nomPrenom: string;

  @Prop({
    required: true,
  })
  dateNaissance: Date;

  @Prop({
    required: true,
    trim: true,
  })
  lieuNaissance: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['Masculin', 'Féminin'],
  })
  sexe: string;

  @Prop({
    required: false,
  })
  handicap: boolean;

  @Prop({
    required: false,
  })
  scolarite: boolean;

  @Prop({
    required: false,
  })
  assujetiCNSS: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  agent: Agent;
}

export const ChargeSchema = SchemaFactory.createForClass(Charge);
