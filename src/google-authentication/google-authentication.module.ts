import { Module } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { GoogleAuthenticationController } from './google-authentication.controller';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [UsersModule, ConfigModule, AuthenticationModule], // imports to use in file service
  providers: [GoogleAuthenticationService],
  controllers: [GoogleAuthenticationController],
})
export class GoogleAuthenticationModule {}
