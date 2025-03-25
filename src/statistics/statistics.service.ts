// src/statistics/statistics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schema/users.schema';
import { Trainer } from '../trainer/schema/tariner.schema';
import { Group } from '../group/schema/group.schema';
import { Workout } from '../workout/schema/workout.schema';

@Injectable()
export class StatisticsService {
    private readonly logger = new Logger(StatisticsService.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Trainer.name) private readonly trainerModel: Model<Trainer>,
        @InjectModel(Group.name) private readonly groupModel: Model<Group>,
        @InjectModel(Workout.name) private readonly workoutModel: Model<Workout>
    ) { }

    async getDashboardStats() {
        try {
            // Execute all count queries in parallel for performance
            const [totalUsers, totalTrainers, totalGroups, totalWorkouts] = await Promise.all([
                this.userModel.countDocuments().exec(),
                this.trainerModel.countDocuments().exec(),
                this.groupModel.countDocuments().exec(),
                this.workoutModel.countDocuments().exec()
            ]);

            // Calculate active trainers (with at least one client)
            const activeTrainers = await this.trainerModel.countDocuments({
                'clients.0': { $exists: true }
            }).exec();

            // Calculate active groups (with activity in last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const activeGroups = await this.groupModel.countDocuments({
                $or: [
                    { lastActivityDate: { $gte: thirtyDaysAgo } },
                    { createdAt: { $gte: thirtyDaysAgo } }
                ]
            }).exec();

            return {
                totalUsers,
                totalTrainers,
                activeTrainers,
                totalGroups,
                activeGroups,
                totalWorkouts
            };
        } catch (error) {
            this.logger.error(`Error calculating dashboard statistics: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getWorkoutsByType() {
        try {
            const result = await this.workoutModel.aggregate([
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]).exec();

            return result;
        } catch (error) {
            this.logger.error(`Error getting workout statistics: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getUserGrowth(timeframe: 'daily' | 'weekly' | 'monthly' = 'monthly') {
        try {
            const dateField = "$createdAt";
            let groupIdFormat;

            switch (timeframe) {
                case 'daily':
                    groupIdFormat = {
                        year: { $year: dateField },
                        month: { $month: dateField },
                        day: { $dayOfMonth: dateField }
                    };
                    break;
                case 'weekly':
                    groupIdFormat = {
                        year: { $year: dateField },
                        week: { $week: dateField }
                    };
                    break;
                case 'monthly':
                default:
                    groupIdFormat = {
                        year: { $year: dateField },
                        month: { $month: dateField }
                    };
                    break;
            }

            return await this.userModel.aggregate([
                {
                    $group: {
                        _id: groupIdFormat,
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]).exec();
        } catch (error) {
            this.logger.error(`Error getting user growth statistics: ${error.message}`, error.stack);
            throw error;
        }
    }
}