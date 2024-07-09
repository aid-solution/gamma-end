import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategorieDocument = HydratedDocument<Categorie>;

@Schema()
export class Categorie {
  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;
}

export const CategorieSchema = SchemaFactory.createForClass(Categorie);
