import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Direction } from './direction.schema';
import { Rubrique } from './rubrique.schema';
import { HydratedDocument } from 'mongoose';

export type DirectionRubriqueDocument = HydratedDocument<DirectionRubrique>;

@Schema()
export class DirectionRubrique {
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
    ref: 'Direction',
  })
  direction: Direction;

  @Prop({
    default: new Date(),
  })
  dateDebut: Date;

  @Prop({
    required: false,
  })
  dateFin: Date;
}

export const DirectionRubriqueSchema =
  SchemaFactory.createForClass(DirectionRubrique);
