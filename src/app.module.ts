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
import { MessagesModule } from './messages/messages.module';
import { LocationModule } from './location/location.module';
import { GeocodingService } from './geocoding/geocoding.service';
import { GeocodingModule } from './geocoding/geocoding.module';
import { WorkoutModule } from './workout/workout.module';
// import { ZorkoutService } from './zorkout/zorkout.service';
import { TrainerModule } from './trainer/trainer.module';
// import { ResourceOwnerGuard } from './auth/common/guards/resource-owner.guard';
import { ResourceGuardModule } from './resource/resource.module';
import { ContractModule } from './contract/contract.module';

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
    MessagesModule,
    LocationModule,
    GeocodingModule,
    WorkoutModule,
    TrainerModule,
    ResourceGuardModule,
    ContractModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GeocodingService,
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
