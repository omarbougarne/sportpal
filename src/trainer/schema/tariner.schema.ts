import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { CertificationType } from '../enums/certification-type.enum';
import { SpecializationType } from '../enums/serialization-type.enum';

export type TrainerDocument = Trainer & Document;



export class Certification {
    @Prop({ required: true, enum: CertificationType })
    type: CertificationType;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    issueDate: Date;

    @Prop({ required: false })
    expiryDate?: Date;

    @Prop({ required: false })
    certificateUrl?: string;
}

export class Review {
    @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
    _id: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ required: false })
    comment?: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export class TimeSlot {
    @Prop({ required: true })
    dayOfWeek: number;

    @Prop({ required: true })
    startTime: string;

    @Prop({ required: true })
    endTime: string;
}

@Schema({
    timestamps: true,
})
export class Trainer {
    [x: string]: any;
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    bio: string;

    @Prop({ required: true, min: 0 })
    yearsOfExperience: number;

    @Prop({ type: [{ type: Object }], required: false })
    certifications?: Certification[];

    @Prop({ type: [String], enum: SpecializationType, required: true })
    specializations: SpecializationType[];

    @Prop({ type: [{ type: Object }], required: false })
    availability?: TimeSlot[];

    @Prop({ required: false, min: 0 })
    hourlyRate?: number;

    @Prop({ type: [{ type: Object }], default: [] })
    reviews: Review[];

    @Prop({ default: 0 })
    averageRating: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Workout' }], default: [] })
    workouts: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Location', required: false })
    location?: Types.ObjectId;

    @Prop({ required: false })
    introVideo?: string;

    @Prop({ type: [String], required: false })
    galleryImages?: string[];

    @Prop({ required: false })
    isVerified: boolean;
}

export const TrainerSchema = SchemaFactory.createForClass(Trainer);

TrainerSchema.index({ userId: 1 });
TrainerSchema.index({ specializations: 1 });
TrainerSchema.index({ averageRating: -1 });


