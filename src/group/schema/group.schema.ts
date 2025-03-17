import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";
import { Types, Document } from "mongoose";
import { Location, LocationSchema } from "../../location/schema/location.schema";

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

    // Change location to support either a reference or embedded document
    @Prop({
        type: MongooseSchema.Types.Mixed,
        required: true,
        validate: {
            validator: function (v) {
                // Either an ObjectId or an object with required location fields
                return Types.ObjectId.isValid(v) ||
                    (v && v.coordinates && v.city);
            },
            message: 'Location must be either a valid location ID or a location object with coordinates and city'
        }
    })
    location: Types.ObjectId | Location;

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