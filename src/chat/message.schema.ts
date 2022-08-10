import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import * as mongoose from 'mongoose';
import { User } from '../users/schema/user.schema';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, autoIndex: true })
export class Message {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name }) // like many to one relationship
  @Type(() => User)
  author: User;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
