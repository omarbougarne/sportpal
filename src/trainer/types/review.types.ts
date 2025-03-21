// In your review.schema.ts or trainer.schema.ts file
import { Types } from 'mongoose';

export interface Review {
    _id: Types.ObjectId;  // Add this line
    userId: Types.ObjectId;
    rating: number;
    comment: string;
}