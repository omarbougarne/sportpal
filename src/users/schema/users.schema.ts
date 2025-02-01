import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'
import { Role } from '../enums/role.enum'


export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})

export class User{
    @Prop({ required: true})
    name: string;

    @Prop({ required: false })
    displayName: string;

    @Prop({ required: true})
    email: string;

    @Prop({ required: true})
    password: string;

    @Prop({ type: String, enum: Role, default: Role.User })
    role: Role

    @Prop({type: Date, default: null})
    deletedAt: Date | null
}

export const UserSchema = SchemaFactory.createForClass(User);