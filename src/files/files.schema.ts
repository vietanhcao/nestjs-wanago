import { User } from 'src/users/schema/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import * as mongoose from 'mongoose';
import { Post } from 'src/posts/post.schema';

export type FilesDocument = Files & Document;

@Schema()
export class Files {
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

export const FilesSchema = SchemaFactory.createForClass(Files);
