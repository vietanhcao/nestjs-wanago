import { Injectable } from '@nestjs/common';
import { Logs, LogsDocument } from './logs.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import CreateLogDto from './dto/createLog.dto';

@Injectable()
export class LogsService {
  constructor(@InjectModel(Logs.name) private logsModel: Model<LogsDocument>) {}

  async createLog(logData: CreateLogDto) {
    const createdLog = new this.logsModel({
      ...logData,
    });
    return createdLog.save();
  }
}
