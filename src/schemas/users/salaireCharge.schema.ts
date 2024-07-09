import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Charge } from './charge.schema';
import { Salaire } from './salaire.schema';

export type SalaireChargeDocument = HydratedDocument<SalaireCharge>;

@Schema()
export class SalaireCharge {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salaire',
  })
  salaire: Salaire;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charge',
  })
  charge: Charge;
}

export const SalaireChargeSchema = SchemaFactory.createForClass(SalaireCharge);
