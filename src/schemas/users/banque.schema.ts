import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BanqueDocument = HydratedDocument<Banque>;

@Schema()
export class Banque {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;

  @Prop({
    required: false,
    trim: true,
  })
  bp: string;

  @Prop({
    required: false,
    trim: true,
  })
  adresse: string;
}

export const BanqueSchema = SchemaFactory.createForClass(Banque);
