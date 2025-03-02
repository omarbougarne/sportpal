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
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GroupService } from 'src/group/group.service';
import { group } from 'console';

@WebSocketGateway({
    namespace: '/messages',
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST']
    },
    pingInterval: 25000,
    pingTimeout: 5000
})
export class MessageGateway {
    @WebSocketServer() server: Server;
    private logger = new Logger(MessageGateway.name);

    constructor(
        private messagesService: MessagesService,
        private groupService: GroupService
    ) { }

    // Connection lifecycle management
    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        try {
            const userId = await this.authenticateClient(client);
            client.data.userId = userId;
            client.emit('connection-success', { status: 'connected' });
        } catch (error) {
            this.logger.error(`Connection failed: ${error.message}`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    private async authenticateClient(client: Socket): Promise<string> {
        const authToken = client.handshake.headers.authorization?.split(' ')[1];
        if (!authToken) throw new Error('Missing authentication token');

        // Implement your actual authentication logic here
        return 'authenticated-user-id';
    }

    @SubscribeMessage('joinGroup')
    async handleJoinGroup(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: any
    ) {
        try {
            const { groupId } = JSON.parse(data)
            const clientToken = client.handshake.headers.authorization?.split(' ')[1];
            const group = await this.groupService.getGroupById(groupId);

            if (!group.members.some(member => member.equals(client.data.userId))) {
                throw new HttpException('Not a group member', HttpStatus.FORBIDDEN);
            }

            client.join(groupId);
            client.emit('group-joined', { groupId });
            this.logger.log(`User ${client.data.userId} joined group ${groupId}`);
        } catch (error) {
            this.handleError(client, error, 'join-group-error');
        }
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: any
    ) {
        try {
            // const message = await this.messagesService.sendMessage({
            //     ...createMessageDto,
            //     senderId: client.data.userId
            // });
            const authToken = client.handshake.headers.authorization?.split(' ')[1];
            const sender = "xxxxxx"
            const { groupId, content } = JSON.parse(data)
            console.log(groupId)
            // console.log(data)
            this.server.to(groupId).emit('message-received', { content });
            // this.server.to(createMessageDto.groupId).emit('newMessage', message.data);
            // this.logger.log(`Message sent to group ${createMessageDto.groupId}`);
        } catch (error) {
            this.handleError(client, error, 'message-error');
        }
    }

    private handleError(client: Socket, error: Error, eventType: string) {
        const status = error instanceof HttpException ? error.getStatus() : 500;
        const message = error.message || 'Internal server error';

        client.emit(eventType, { status, message });
        this.logger.error(`Error: ${message}`, error.stack);
    }
}