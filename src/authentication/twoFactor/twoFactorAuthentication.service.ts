import { Injectable } from '@nestjs/common';
import UsersService from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/schema/user.schema';
import { authenticator } from 'otplib';
import { Response } from 'express';
import { toBuffer, toFileStream } from 'qrcode';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  public async generateAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      secret,
    );

    await this.userService.setTwoFactorAuthenticationSecret(
      secret,
      user._id?.toString(),
    );
    return {
      secret,
      otpauthUrl,
    };
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  public async toBuffer(otpauthUrl: string) {
    return toBuffer(otpauthUrl);
  }

  public isTwoFactorAutheticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}
