import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WorkoutType } from '../enums/workout-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';

export type WorkoutDocument = Workout & Document;

export class Exercise {
    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    description?: string;

    @Prop({ required: false })
    sets?: number;

    @Prop({ required: false })
    reps?: number;

    @Prop({ required: false })
    duration?: number;

    @Prop({ required: false })
    restTime?: number;

    @Prop({ type: [String], required: false })
    imageUrls?: string[];
}

@Schema({
    timestamps: true,
})
export class Workout {
    @Prop({ required: true })
    title: string;

    @Prop({ required: false })
    description?: string;

    @Prop({ required: true, enum: WorkoutType })
    workoutType: WorkoutType;

    @Prop({ required: true, enum: DifficultyLevel })
    difficultyLevel: DifficultyLevel;

    @Prop({ required: true, min: 0 })
    duration: number;

    @Prop({ required: true, min: 0 })
    caloriesBurn: number;

    @Prop({ type: [{ type: Object }], required: true })
    exercises: Exercise[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    creator: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Location', required: false })
    location?: Types.ObjectId;

    @Prop({ type: [String], required: false })
    equipment?: string[];

    @Prop({ type: [String], required: false })
    tags?: string[];

    @Prop({ type: [String], required: false })
    imageUrls?: string[];

    @Prop({ default: 0 })
    popularity: number;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);