import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ContractStatus } from '../enums/contract-status.enum';
export type ContractDocument = Contract & Document;



@Schema({ timestamps: true })
export class Contract {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    clientId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Trainer', required: true })
    trainerId: Types.ObjectId;

    @Prop({
        type: String,
        enum: ContractStatus,
        default: ContractStatus.PENDING
    })
    status: ContractStatus;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: false })
    endDate?: Date;

    @Prop({ required: true })
    totalSessions: number;

    @Prop({ default: 0 })
    completedSessions: number;

    @Prop({ required: true, min: 0 })
    hourlyRate: number;

    @Prop({ required: false })
    notes?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Workout' }], default: [] })
    workouts: Types.ObjectId[];
}

export const ContractSchema = SchemaFactory.createForClass(Contract);