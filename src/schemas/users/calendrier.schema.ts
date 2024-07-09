import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type CalendrierDocument = HydratedDocument<Calendrier>;

@Schema()
export class Calendrier {
  @Prop({ required: true, lowercase: true, trim: true })
  mois: string;

  @Prop({ required: true, trim: true })
  annee: number;

  @Prop({ required: true, default: new Date() })
  datePaie: Date;
}

export const CalendrierSchema = SchemaFactory.createForClass(Calendrier);
