import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Echellon } from './echellon.schema';
import { Categorie } from './categorie.schema';
import { HydratedDocument } from 'mongoose';

export type GrilleDocument = HydratedDocument<Grille>;

@Schema()
export class Grille {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
  })
  categorie: Categorie;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Echellon',
  })
  echellon: Echellon;

  @Prop({
    required: false,
  })
  plafond: number;
}

export const GrilleSchema = SchemaFactory.createForClass(Grille);
