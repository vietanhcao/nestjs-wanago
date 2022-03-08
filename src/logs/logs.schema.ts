import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform } from 'class-transformer';
import LeverLog from './leverLog.enum';

export type LogsDocument = Logs & Document;

@Schema({ timestamps: true, autoIndex: true })
export class Logs {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  bodyString: string;

  @Prop()
  method: string;

  @Prop()
  originalUrl: string;

  @Prop()
  statusCode: string;

  @Prop()
  responseTime: string;

  @Prop()
  userAgent: string;

  @Prop()
  statusMessage: string;

  @Prop()
  ip: string;

  @Prop({ enum: LeverLog })
  level: LeverLog;
}

export const LogSchema = SchemaFactory.createForClass(Logs);
