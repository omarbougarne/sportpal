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


@WebSocketGateway({ namespace: '/messages' })
export class MessageGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly messagesService: MessagesService) { }
    @SubscribeMessage('sendMessages')
    async handleMessages(@MessageBody() createMessagesDto: CreateMessageDto, @ConnectedSocket() client: Socket,): Promise<void> {
        const message = await this.messagesService.sendMessage(createMessagesDto);
        this.server.to(message.groupId.toString()).emit('receiveMessage', message)
    }

    @SubscribeMessage('sendMessages')
    async handleJoinGroup(@MessageBody('groupId') groupId: string, @ConnectedSocket() client: Socket,): void {
        client.join(groupId)
    }

    @SubscribeMessage('sendMessages')
    async handleLeaveGroup(@MessageBody('groupId') groupId: string, @ConnectedSocket() client: Socket,): void {
        client.leave(groupId)
    }
}