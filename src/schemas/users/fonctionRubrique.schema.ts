import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Fonction } from './fonction.schema';
import { Rubrique } from './rubrique.schema';
import { HydratedDocument } from 'mongoose';

export type FonctionRubriqueDocument = HydratedDocument<FonctionRubrique>;

@Schema()
export class FonctionRubrique {
  @Prop({
    required: true,
  })
  montant: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rubrique',
  })
  rubrique: Rubrique;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fonction',
  })
  fonction: Fonction;

  @Prop({
    default: new Date(),
  })
  dateDebut: Date;

  @Prop({
    required: false,
  })
  dateFin: Date;
}

export const FonctionRubriqueSchema =
  SchemaFactory.createForClass(FonctionRubrique);
