import { Body, Controller, Post, Req } from '@nestjs/common';
import { TokenVerificationDto } from './tokenVerification.dto';
import Resolve from '../common/helpers/Resolve';
import { Request } from 'express';
import { GoogleAuthenticationService } from './google-authentication.service';

@Controller('google-authentication')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}
  @Post()
  async authenticate(
    @Body() tokenData: TokenVerificationDto,
    @Req() request: Request,
  ) {
    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.googleAuthenticationService.authenticate(tokenData.token);

    //set cookie
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
}
