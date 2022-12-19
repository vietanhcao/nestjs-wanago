import { ApproveStatus, ApproveActions } from '../types/index';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { User } from 'src/users/schema/user.schema';

@Schema({ timestamps: true, collection: 'approves' })
export class ApproveDocument extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ required: true, type: String, enum: ApproveActions })
  action: ApproveActions;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  createdBy: User;

  @Prop({
    type: String,
    enum: ApproveStatus,
    default: ApproveStatus.PENDING,
  })
  status: ApproveStatus;

  @Prop({ type: Date })
  acceptedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  acceptedBy?: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  rejectedBy?: User;

  @Prop({ type: String })
  rejectedReason?: string;

  @Prop({ type: Object })
  oldData?: Record<string, unknown>;

  @Prop({ type: Object })
  newData?: Record<string, unknown>;

  @Prop({ type: Object })
  extraData?: Record<string, unknown>;
}

export const ApproveSchema = SchemaFactory.createForClass(ApproveDocument);
