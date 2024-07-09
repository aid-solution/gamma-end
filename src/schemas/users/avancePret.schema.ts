import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from './agent.schema';
import { HydratedDocument } from 'mongoose';

export type AvancePretDocument = HydratedDocument<AvancePret>;

@Schema()
export class AvancePret {
  @Prop({
    required: true,
    trim: true,
    enum: ['Avance', 'Prêt'],
  })
  type: string;

  @Prop({
    required: false,
  })
  dateDebut: Date;

  @Prop({
    required: false,
  })
  dateFin: Date;

  @Prop({
    required: true,
  })
  deduction: boolean;

  @Prop({
    required: true,
  })
  montant: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' })
  agent: Agent;
}

export const AvancePretSchema = SchemaFactory.createForClass(AvancePret);
