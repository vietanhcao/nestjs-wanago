import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtAuthenticationGuard from '../authentication/token/jwt-authentication.guard';
import RequestWithUser from '../authentication/requestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import ParamsWithId from '../utils/paramsWithId';
import FilesService from './files.service';
import { imageFileFilter } from './helpers/file_upload.utils';
import { dataSelectCity } from 'src/common/dataDefault';
import Resolve from 'src/common/helpers/Resolve';

@Controller('resource')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/image')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 1 * 1e6, // 1 MB
      },
    }),
  )
  async uploadImage(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Upfile lỗi!');
    const response = await this.filesService.uploadPrivateFile(
      file.buffer,
      file.originalname,
      request.user.id,
    );
    return Resolve.ok(0, 'Success', response);
  }

  @Post('upload/image-public')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 1 * 1e6, // 1 MB
      },
    }),
  )
  async uploadImagePublic(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Upfile lỗi!');
    const response = await this.filesService.uploadPublicFile(
      file.buffer,
      file.originalname,
      request.user.id,
    );
    return Resolve.ok(0, 'Success', response);
  }

  @Get('files/:id')
  // @UseGuards(JwtAuthenticationGuard)
  async getPrivateFile(
    // @Req() request: RequestWithUser,
    @Param() { id }: ParamsWithId,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getPrivateFile(id);
    file.stream.pipe(res);
  }

  @Get('select-city')
  async getSelectCity() {
    return Resolve.ok(0, 'Success', dataSelectCity);
  }

  // @Get('files/:id')
  // @UseGuards(JwtAuthenticationGuard)
  // async getPrivateFile(
  //   @Req() request: RequestWithUser,
  //   @Param() { id }: ParamsWithId,
  //   @Res() res: Response,
  // ) {
  //   const file = await this.usersService.getPrivateFile(request.user._id, id);
  //   file.stream.pipe(res);
  // }

  // @Delete('avatar')
  // @UseGuards(JwtAuthenticationGuard)
  // async deleteAvatar(@Req() request: RequestWithUser) {
  //   return this.usersService.deleteAvatar(request.user.id);
  // }
}
