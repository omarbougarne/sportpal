import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { User, UserSchema } from '../users/schema/users.schema';
import { Trainer, TrainerSchema } from '../trainer/schema/tariner.schema';
import { Group, GroupSchema } from '../group/schema/group.schema';
import { Workout, WorkoutSchema } from '../workout/schema/workout.schema';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from 'src/group/group.module';
import { TrainerModule } from 'src/trainer/trainer.module';
import { WorkoutModule } from 'src/workout/workout.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Trainer.name, schema: TrainerSchema },
            { name: Group.name, schema: GroupSchema },
            { name: Workout.name, schema: WorkoutSchema }
        ]),
        AuthModule,
        UsersModule,
        GroupModule,
        TrainerModule,
        WorkoutModule
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
})
export class StatisticsModule { }