import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { UsersModule } from 'src/users/users.module';
import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';

@Module({
  imports: [JwtModule.register({}), EmailModule, UsersModule, ConfigModule],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
