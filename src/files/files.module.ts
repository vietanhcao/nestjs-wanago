import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import FilesController from './files.controller';
import FilesService from './files.service';
import { Files, FilesSchema } from './files.schema';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Files.name, schema: FilesSchema }]),
  ],
  // controllers: [FilesController],
  providers: [FilesService, ConfigService],
  exports: [FilesService], // export to another module used
})
class FilesModule {}

export default FilesModule;
