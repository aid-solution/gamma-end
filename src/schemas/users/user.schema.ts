import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from 'http';
import { HydratedDocument } from 'mongoose';
import { Profil } from './profil.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  login: string;

  @Prop({
    required: true,
    minlength: 8,
    trim: true,
  })
  password: string;

  @Prop({
    default: true,
  })
  statut: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  agent: Agent;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  })
  profil: Profil;
}

export const UserSchema = SchemaFactory.createForClass(User);
