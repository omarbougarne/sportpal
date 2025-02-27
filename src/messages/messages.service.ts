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


            if (!groupId || !senderId || !content) {
                throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
            }

            const group = await this.groupService.getGroupById(groupId);


            if (!group?.data) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }


            if (!group.data.members.some(member => member.equals(senderId))) {
                throw new HttpException('User not a member of the group', HttpStatus.FORBIDDEN);
            }

            const message = new this.messagesModel({
                groupId: new Types.ObjectId(groupId),
                senderId: new Types.ObjectId(senderId),
                content,
            });

            return { data: await message.save() };
        } catch (error) {
            console.error('Service Error:', error);
            throw error;
        }
    }
}