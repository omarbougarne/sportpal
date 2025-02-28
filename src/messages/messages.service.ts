import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Messages, MessagesDocument } from './schema/messages.schema';
import { GroupService } from 'src/group/group.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);

    constructor(
        @InjectModel(Messages.name) private messagesModel: Model<MessagesDocument>,
        private groupService: GroupService
    ) { }

    async sendMessage(createMessageDto: CreateMessageDto): Promise<{ data: Messages }> {
        try {
            // Validate input
            await this.validateMessageInput(createMessageDto);

            // Create and save message
            const message = new this.messagesModel({
                groupId: new Types.ObjectId(createMessageDto.groupId),
                senderId: new Types.ObjectId(createMessageDto.senderId),
                content: createMessageDto.content,
                timestamp: new Date()
            });

            const savedMessage = await message.save();

            // Add message reference to group
            await this.groupService.addMessageToGroup(
                createMessageDto.groupId,
                savedMessage._id
            );

            return { data: savedMessage };
        } catch (error) {
            this.logger.error(`Message sending failed: ${error.message}`);
            throw error;
        }
    }

    private async validateMessageInput(dto: CreateMessageDto) {
        if (!dto.content?.trim()) {
            throw new HttpException('Message content required', HttpStatus.BAD_REQUEST);
        }

        const group = await this.groupService.getGroupById(dto.groupId);
        if (!group) {
            throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
        }

        const isMember = group.members.some(member =>
            member.equals(new Types.ObjectId(dto.senderId))
        );
        if (!isMember) {
            throw new HttpException('User not in group', HttpStatus.FORBIDDEN);
        }
    }

    async getGroupMessages(groupId: string): Promise<{ data: Messages[] }> {
        try {
            const messages = await this.messagesModel
                .find({ groupId })
                .sort({ timestamp: -1 })
                .limit(100)
                .exec();

            return { data: messages };
        } catch (error) {
            this.logger.error(`Error fetching messages: ${error.message}`);
            throw new HttpException('Error fetching messages', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}