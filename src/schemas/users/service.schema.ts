import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Direction } from './direction.schema';
export type ServiceDocument = HydratedDocument<Service>;

@Schema()
export class Service {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Direction',
  })
  direction: Direction;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
