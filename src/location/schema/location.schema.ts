import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

export class GeoPoint {
    type: string;
    coordinates: number[];
}

@Schema({
    timestamps: true,
})
export class Location {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    address: string;

    @Prop({ type: String, required: false })
    city?: string;

    @Prop({ type: String, required: false })
    district?: string;

    @Prop({ type: String, required: false })
    country?: string;

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
    location: GeoPoint;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

LocationSchema.index({ location: '2dsphere' });