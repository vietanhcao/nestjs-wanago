import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import UsersService from 'src/users/users.service';
import TokenPayload from '../tokenPayload.interface.d';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // verify by token header
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: TokenPayload) {
    const user = await this.usersService.getById(payload.userId);
    // check case login nomarl
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }

    // check token case login with isSecondFactorAuthenticated
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
}
