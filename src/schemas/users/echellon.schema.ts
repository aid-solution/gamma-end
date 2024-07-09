import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EchellonDocument = HydratedDocument<Echellon>;

@Schema()
export class Echellon {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;
}

export const EchellonSchema = SchemaFactory.createForClass(Echellon);
