import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import FilesController from './files.controller';
import FilesService from './files.service';
import { Files, FilesSchema } from './files.schema';
import { ConfigService } from '@nestjs/config';
import { PrivateFile, PrivateFileSchema } from './privateFiles.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Files.name, schema: FilesSchema },
      { name: PrivateFile.name, schema: PrivateFileSchema },
    ]),
  ],
  // controllers: [FilesController],
  providers: [FilesService, ConfigService],
  exports: [FilesService], // export to another module used
})
class FilesModule {}

export default FilesModule;
