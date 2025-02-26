
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types } from "mongoose"


export type MessagesDocument = Messages & Document

@Schema({
    timestamps: true
})
export class Messages {
    @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
    groupId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId;

    @Prop({ required: true })
    content: string;
}

export const MessagesSchema = SchemaFactory.createForClass(Messages);