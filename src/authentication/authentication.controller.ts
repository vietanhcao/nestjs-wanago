import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Res,
  Get,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { Response } from 'express';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import MongooseClassSerializerInterceptor from 'src/utils/mongooseClassSerializer.interceptor';
import { User } from 'src/users/user.schema';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  //dto validation
  @Post('register')
  @UsePipes(ValidationPipe)
  @UseInterceptors(MongooseClassSerializerInterceptor(User)) //enable exclude the password when returning the data of the user.
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  /**
   * @desc  @LocalAuthenticationGuard will be triggered @LocalStrategy => @getAuthenticatedUser => user per request
   * @route Post /authentication/log-in
   * @access public
   */
  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
    const token = this.authenticationService.getJwtToken(user.id);
    response.setHeader('Set-Cookie', cookie);
    //remove password
    user.password = undefined;
    // response cookie and token
    return response.json({ user, token });
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    return response.sendStatus(200);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  @UseInterceptors(MongooseClassSerializerInterceptor(User)) //enable exclude the password when returning the data of the user.
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    // user.password = undefined;
    return user;
  }
}
