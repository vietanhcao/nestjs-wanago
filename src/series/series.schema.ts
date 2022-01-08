import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import * as mongoose from 'mongoose';
import { User } from 'src/users/user.schema';

export type SeriesDocument = Series & Document;

@Schema()
export class Series {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name }) // like many to one relationship
  @Type(() => User)
  author: User;
}

export const SeriesSchema = SchemaFactory.createForClass(Series);
