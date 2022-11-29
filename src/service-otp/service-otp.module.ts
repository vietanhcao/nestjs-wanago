import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { ServiceOtpService } from './service-otp.service';
import { EmailModule } from '../email/email.module';
import { ServiceOtpController } from './service-opt.controller';

@Module({
  imports: [
    EmailModule,
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
  ],
  controllers: [ServiceOtpController],
  providers: [ServiceOtpService],
  exports: [ServiceOtpService],
})
export class ServiceOtpModule {}
