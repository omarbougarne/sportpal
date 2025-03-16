import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { Workout, WorkoutSchema } from './schema/workout.schema';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from 'src/users/schema/users.schema';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workout.name, schema: WorkoutSchema }, { name: User.name, schema: UserSchema }]),
    AuthModule,
    UsersModule
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
  exports: [WorkoutService],
})
export class WorkoutModule { }
