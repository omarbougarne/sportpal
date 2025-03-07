import { Module } from '@nestjs/common';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';

@Module({
  controllers: [WorkoutController],
  providers: [WorkoutService]
})
export class WorkoutModule {}
