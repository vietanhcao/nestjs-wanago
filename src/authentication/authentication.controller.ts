import {
  Body,
  CacheStore,
  CACHE_MANAGER,
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
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CacheBuilder } from 'src/common/builder/cache.builder';
import { StrategyKey } from '../common/constant';
import Resolve from '../common/helpers/Resolve';
import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service';
import UsersService from '../users/users.service';
import ParamsWithId from '../utils/paramsWithId';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import Role from './enum/role.enum';
import RoleGuard from './guards/role.guard';
import RequestWithUser from './requestWithUser.interface';
import { JwtRefreshGuard } from './token/jwtRefreshAuthentication.guard';
import JwtTwoFactorGuard from './twoFactor/jwt-two-factor.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService, // import another service
    private readonly emailConfirmationService: EmailConfirmationService, // import another service
    @Inject(CACHE_MANAGER)
    private readonly cacheStore: CacheStore,
  ) {}

  //dto validation
  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() registrationData: RegisterDto) {
    await this.authenticationService.register(registrationData);
    await this.emailConfirmationService.sendVerificationLink(
      registrationData.email,
    );
    return Resolve.ok(200, 'Success');
  }

  /**
   * @desc  @LocalAuthenticationGuard will be triggered @LocalStrategy => @getAuthenticatedUser => user per request
   * @route Post /authentication/log-in
   * @access public
   */
  // @UseGuards(LocalAuthenticationGuard)
  @UseGuards(AuthGuard(StrategyKey.LOCAL.ADMIN))
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user.id);
    const refreshTokenCookie =
      this.authenticationService.getCookieWithJwtRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user.id,
    );
    request.res.setHeader('Set-Cookie', [
      accessTokenCookie.cookie,
      refreshTokenCookie.cookie,
    ]);
    //remove password
    user.password = undefined;
    // check two factor authentication
    if (user.isTwoFactorAuthenticationEnabled) {
      return Resolve.ok(200, 'Success', {
        isTwoFactorAuthenticationEnabled: true,
        accessToken: accessTokenCookie.token,
        refreshToken: refreshTokenCookie.token,
      });
    }

    // response cookie and token;
    return Resolve.ok(200, 'Success', {
      user,
      accessToken: accessTokenCookie.token,
      refreshToken: refreshTokenCookie.token,
    });
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
  @UseGuards(JwtTwoFactorGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    await this.usersService.removeRefreshToken(request.user.id);
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookiesForLogOut(),
    );
    return response.json(Resolve.ok(200, 'success'));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get()
  async authenticate(@Req() request: RequestWithUser) {
    // cache builder
    const builder = new CacheBuilder();
    const callback = () => {
      return request.user;
    };
    const cacheKey = `authentication:${request.user.email}`;
    const user = await builder
      .setCacheKey(cacheKey)
      .setCacheStore(this.cacheStore)
      .setCallback(callback)
      .ttl(60 * 60)
      .build<string>();

    return Resolve.ok(200, 'Success', user);
  }

  @UseGuards(JwtTwoFactorGuard)
  @UseGuards(RoleGuard(Role.Admin))
  @Delete(':id')
  async deletePost(@Param() { id }: ParamsWithId) {
    await this.authenticationService.deleteUserById(id);
    return Resolve.ok(200, 'Success');
  }
}
