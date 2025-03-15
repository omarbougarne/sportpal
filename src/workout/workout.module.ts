import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { Workout, WorkoutSchema } from './schema/workout.schema';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from 'src/users/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workout.name, schema: WorkoutSchema }, { name: User.name, schema: UserSchema }]),
    AuthModule, // Import AuthModule to get access to JwtService
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
  exports: [WorkoutService],
})
export class WorkoutModule { }
