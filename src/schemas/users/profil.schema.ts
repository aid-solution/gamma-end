import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProfilDocument = HydratedDocument<Profil>;

@Schema()
export class Profil {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;
}

export const ProfilSchema = SchemaFactory.createForClass(Profil);
