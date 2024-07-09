import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RubriqueDocument = HydratedDocument<Rubrique>;

@Schema()
export class Rubrique {
  @Prop({
    required: true,
    trim: true,
  })
  code: number;

  @Prop({
    required: true,
    trim: true,
  })
  libelle: string;

  @Prop({
    required: true,
  })
  assujetiCNSS: boolean;

  @Prop({
    required: true,
  })
  assujetiImpot: boolean;

  @Prop({
    required: true,
  })
  entreBrut: boolean;

  @Prop({
    required: true,
  })
  entreNet: boolean;

  @Prop({
    required: true,
    trim: true,
    enum: ['Gain', 'Retenue'],
  })
  gainRetenue: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['Fixe', 'Variable'],
  })
  type: string;

  @Prop({
    required: false,
  })
  montant: number;
}

export const RubriqueSchema = SchemaFactory.createForClass(Rubrique);
