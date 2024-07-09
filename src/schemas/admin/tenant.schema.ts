import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type TenantDocument = HydratedDocument<Tenant>;

@Schema()
export class Tenant {
  @Prop({
    required: true,
    trim: true,
  })
  raisonSociale: string;

  @Prop({
    required: true,
    trim: true,
  })
  nif: string;

  @Prop({
    required: true,
    trim: true,
  })
  email: string;

  @Prop({
    default: false,
  })
  isValidate: boolean;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  dbName: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  subdomain: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
