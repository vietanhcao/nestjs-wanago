import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Logs, LogSchema } from './logs.schema';
import { LogsService } from './logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logs.name, schema: LogSchema }]),
  ],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
