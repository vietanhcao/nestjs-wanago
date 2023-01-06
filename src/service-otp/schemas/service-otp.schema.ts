import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

/**
 * @description có thể dùng db để lưu thông tin otp
 */
@Schema({ timestamps: true, collection: 'otps' })
export class OtpDocument extends Document {
  @Prop({ required: true, type: String, index: true })
  verifyEventCallback: string;

  @Prop({ type: SchemaTypes.Types.Mixed })
  payload: SchemaTypes.Types.Mixed;

  @Prop({ required: true, type: Date, index: true, expires: '5m' }) // lưu vào db và tự động xóa sau 5 phút
  expireDate: Date;

  @Prop({ type: String, index: true })
  otp: string;

  @Prop({ required: true, type: String, index: true, unique: true })
  session: string;

  @Prop({ required: true, type: String, index: true })
  investorCode: string;
}

export const otpSchema = SchemaFactory.createForClass(OtpDocument);
