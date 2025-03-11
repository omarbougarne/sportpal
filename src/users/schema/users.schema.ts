import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../enums/role.enum';
import { Level } from '../enums/level.enum';
import { Availability } from '../enums/availability.enum';

import { AccountStatus } from '../enums/account-status.enum';
import { Sport } from '../enums/sport.enum';


export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  profileImageUrl?: string;

  @Prop({ type: [String], required: false })
  favoriteSports?: Sport[];

  @Prop({ type: String, enum: Level, required: false })
  level?: Level;

  @Prop({ type: String, enum: Availability, required: false })
  availability?: Availability;




  @Prop({ type: String, enum: Role, default: Role.User })
  role: Role;

  @Prop({ type: Object, required: false })
  preferences?: Record<string, any>;

  @Prop({ type: Object, required: false })
  contactInfo?: Record<string, any>;

  @Prop({ type: String, enum: AccountStatus, required: false })
  accountStatus?: AccountStatus;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  location: {
    type: string;
    coordinates: number[];
  };

}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ location: '2dsphere' });