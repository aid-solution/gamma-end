import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type DirectionDocument = HydratedDocument<Direction>;

@Schema()
export class Direction {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;
}

export const DirectionSchema = SchemaFactory.createForClass(Direction);
