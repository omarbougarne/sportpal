import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type GroupDocument = Group & Document;

@Schema({
    timestamps: true,
})
export class Group {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    members: Types.ObjectId[];

    @Prop({ required: false })
    sport?: string;

    @Prop({ required: false })
    activity?: string;

    @Prop({ required: true })
    location: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    organizer: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }], default: [] })
    messages: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);