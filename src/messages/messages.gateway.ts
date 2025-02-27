import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Messages } from './schema/messages.schema';
import { HttpStatus } from '@nestjs/common';

@WebSocketGateway({ namespace: '/messages' })
export class MessageGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly messagesService: MessagesService,
        @InjectModel(Messages.name) private messagesModel: Model<Messages>
    ) { }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() createMessageDto: CreateMessageDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const message = await this.messagesService.sendMessage(createMessageDto);
            this.server.to(createMessageDto.groupId.toString()).emit('receiveMessage', message);
        } catch (error) {
            client.emit('messageError', {
                status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message || 'Failed to send message'
            });
            console.error('WebSocket Error:', error);
        }
    }

    @SubscribeMessage('joinGroup')
    handleJoinGroup(
        @MessageBody('groupId') groupId: string,
        @ConnectedSocket() client: Socket,
    ): void {
        client.join(groupId);
    }

    @SubscribeMessage('leaveGroup')
    handleLeaveGroup(
        @MessageBody('groupId') groupId: string,
        @ConnectedSocket() client: Socket,
    ): void {
        client.leave(groupId);
    }
}