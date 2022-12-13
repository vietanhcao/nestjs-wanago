import { ApproveStatus, ApproveActions } from '../types/index';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'approves' })
export class ApproveDocument extends Document {
  @Prop({ required: true, type: String, enum: ApproveActions })
  action: ApproveActions;

  @Prop({ required: true, type: String })
  createdBy: string;

  @Prop({ type: String })
  memberCode: string;

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

  @Prop({ type: String })
  acceptedBy?: string;

  @Prop({ type: String })
  rejectedBy?: string;

  @Prop({ type: String })
  rejectedReason?: string;

  @Prop({ type: Object })
  oldData?: Record<string, unknown>;

  @Prop({ type: Object })
  newData?: Record<string, unknown>;

  @Prop({ type: Object })
  extraData?: Record<string, unknown>;
}

export const MemberApproveSchema =
  SchemaFactory.createForClass(ApproveDocument);
