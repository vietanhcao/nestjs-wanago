import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocalFiles, LocalFilesSchema } from './local-files.chema';
import { LocalFilesService } from './local-files.service';
import { LocalFilesController } from './local-files.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LocalFiles.name, schema: LocalFilesSchema },
    ]),
  ],
  providers: [LocalFilesService],
  exports: [LocalFilesService],
  controllers: [LocalFilesController],
})
export class LocalFilesModule {}
