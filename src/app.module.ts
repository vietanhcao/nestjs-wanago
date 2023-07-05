import * as Joi from '@hapi/joi';
import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationModule } from './authentication/authentication.module';
import CategoriesModule from './categories/categories.module';
import { ChatModule } from './chat/chat.module';
import { CommentModule } from './comment/comment.module';
import { DatabaseModule } from './database/database.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { EmailSchedulingModule } from './emailScheduling/emailSchedule.module';
import FilesModule from './files/files.module';
import HealthModule from './health/health.module';
import { LocalFilesModule } from './local-files/local-files.module';
import { LogsModule } from './logs/logs.module';
import { OptimizeModule } from './optimize/optimize.module';
import PostsModule from './posts/posts.module';
import SeriesModule from './series/series.module';
import { ServiceApproveModule } from './service-approve/service-approve.module';
import { ServiceOtpModule } from './service-otp/service-otp.module';
import { RBACModule } from './service-rbac/service-rbac.module';
import { ShutdownService } from './shutdown.service';
import { CustomThrottlerGuard } from './utils/guards/throttler.guard';
import LogsMiddleware from './utils/logs.middleware';
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // Giới hạn số request có thể truy cập trong thời gian ttl
    }),

    // The  ConfigModule built into NestJS supports @hapi/joi that we can use to define a validation schema.
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGO_USERNAME: Joi.string().required(),
        MONGO_PASSWORD: Joi.string().required(),
        MONGO_DATABASE: Joi.string().required(),
        MONGO_HOST: Joi.string().required(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),

        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),

        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
        AWS_PRIVATE_BUCKET_NAME: Joi.string().required(),

        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),

        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),

        JWT_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        EMAIL_CONFIRMATION_URL: Joi.string().required(),

        GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),

        UPLOADED_FILES_DESTINATION: Joi.string().required(),
      }),
    }),

    EventEmitterModule.forRoot(),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
        defaultJobOptions: {
          // removeOnComplete: true,
          // removeOnFail: true,
          backoff: 10000,
          attempts: 2 * 60,
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    PostsModule,
    AuthenticationModule,
    CategoriesModule,
    SeriesModule,
    HealthModule,
    FilesModule,
    ChatModule,
    EmailSchedulingModule,
    CommentModule,
    LogsModule,
    OptimizeModule,
    EmailConfirmationModule,
    DatabaseModule,
    LocalFilesModule,
    ServiceOtpModule,
    ServiceApproveModule,
    RBACModule,
  ],
  controllers: [],
  providers: [
    ShutdownService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
