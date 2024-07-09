import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Salaire } from './salaire.schema';
import { AgentRubrique } from './agentRubrique.schema';

export type SalaireRubriqueDocument = HydratedDocument<SalaireRubrique>;

@Schema()
export class SalaireRubrique {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salaire',
  })
  salaire: Salaire;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentRubrique',
  })
  rubrique: AgentRubrique;
}

export const SalaireRubriqueSchema =
  SchemaFactory.createForClass(SalaireRubrique);
