import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';

@Module({
  providers: [TrainerService],
  controllers: [TrainerController]
})
export class TrainerModule {}
