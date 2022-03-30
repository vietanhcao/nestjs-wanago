import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import mongoose, { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { AuthenticationService } from 'src/authentication/authentication.service';
import ClientQuery from 'src/common/client-query';
import { User } from 'src/users/schema/user.schema';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class ChatService {
  public chatClientQuery: ClientQuery<MessageDocument>;
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.chatClientQuery = new ClientQuery(this.messageModel);
  }

  async saveMessage(content: string, author: User) {
    const newMessage = new this.messageModel({
      content,
      author: author._id,
    });
    await newMessage.populate('author', 'lastName firstName -_id'); // exclude password;
    return newMessage.save();
  }

  async getAllMessages(
    documentsToSkip = 0,
    limitOfDocuments?: number,
    chatId?: string,
  ) {
    // return this.chatClientQuery.find().populate('author');
    // db.messages.find({_id: {$lte: ObjectId("6243ffc07f0de41b8d2e139a") }}).sort({_id: 1})
    let queryMongoose = {};
    if (chatId) {
      queryMongoose = {
        _id: {
          $lt: new mongoose.Types.ObjectId(chatId),
        },
      };
    }
    const { result, pagination } = await this.chatClientQuery.findForQuery(
      {
        filter: {},
        limit: limitOfDocuments,
        offset: documentsToSkip,
        // sort: { createdAt: -1 },
        _id: { sort: 'desc' },
      },
      {
        populate: [
          { path: 'author', select: 'lastName firstName -_id' }, // exclude password
          // { path: 'categories' }, //"populate" returning the data of the author along with the post.
          // { path: 'series' },
          // { path: 'file' },
        ],
        queryMongoose,
        omit: ['categories', 'title', '__v', 'createdAt', 'updatedAt'],
      },
    );
    // const results = await response;
    // const count = await this.postModel.find(filters).countDocuments();
    return { result, pagination };
  }

  async getUserFromSocket(socket: Socket) {
    // const cookie = socket.handshake.headers.cookie;
    // const authorization = socket.handshake.headers.authorization;
    let authorization = socket.handshake.auth.Authorization;
    if (socket.handshake.headers.authorization) {
      authorization = socket.handshake.headers.authorization;
    }
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
