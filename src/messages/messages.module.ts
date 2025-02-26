import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { Messages, MessagesSchema } from './schema/messages.schema';
import { GroupModule } from '../group/group.module';
import { MessagesController } from './messages.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Messages.name, schema: MessagesSchema }]),
    GroupModule,
  ],
  providers: [MessageGateway, MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule { }
