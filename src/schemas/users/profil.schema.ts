import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

interface Permission {
  module: string;
  read: boolean;
  create: boolean;
  update: boolean;
}

export type ProfilDocument = HydratedDocument<Profil>;

@Schema()
export class Profil {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;

  @Prop({
    required: true,
    trim: true,
  })
  permissions: Permission[];
}

export const ProfilSchema = SchemaFactory.createForClass(Profil);
