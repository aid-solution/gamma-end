import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MotifAbsenceDocument = HydratedDocument<MotifAbsence>;

@Schema()
export class MotifAbsence {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;
}

export const MotifAbsenceSchema = SchemaFactory.createForClass(MotifAbsence);
