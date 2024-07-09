import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Service } from './service.schema';
import { Rubrique } from './rubrique.schema';
import { HydratedDocument } from 'mongoose';

export type ServiceRubriqueDocument = HydratedDocument<ServiceRubrique>;

@Schema()
export class ServiceRubrique {
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
    ref: 'Service',
  })
  service: Service;

  @Prop({
    default: new Date(),
  })
  dateDebut: Date;

  @Prop({
    required: false,
  })
  dateFin: Date;
}

export const ServiceRubriqueSchema =
  SchemaFactory.createForClass(ServiceRubrique);
