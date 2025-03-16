import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { Contract, ContractSchema } from './schema/contract.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainerModule } from '../trainer/trainer.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contract.name, schema: ContractSchema }]),
    TrainerModule,
    UsersModule,
    AuthModule
  ],
  providers: [ContractService],
  controllers: [ContractController],
  exports: [ContractService]  // Export if needed by other modules
})
export class ContractModule { }
