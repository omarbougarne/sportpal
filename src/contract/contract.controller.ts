// src/training-contract/training-contract.controller.ts
import { Controller, Post, Body, Param, Get, Patch, UseGuards, Request, Logger } from '@nestjs/common';
import { ContractService } from './contract.service';
import { HireTrainerDto } from './dto/hire-trainer.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard';
import { TrainerService } from '../trainer/trainer.service';

@Controller('training-contracts')
export class ContractController {
    private readonly logger = new Logger(ContractController.name);

    constructor(
        private readonly contractService: ContractService,
        private readonly trainerService: TrainerService,
    ) { }

    @Post('hire')
    @UseGuards(JwtAuthGuard)
    async hireTrainer(
        @Request() req,
        @Body() hireTrainerDto: HireTrainerDto,
    ) {
        try {
            return await this.contractService.hireTrainer(
                req.user.userId,
                hireTrainerDto,
            );
        } catch (error) {
            this.logger.error(`Error in hire trainer controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('client')
    @UseGuards(JwtAuthGuard)
    async getMyContracts(@Request() req) {
        try {
            return await this.contractService.getClientContracts(req.user.userId);
        } catch (error) {
            this.logger.error(`Error getting client contracts: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('trainer')
    @UseGuards(JwtAuthGuard)
    async getTrainerContracts(@Request() req) {
        try {
            // First get trainer profile by userId
            const trainer = await this.trainerService.findByUserId(req.user.userId);
            // For line 52:
            return await this.contractService.getTrainerContracts((trainer as any)._id.toString());


        } catch (error) {
            this.logger.error(`Error getting trainer contracts: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    async updateContractStatus(
        @Param('id') id: string,
        @Body() statusDto: UpdateContractStatusDto,
        @Request() req,
    ) {
        try {
            const trainer = await this.trainerService.findByUserId(req.user.userId);
            return await this.contractService.updateContractStatus(
                id,

                (trainer as any)._id.toString(),
                statusDto,
            );
        } catch (error) {
            this.logger.error(`Error updating contract status: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Post(':id/workouts/:workoutId')
    @UseGuards(JwtAuthGuard)
    async addWorkoutToContract(
        @Param('id') id: string,
        @Param('workoutId') workoutId: string,
    ) {
        try {
            return await this.contractService.addWorkoutToContract(id, workoutId);
        } catch (error) {
            this.logger.error(`Error adding workout to contract: ${error.message}`, error.stack);
            throw error;
        }
    }
}