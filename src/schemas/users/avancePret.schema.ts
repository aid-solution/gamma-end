import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from './agent.schema';
import { HydratedDocument } from 'mongoose';
import { Rubrique } from './rubrique.schema';

export type AvancePretDocument = HydratedDocument<AvancePret>;

@Schema()
export class AvancePret {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' })
  agent: Agent;

  @Prop({
    required: true,
    trim: true,
    enum: ['Avance', 'Pret'],
  })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Rubrique' })
  rubrique: Rubrique;

  @Prop({
    required: true,
  })
  montant: number;

  @Prop({
    required: true,
  })
  dateDebut: Date;

  @Prop({
    required: false,
  })
  dureeEcheance: number;

  @Prop({
    required: false,
  })
  montantEcheance: number;
}

export const AvancePretSchema = SchemaFactory.createForClass(AvancePret);
