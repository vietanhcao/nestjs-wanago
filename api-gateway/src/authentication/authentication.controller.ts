import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Client,
  ClientNats,
  ClientProxy,
  Transport,
} from '@nestjs/microservices';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import Resolve from 'src/common/helpers/Resolve';
// import { EmailConfirmationService } from 'src/email-confirmation/email-confirmation.service';
import ParamsWithId from 'src/utils/paramsWithId';
import { ExportAuthenticationNatClient } from './authentication.options';
// import UsersService from '../users/users.service';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import Role from './enum/role.enum';
import RoleGuard from './guards/role.guard';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './token/jwt-authentication.guard';
import { JwtRefreshGuard } from './token/jwtRefreshAuthentication.guard';

@Controller('authentication')
export class AuthenticationController {
  @Client(ExportAuthenticationNatClient)
  client: ClientNats;
  constructor(
    private readonly authenticationService: AuthenticationService, // private readonly usersService: UsersService, // import another service // private readonly emailConfirmationService: EmailConfirmationService, // import another service
  ) {}

  //dto validation
  @Post('register')
  @UsePipes(ValidationPipe)
  // @UseInterceptors(MongooseClassSerializerInterceptor(User)) //enable exclude the password when returning the data of the user.
  async register(@Body() registrationData: RegisterDto) {
    const response = await this.authenticationService.register(
      registrationData,
    );

    // this.client.send(
    //   'email-confirmation.emailConfirmationService.sendVerificationLink',
    //   registrationData.email,
    // );
    // await this.emailConfirmationService.sendVerificationLink(
    //   registrationData.email,
    // );
    return Resolve.ok(200, 'Success', response);
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
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user.id);
    const refreshTokenCookie =
      this.authenticationService.getCookieWithJwtRefreshToken(user.id);

    // await this.usersService.setCurrentRefreshToken(
    //   refreshTokenCookie.token,
    //   user.id,
    // );
    request.res.setHeader('Set-Cookie', [
      accessTokenCookie.cookie,
      refreshTokenCookie.cookie,
    ]);
    //remove password
    user.password = undefined;
    // response cookie and token
    return response.json(
      Resolve.ok(200, 'Success', {
        user,
        accessToken: accessTokenCookie.token,
        refreshToken: refreshTokenCookie.token,
      }),
    );
  }

  // /**
  //  * @desc  use refresh token to get a new token
  //  * @route Post /authentication/log-in-refresh
  //  * @access public
  //  */
  // @HttpCode(200)
  // @UseGuards(LocalAuthenticationGuard)
  // @Post('log-in-refresh')
  // async logInRefresh(
  //   @Req() request: RequestWithUser,
  //   @Res() response: Response,
  // ) {
  //   const { user } = request;
  //   const accessTokenCookie =
  //     this.authenticationService.getCookieWithJwtAccessToken(user.id);
  //   const refreshTokenCookie =
  //     this.authenticationService.getCookieWithJwtRefreshToken(user.id);
  //   const refreshToken = refreshTokenCookie.token;

  //   await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

  //   request.res.setHeader('Set-Cookie', [
  //     accessTokenCookie.cookie,
  //     refreshTokenCookie.cookie,
  //   ]);
  //   //remove password
  //   user.password = undefined;
  //   // response cookie and token
  //   return response.json({
  //     user,
  //     accessToken: accessTokenCookie.token,
  //     refreshTokenCookie: refreshTokenCookie.token,
  //   });
  // }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(request.user.id);
    request.res.setHeader('Set-Cookie', accessTokenCookie.cookie);

    return Resolve.ok(200, 'success', {
      user: request.user,
      accessToken: accessTokenCookie.token,
    });
  }

  // @UseGuards(JwtAuthenticationGuard)
  // @Post('log-out-refresh')
  // @HttpCode(200)
  // async logOutRefresh(@Req() request: RequestWithUser) {
  //   await this.usersService.removeRefreshToken(request.user.id);
  //   request.res.setHeader(
  //     'Set-Cookie',
  //     this.authenticationService.getCookiesForLogOut(),
  //   );
  //   return Resolve.ok(200, 'success');
  // }

  /**
   * @desc  @JwtAuthenticationGuard will be triggered @jwt.strategy => get user per request
   * @route Post /authentication/log-out
   * @access public
   */
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    // await this.usersService.removeRefreshToken(request.user.id);
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookiesForLogOut(),
    );
    return response.json(Resolve.ok(200, 'success'));
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  // @UseInterceptors(MongooseClassSerializerInterceptor(User)) //enable exclude the password when returning the data of the user.
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    // user.password = undefined;
    return Resolve.ok(200, 'Success', user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @UseGuards(RoleGuard(Role.Admin))
  @Delete(':id')
  async deletePost(@Param() { id }: ParamsWithId) {
    await this.authenticationService.deleteUserById(id);
    return Resolve.ok(200, 'Success');
  }
}
