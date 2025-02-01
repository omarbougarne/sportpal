import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users/users.service';
import * as cron from 'node-cron'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', 
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
      UsersModule,
      AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService){}
  onModuleInit() {
    cron.schedule('0 0 * * *', async () =>{
      await this.usersService.permanentlyDeleteUsers();
    })
  }
}
