import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users/users.service';
import * as cron from 'node-cron'
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/common/guards/roles.guard';
import { GroupModule } from './group/group.module';
import { WorkoutModule } from './workout/workout.module';
import { TrainerModule } from './trainer/trainer.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    AuthModule,
    GroupModule,
    StatisticsModule,
    WorkoutModule,
    TrainerModule,
    StatisticsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RolesGuard,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) { }
  onModuleInit() {
    cron.schedule('0 0 * * *', async () => {
      await this.usersService.permanentlyDeleteUsers();
    })
  }
}
