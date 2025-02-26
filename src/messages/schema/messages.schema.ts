
import { Prop, Schema } from "@nestjs/mongoose"
import { Types } from "mongoose"


export type MessagesDocument = Message & Document

@Schema({
    timestamps: true
})
export class Message {
    @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
    groupId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId;

    @Prop({ required: true })
    content: string;
}