import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Messages, MessagesDocument } from './schema/messages.schema';
import { GroupService } from 'src/group/group.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Messages.name) private messagesModel: Model<MessagesDocument>,
        private groupService: GroupService,
    ) { }

    async sendMessage(createMessageDto: CreateMessageDto): Promise<{ data: Messages }> {
        try {
            const { groupId, senderId, content } = createMessageDto;
            const group = await this.groupService.getGroupById(groupId)
            if (!group.data.members.includes(new Types.ObjectId(senderId))) {
                throw new HttpException('User not a member of the group', HttpStatus.FORBIDDEN);
            }
            const message = new this.messagesModel({
                groupId: new Types.ObjectId(groupId),
                senderId: new Types.ObjectId(senderId),
                content,
            });
            const savedMessage = await message.save();
            return { data: savedMessage };
        } catch (error) {
            throw new HttpException('Error sending message', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}