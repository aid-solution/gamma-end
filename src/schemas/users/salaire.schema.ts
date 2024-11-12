import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type SalaireDocument = HydratedDocument<Salaire>;

@Schema()
export class Salaire {
  @Prop({
    required: true,
  })
  mois: number;

  @Prop({
    required: true,
  })
  annee: number;

  @Prop({
    required: true,
    default: new Date(),
  })
  datePaie: Date;

  @Prop({
    required: true,
    default: false,
  })
  isClose: boolean;

  @Prop({
    required: true,
    default: false,
  })
  isRemunerated: boolean;
}

export const SalaireSchema = SchemaFactory.createForClass(Salaire);
