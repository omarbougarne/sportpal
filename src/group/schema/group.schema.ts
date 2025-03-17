import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";
import { Types, Document } from "mongoose";


export class MemberInfo {

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    profileImageUrl: string;

}

const MemberInfoSchema = SchemaFactory.createForClass(MemberInfo);

export type GroupDocument = Group & Document;

@Schema({
    timestamps: true,
})
export class Group {
    @Prop({ required: true })
    name: string;

    @Prop([{
        userId: { type: Types.ObjectId, ref: 'User' },
        name: { type: String },
        profileImageUrl: { type: String }
    }])
    members: MemberInfo[];

    @Prop({ required: false })
    sport?: string;

    @Prop({ required: false })
    activity?: string;

    @Prop({ required: true })
    location: string;

    @Prop({
        type: {
            userId: { type: MongooseSchema.Types.ObjectId, ref: 'User', required: true },
            name: { type: String, required: true },
            profileImageUrl: { type: String }
        }
    })
    organizer: {
        userId: Types.ObjectId;
        name: string;
        profileImageUrl?: string;
    };

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }], default: [] })
    messages: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);