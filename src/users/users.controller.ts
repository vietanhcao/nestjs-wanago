import UsersService from './users.service';
import {
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
import RequestWithUser from '../authentication/requestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import ParamsWithId from '../utils/paramsWithId';
import { imageFileFilter } from 'src/files/helpers/file_upload.utils';
import Resolve from 'src/common/helpers/Resolve';
import JwtTwoFactorGuard from 'src/authentication/twoFactor/jwt-two-factor.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('files')
  @UseGuards(JwtTwoFactorGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addPrivateFile(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const response = await this.usersService.addPrivateFile(
      file.buffer,
      file.originalname,
      request.user.id,
    );
    return Resolve.ok(0, 'Success', response);
  }

  @Get('files')
  @UseGuards(JwtTwoFactorGuard)
  async getAllPrivateFiles(@Req() request: RequestWithUser) {
    return this.usersService.getAllPrivateFiles(request.user.id);
  }

  @Get('files/:id')
  @UseGuards(JwtTwoFactorGuard)
  async getPrivateFile(
    @Req() request: RequestWithUser,
    @Param() { id }: ParamsWithId,
    @Res() res: Response,
  ) {
    const file = await this.usersService.getPrivateFile(request.user._id, id);
    file.stream.pipe(res);
  }

  @Post('avatar')
  @UseGuards(JwtTwoFactorGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 1 * 1e6, // 1 MB
      },
    }),
  )
  async addAvatar(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const response = await this.usersService.addAvatar(
      request.user.id,
      file.buffer,
      file.originalname,
    );

    return Resolve.ok(0, 'Success', response);
  }

  @Delete('avatar')
  @UseGuards(JwtTwoFactorGuard)
  async deleteAvatar(@Req() request: RequestWithUser) {
    await this.usersService.deleteAvatar(request.user.id);
    return Resolve.ok(0, 'Success');
  }
}
