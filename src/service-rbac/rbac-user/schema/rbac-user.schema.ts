import { RbacUserStatus, RbacUserTypes } from './../types/rbac-user.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';

export type RbacUserDocument = RbacUser & Document;

@Schema({ timestamps: true, collection: 'rbac-users' })
export class RbacUser {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ required: true, type: String, index: true, unique: true })
  username: string;

  @Prop({ required: true, type: String, index: true, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, default: [] })
  roles: string[];

  @Prop({ required: true, default: [] })
  functions: string[];

  @Prop({ required: true, type: String, enum: RbacUserTypes })
  type: RbacUserTypes;

  @Prop({ type: String, enum: RbacUserStatus, default: RbacUserStatus.ACTIVE })
  status: RbacUserStatus;
}

export const RbacUserSchema = SchemaFactory.createForClass(RbacUser);
