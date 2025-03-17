import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LocationDocument = Location & Document;

@Schema()
export class Location {
    @Prop()
    name: string;

    @Prop({
        type: [Number],
        index: '2dsphere'  // Add geospatial index
    })
    coordinates: number[]; // [longitude, latitude]

    @Prop()
    address: string;

    @Prop({ required: true })
    city: string;

    @Prop()
    country: string;

    @Prop()
    display_name: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);