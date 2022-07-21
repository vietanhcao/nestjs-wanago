import * as Joi from '@hapi/joi';
import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import CategoriesModule from './categories/categories.module';
import { ChatModule } from './chat/chat.module';
import { CommentModule } from './comment/comment.module';
import { DatabaseModule } from './database/database.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { EmailSchedulingModule } from './emailScheduling/emailSchedule.module';
import FilesModule from './files/files.module';
import { GoogleAuthenticationModule } from './google-authentication/google-authentication.module';
import HealthModule from './health/health.module';
import { LogsModule } from './logs/logs.module';
import { OptimizeModule } from './optimize/optimize.module';
import PostsModule from './posts/posts.module';
import SeriesModule from './series/series.module';
import { ExceptionsLoggerFilter } from './utils/exceptionsLogger.filter';
import { LocalFilesModule } from './local-files/local-files.module';
import LogsMiddleware from './utils/logs.middleware';

@Module({
  imports: [
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
    GoogleAuthenticationModule,
    DatabaseModule,
    LocalFilesModule,
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
