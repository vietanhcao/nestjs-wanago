import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './message.schema';
import ChatGateway from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
