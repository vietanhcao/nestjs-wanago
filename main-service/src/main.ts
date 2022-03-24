import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { config } from 'aws-sdk';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './chat/adapters/redisIoAdapter';
import { AllExceptionsFilter } from './common/exceptions/all-exception.filter';
import { MongoExceptionFilter } from './common/exceptions/mongo-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  ValidationException,
  ValidationExceptionFilter,
} from './common/exceptions/validation-exception.filter';
import { ExcludeNullInterceptor } from './utils/excludeNull.interceptor';
import getLogLevels from './utils/getLogLevels';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //We don’t use the ConfigService above to read the environment variables because it isn’t initialized yet.
    logger: getLogLevels(process.env.NODE_ENV === 'production'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      skipMissingProperties: false,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationException(errors),
    }),
  );
  // Todo: Use exception filter

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  // app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(new MongoExceptionFilter());

  app.setGlobalPrefix('/api');

  app.use(morgan('tiny'));
  app.use(cookieParser());

  // config aws
  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  // await app.listen(3000);
  app.useWebSocketAdapter(new RedisIoAdapter(app, configService));

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: 'nats://localhost:4222',
        queue: 'MAIN_QUEUE',
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  await app.listen(3600, '0.0.0.0');
  // console.log(`SERVER (${process.pid}) IS RUNNING ON `, 3600);
}

if (isNaN(parseInt('3600'))) {
  console.error('No port provided. 👏');
  process.exit(666);
}

bootstrap().then(() => console.log('Service listening 👍: ', 3600));

// run cluster
// runInCluster(bootstrap);
