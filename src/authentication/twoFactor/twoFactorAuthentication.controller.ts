import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import Resolve from '../../common/helpers/Resolve';
import UsersService from '../../users/users.service';
import { AuthenticationService } from '../authentication.service';
import TwoFactorAuthenticationCodeDto from '../dto/twoFactor.dto';
import RequestWithUser from '../requestWithUser.interface';
import JwtAuthenticationGuard from '../token/jwt-authentication.guard';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { Response } from 'express';

@Controller('2fa')
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthenticationGuard)
  async register(@Req() request: RequestWithUser) {
    const { otpauthUrl, secret } =
      await this.twoFactorAuthenticationService.generateAuthenticationSecret(
        request.user,
      );

    // return this.twoFactorAuthenticationService.pipeQrCodeStream(
    //   response,
    //   otpauthUrl,
    // );
    const buffer = await this.twoFactorAuthenticationService.toBuffer(
      otpauthUrl,
    );
    return Resolve.ok(0, 'Success', { buffer, secret });
  }

  @Post('generate-with-stream-file') // for development
  @UseGuards(JwtAuthenticationGuard)
  async registerWithStreamFile(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateAuthenticationSecret(
        request.user,
      );

    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl,
    );
  }

  @Post('turn-on')
  @UseGuards(JwtAuthenticationGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAutheticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong twoFactorAuthentication Code');
    }
    await this.usersService.turnOnTwoFactorAuthentication(request.user._id);
    return Resolve.ok(0, 'Success');
  }

  @Post('authenticate')
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAutheticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong twoFactorAuthentication Code');
    }

    const { user } = request;
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user.id, true);
    const refreshTokenCookie =
      this.authenticationService.getCookieWithJwtRefreshToken(user.id, true);

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
    // response cookie and token
    return Resolve.ok(200, 'Success', {
      user,
      accessToken: accessTokenCookie.token,
      refreshToken: refreshTokenCookie.token,
    });
  }
}
