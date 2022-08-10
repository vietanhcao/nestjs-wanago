import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import * as mongoose from 'mongoose';
import { User } from '../users/schema/user.schema';
import { Post } from '../posts/post.schema';

export type PrivateFileDocument = PrivateFile & Document;

@Schema()
export class PrivateFile {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  url: string;

  @Prop()
  key: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) // like many to one relationship
  @Type(() => User)
  owner?: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }) // like many to one relationship
  @Type(() => Post)
  postId?: Post;
}

export const PrivateFileSchema = SchemaFactory.createForClass(PrivateFile);
