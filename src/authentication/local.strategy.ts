import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { StrategyKey } from '../common/constant';
import { UserDocument } from '../users/schema/user.schema';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  StrategyKey.LOCAL.ADMIN,
) {
  constructor(private authenticationService: AuthenticationService) {
    super({
      usernameField: 'email', // default is username but we change to email
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserDocument> {
    return this.authenticationService.getAuthenticatedUser(email, password);
  }
}
