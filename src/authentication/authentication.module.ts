import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as redisStore from 'cache-manager-redis-store';
import { EmailConfirmationModule } from '../email-confirmation/email-confirmation.module';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { GoogleAuthenticationController } from './google-authentication/google-authentication.controller';
import { GoogleAuthenticationService } from './google-authentication/google-authentication.service';
import { LocalStrategy } from './local.strategy';
import { JwtRefreshTokenStrategy } from './token/jwt-refresh.strategy';
import { JwtStrategy } from './token/jwt.strategy';
import { JwtTwoFactorStrategy } from './twoFactor/jwt-two-factor.strategy';
import { TwoFactorAuthenticationController } from './twoFactor/twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactor/twoFactorAuthentication.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    EmailConfirmationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`,
        },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 120,
      }),
    }),
  ], // imports to use in file service
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    TwoFactorAuthenticationService,
    JwtTwoFactorStrategy,
    GoogleAuthenticationService,
  ], // imports to use in file controllers
  controllers: [
    AuthenticationController,
    TwoFactorAuthenticationController,
    GoogleAuthenticationController,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
