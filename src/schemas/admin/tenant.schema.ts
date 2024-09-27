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
    required: false,
    trim: true,
  })
  rccmNumero: string;

  @Prop({
    required: true,
    trim: true,
  })
  cotisationNumero: string;

  @Prop({
    required: true,
    trim: true,
  })
  telephone: string;

  @Prop({
    required: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: false,
  })
  bp: string;

  @Prop({
    default: true,
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

  @Prop({
    required: true,
  })
  initialization: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
