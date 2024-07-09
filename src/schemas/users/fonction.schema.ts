import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Service } from './service.schema';
import { Direction } from './direction.schema';
export type FonctionDocument = HydratedDocument<Fonction>;

@Schema()
export class Fonction {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['Service', 'Direction'],
  })
  rattache: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  })
  service: Service;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Direction',
  })
  direction: Direction;
}

export const FonctionSchema = SchemaFactory.createForClass(Fonction);
