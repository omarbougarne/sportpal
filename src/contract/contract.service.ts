import { Injectable, NotFoundException, ForbiddenException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contract, ContractDocument } from './schema/contract.schema';
import { HireTrainerDto } from './dto/hire-trainer.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { TrainerService } from '../trainer/trainer.service';
import { UsersService } from '../users/users.service';
import { ContractStatus } from './enums/contract-status.enum';

@Injectable()
export class ContractService {
    private readonly logger = new Logger(ContractService.name);

    constructor(
        @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
        private readonly trainerService: TrainerService,
        private readonly usersService: UsersService,
    ) { }

    async hireTrainer(clientId: string, hireTrainerDto: HireTrainerDto): Promise<Contract> {
        try {
            // Verify client exists
            const client = await this.usersService.findOne(clientId);
            if (!client) {
                throw new NotFoundException(`User with ID ${clientId} not found`);
            }

            // Verify trainer exists and get hourly rate
            const trainer = await this.trainerService.findOne(hireTrainerDto.trainerId);
            if (!trainer) {
                throw new NotFoundException(`Trainer with ID ${hireTrainerDto.trainerId} not found`);
            }

            // Check if the trainer has an hourly rate set
            if (!trainer.hourlyRate) {
                throw new HttpException(
                    'This trainer has not set their hourly rate yet',
                    HttpStatus.BAD_REQUEST
                );
            }

            // Create the contract
            const contract = new this.contractModel({
                clientId: new Types.ObjectId(clientId),
                trainerId: new Types.ObjectId(hireTrainerDto.trainerId),
                startDate: hireTrainerDto.startDate,
                endDate: hireTrainerDto.endDate,
                totalSessions: hireTrainerDto.totalSessions,
                hourlyRate: trainer.hourlyRate,
                notes: hireTrainerDto.notes,
                status: ContractStatus.PENDING
            });

            // Save and return the new contract
            const savedContract = await contract.save();

            // Here you could add notification logic to alert the trainer

            return savedContract;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error hiring trainer: ${error.message}`, error.stack);
            throw new HttpException('Error hiring trainer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateContractStatus(
        contractId: string,
        trainerId: string,
        statusDto: UpdateContractStatusDto
    ): Promise<Contract> {
        try {
            const contract = await this.contractModel.findById(contractId).exec();

            if (!contract) {
                throw new NotFoundException(`Contract with ID ${contractId} not found`);
            }

            // Verify this contract belongs to the trainer
            if (contract.trainerId.toString() !== trainerId) {
                throw new ForbiddenException('You can only update your own contracts');
            }

            // Update status
            contract.status = statusDto.status;
            return await contract.save();
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(`Error updating contract status: ${error.message}`, error.stack);
            throw new HttpException('Error updating contract status', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getClientContracts(clientId: string): Promise<Contract[]> {
        try {
            return this.contractModel
                .find({ clientId: new Types.ObjectId(clientId) })
                .populate('trainerId')
                .populate('workouts')
                .exec();
        } catch (error) {
            this.logger.error(`Error getting client contracts: ${error.message}`, error.stack);
            throw new HttpException('Error getting contracts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTrainerContracts(trainerId: string): Promise<Contract[]> {
        try {
            return this.contractModel
                .find({ trainerId: new Types.ObjectId(trainerId) })
                .populate('clientId', 'name email profileImageUrl')
                .populate('workouts')
                .exec();
        } catch (error) {
            this.logger.error(`Error getting trainer contracts: ${error.message}`, error.stack);
            throw new HttpException('Error getting contracts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addWorkoutToContract(
        contractId: string,
        workoutId: string
    ): Promise<Contract> {
        try {
            const contract = await this.contractModel.findById(contractId).exec();

            if (!contract) {
                throw new NotFoundException(`Contract with ID ${contractId} not found`);
            }

            if (!contract.workouts.some(id => id.toString() === workoutId)) {
                contract.workouts.push(new Types.ObjectId(workoutId));
                contract.completedSessions += 1;

                // Check if contract should be marked completed
                if (contract.completedSessions >= contract.totalSessions) {
                    contract.status = ContractStatus.COMPLETED;
                }

                await contract.save();
            }

            return contract;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error adding workout to contract: ${error.message}`, error.stack);
            throw new HttpException('Error adding workout to contract', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
