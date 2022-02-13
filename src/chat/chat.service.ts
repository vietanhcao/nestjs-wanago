import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';
import { Message, MessageDocument } from './message.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schema/user.schema';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async saveMessage(content: string, author: User) {
    const newMessage = new this.messageModel({
      content,
      author: author._id,
    });
    return newMessage.save();
  }

  async getAllMessages() {
    return this.messageModel.find().populate('author');
  }

  async getUserFromSocket(socket: Socket) {
    // const cookie = socket.handshake.headers.cookie;
    const authorization = socket.handshake.headers.authorization;
    // const { Authentication: authenticationToken } = parse(cookie);
    const user =
      await this.authenticationService.getUserFromAuthenticationToken(
        authorization,
      );
    if (!user) {
      throw new WsException('Invalid credentials.');
    }
    return user;
  }
}
