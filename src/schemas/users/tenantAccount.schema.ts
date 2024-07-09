import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Tenant } from '../admin/tenant.schema';
import { Banque } from './banque.schema';
import { HydratedDocument } from 'mongoose';

export type TenantAccountDocument = HydratedDocument<TenantAccount>;

@Schema()
export class TenantAccount {
  @Prop({
    required: true,
    trim: true,
  })
  numero: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
  })
  tenant: Tenant;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banque',
  })
  banque: Banque;
}

export const TenantAccountSchema = SchemaFactory.createForClass(TenantAccount);
