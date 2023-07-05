import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationService } from '../authentication.service';
import { User } from '../../users/schema/user.schema';
import UsersService from '../../users/users.service';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: OAuth2Client;
  clientID: string;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.clientID = clientID;
    this.oauthClient = new OAuth2Client(clientID, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const tokenInfo = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: this.clientID,
      });
      const tokenPayload = tokenInfo.getPayload();

      if (!tokenPayload) {
        // check wrong token
        throw new UnauthorizedException('Invalid credentials.');
      }

      const email = tokenPayload.email;

      try {
        const user = await this.usersService.getByEmail(email);
        return this.handleRegisteredUser(user);
      } catch (error) {
        // not found email will register User
        return this.registerUser(tokenPayload);
      }
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid credentials.');
    }
  }

  async getCookiesForUser(user: User) {
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(
        user._id.toString(),
      );
    const refreshTokenCookie =
      this.authenticationService.getCookieWithJwtRefreshToken(
        user._id.toString(),
      );

    await this.usersService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user._id.toString(),
    );

    return { accessTokenCookie, refreshTokenCookie };
  }

  async handleRegisteredUser(user: User) {
    const { accessTokenCookie, refreshTokenCookie } =
      await this.getCookiesForUser(user);
    return {
      accessTokenCookie,
      refreshTokenCookie,
      user,
    };
  }

  async registerUser(tokenPayload: TokenPayload | undefined) {
    try {
      const { name, email } = tokenPayload;
      const user = await this.usersService.createWithGoogle(email, name);
      return this.handleRegisteredUser(user);
    } catch (error) {
      console.log(error);
    }
  }
}
