// src/statistics/statistics.controller.ts
import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard';
// import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('statistics')
export class StatisticsController {
    private readonly logger = new Logger(StatisticsController.name);

    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    // @Roles(Role.Admin)
    async getDashboardStats() {
        try {
            return await this.statisticsService.getDashboardStats();
        } catch (error) {
            this.logger.error(`Error fetching dashboard statistics: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('workouts/by-type')
    @UseGuards(JwtAuthGuard)
    async getWorkoutsByType() {
        try {
            return await this.statisticsService.getWorkoutsByType();
        } catch (error) {
            this.logger.error(`Error fetching workout statistics: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('users/growth')
    @UseGuards(JwtAuthGuard)
    // @Roles(Role.Admin)
    async getUserGrowth(@Query('timeframe') timeframe: 'daily' | 'weekly' | 'monthly' = 'monthly') {
        try {
            return await this.statisticsService.getUserGrowth(timeframe);
        } catch (error) {
            this.logger.error(`Error fetching user growth statistics: ${error.message}`, error.stack);
            throw error;
        }
    }

    // Public stats endpoint - no auth required
    @Get('public')
    async getPublicStats() {
        try {
            const stats = await this.statisticsService.getDashboardStats();
            // Only return non-sensitive stats
            return {
                totalUsers: stats.totalUsers,
                totalWorkouts: stats.totalWorkouts,
                activeGroups: stats.activeGroups
            };
        } catch (error) {
            this.logger.error(`Error fetching public statistics: ${error.message}`, error.stack);
            throw error;
        }
    }
}