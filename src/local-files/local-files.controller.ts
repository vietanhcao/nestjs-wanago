import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import ParamsWithId from 'src/utils/paramsWithId';
import { LocalFilesService } from './local-files.service';
import { Response } from 'express';
import { join } from 'path';

@Controller('local-files')
export class LocalFilesController {
  constructor(private readonly localFilesService: LocalFilesService) {}

  @Get(':id')
  async getDatabaseFileById(
    @Param() { id }: ParamsWithId,
    @Res({ passthrough: true }) response: Response, // doing with pipeline
  ) {
    // todo explan flow run
    // - StreamableFile show in client??
    const file = await this.localFilesService.getFileById(id);
    /**
     * @cwd  process.cwd() returns the value of directory where we run the node process
     * @__dirname returns the value of directory where the current running file resides.
     */

    const stream = createReadStream(join(process.cwd(), file.path));
    response.set({
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Type': file.mimetype,
    });
    return new StreamableFile(stream);
  }

  // another way implements but  we strip ourselves of some of the features provided by NestJS.
  // @Get(':id')
  // async getDatabaseFileById(
  //   @Param() { id }: ParamsWithId,
  //   @Res() response: Response, // doing with pipeline
  // ) {
  //   const file = await this.localFilesService.getFileById(id);

  //   const stream = createReadStream(join(process.cwd(), file.path));
  //   response.set({
  //     'Content-Disposition': `inline; filename="${file.filename}"`,
  //     'Content-Type': file.mimetype,
  //   });
  //   stream.pipe(response);
  // }
}
