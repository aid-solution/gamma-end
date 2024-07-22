import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from './agent.schema';
import { HydratedDocument } from 'mongoose';
import { Salaire } from './salaire.schema';

export type AbsenceDocument = HydratedDocument<Absence>;

@Schema()
export class Absence {
  @Prop({
    required: true,
    trim: true,
  })
  motif: string;

  @Prop({
    required: true,
  })
  dateDebut: Date;

  @Prop({
    required: true,
  })
  dateFin: Date;

  @Prop({
    required: true,
    trim: true,
  })
  deduction: boolean;

  @Prop({
    required: true,
    trim: true,
  })
  type: string;

  @Prop({
    required: true,
    trim: true,
  })
  nature: string;

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

export const AbsenceSchema = SchemaFactory.createForClass(Absence);
