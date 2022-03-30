import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface msgToServerPayload {
  message: string;
  room: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export default class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(socket: Socket, ...args: any[]) {
    console.log(`Client connected: ${socket.id}`, args);
    await this.chatService.getUserFromSocket(socket);
    // const allChats = await this.chatService.getAllMessages();
    // process.nextTick(() => {
    // socket.emit('allChats', allChats);
    // });
  }

  async handleDisconnect(socket: Socket) {
    // const query = socket.handshake.query;
    console.log('Disconnect', socket.handshake.query);
    // await this.chatService.removeUserFromSocket(socket);
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('msgToServer')
  public handleMessage(socket: Socket, payload: msgToServerPayload) {
    return socket.to(payload.room).emit('msgToClient', payload.message);
  }

  @SubscribeMessage('joinRoom')
  public joinRoom(socket: Socket, room: string): void {
    socket.join(room);
    socket.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  public leaveRoom(socket: Socket, room: string): void {
    socket.leave(room);
    socket.emit('leftRoom', room);
  }

  afterInit(server: Server) {
    console.log('Init', 'server', server);
  }

  @SubscribeMessage('send_message')
  async listenForMessages(
    @MessageBody() content: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const author = await this.chatService.getUserFromSocket(socket);
    const message = await this.chatService.saveMessage(content, author);
    // socket.emit('receive_message', message);
    // socket.broadcast.emit('receive_message', message);
    this.server.local.emit('receive_message', message);

    return message;
  }

  // @Bind(MessageBody(), ConnectedSocket())
  // @SubscribeMessage('chat')
  // handleNewMessage(chat, sender: any) {
  //   const author = await this.chatService.getUserFromSocket(socket);
  //   const message = await this.chatService.saveMessage(content, author);
  // }

  @SubscribeMessage('request_all_messages')
  async requestAllMessages(@ConnectedSocket() socket: Socket) {
    await this.chatService.getUserFromSocket(socket);
    const messages = await this.chatService.getAllMessages();

    socket.emit('send_all_messages', messages);
  }
}
