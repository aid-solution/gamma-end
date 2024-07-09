import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Salaire } from './salaire.schema';
import { AvancePret } from './avancePret.schema';

export type SalaireAvancePretDocument = HydratedDocument<SalaireAvancePret>;

@Schema()
export class SalaireAvancePret {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salaire',
  })
  salaire: Salaire;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AvancePret',
  })
  avancePret: AvancePret;
}

export const SalaireAvancePretSchema =
  SchemaFactory.createForClass(SalaireAvancePret);
