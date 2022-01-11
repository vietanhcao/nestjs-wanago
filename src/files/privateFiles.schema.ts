import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import * as mongoose from 'mongoose';
import { User } from 'src/users/user.schema';

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
  owner: User;
}

export const PrivateFileSchema = SchemaFactory.createForClass(PrivateFile);
