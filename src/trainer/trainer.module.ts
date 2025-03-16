import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trainer, TrainerSchema } from './schema/tariner.schema';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schema/users.schema';
import { GeocodingService } from 'src/geocoding/geocoding.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trainer.name, schema: TrainerSchema }, { name: User.name, schema: UserSchema }]), AuthModule
  ],
  providers: [TrainerService, UsersService, GeocodingService],
  controllers: [TrainerController],
  exports: [TrainerService]
})
export class TrainerModule { }
