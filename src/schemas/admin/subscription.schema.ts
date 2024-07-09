import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Tenant } from './tenant.schema';
export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema()
export class Subscription {
  @Prop({
    required: true,
    default: new Date(),
  })
  startingOn: Date;

  @Prop({
    required: true,
    default: new Date(),
  })
  endingOn: Date;

  @Prop({
    required: true,
    default: true,
  })
  active: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
  })
  tenant: Tenant;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
