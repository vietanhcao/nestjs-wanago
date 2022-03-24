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
import JwtAuthenticationGuard from '../authentication/token/jwt-authentication.guard';
import RequestWithUser from '../authentication/requestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import ParamsWithId from '../utils/paramsWithId';
import { imageFileFilter } from 'src/files/helpers/file_upload.utils';
import Resolve from 'src/common/helpers/Resolve';
import {
  Client,
  ClientNats,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { UserClientOptions } from './user.options';

@Controller()
export class UsersController {
  // @Client(UserClientOptions)
  // private client: ClientNats;
  constructor(private readonly usersService: UsersService) {
    console.log('UsersController');
  }

  @EventPattern('account.usersService.getByEmail')
  async userGetByEmail(@Payload() value) {
    return this.usersService.getByEmail(value);
  }

  @MessagePattern('account.usersService.createUser')
  async userCreateUser(@Payload() value) {
    return this.usersService.create(value);
  }

  // @Post('files')
  // @UseGuards(JwtAuthenticationGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // async addPrivateFile(
  //   @Req() request: RequestWithUser,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   const response = await this.usersService.addPrivateFile(
  //     file.buffer,
  //     file.originalname,
  //     request.user.id,
  //   );
  //   return Resolve.ok(0, 'Success', response);
  // }

  // @Get('files')
  // @UseGuards(JwtAuthenticationGuard)
  // async getAllPrivateFiles(@Req() request: RequestWithUser) {
  //   return this.usersService.getAllPrivateFiles(request.user.id);
  // }

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

  // @Post('avatar')
  // @UseGuards(JwtAuthenticationGuard)
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     fileFilter: imageFileFilter,
  //     limits: {
  //       fileSize: 1 * 1e6, // 1 MB
  //     },
  //   }),
  // )
  // async addAvatar(
  //   @Req() request: RequestWithUser,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   const response = await this.usersService.addAvatar(
  //     request.user.id,
  //     file.buffer,
  //     file.originalname,
  //   );

  //   return Resolve.ok(0, 'Success', response);
  // }

  // @Delete('avatar')
  // @UseGuards(JwtAuthenticationGuard)
  // async deleteAvatar(@Req() request: RequestWithUser) {
  //   await this.usersService.deleteAvatar(request.user.id);
  //   return Resolve.ok(0, 'Success');
  // }
}
