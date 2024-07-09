import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Agent } from './agent.schema';
import { Salaire } from './salaire.schema';

export type CongeDocument = HydratedDocument<Conge>;

@Schema()
export class Conge {
  @Prop({
    required: true,
    trim: true,
    enum: ['Annuel', 'Maternité', 'Sans solde'],
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  agent: Agent;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salaire',
  })
  salaire: Salaire;
}

export const CongeSchema = SchemaFactory.createForClass(Conge);
