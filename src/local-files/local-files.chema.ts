import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { User } from '../users/schema/user.schema';
import * as mongoose from 'mongoose';

export type LocalFilesDocument = LocalFiles & Document;

@Schema({ timestamps: true })
export class LocalFiles {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  filename: string;

  @Prop()
  path: string;

  @Prop()
  mimetype: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) // like many to one relationship
  @Type(() => User)
  author: User;
}

const LocalFilesSchema = SchemaFactory.createForClass(LocalFiles);

export { LocalFilesSchema };
