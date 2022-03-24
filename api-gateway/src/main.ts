import { ValidationError, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
// import { RedisIoAdapter } from './chat/adapters/redisIoAdapter';
import { AllExceptionsFilter } from './common/exceptions/all-exception.filter';
import { ValidationException } from './common/exceptions/validation-exception.filter';
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
  // app.useGlobalFilters(new MongoExceptionFilter());

  app.setGlobalPrefix('/api');

  app.use(morgan('tiny'));
  app.use(cookieParser());

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: 'nats://localhost:4222',
        queue: 'APIGW_QUEUE',
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  await app.listen(process.env.PORT, '0.0.0.0');
  // console.log(`SERVER (${process.pid}) IS RUNNING ON `, process.env.PORT);
}

if (isNaN(parseInt(process.env.PORT))) {
  console.error('No port provided. 👏');
  process.exit(666);
}
bootstrap().then(() => console.log('Service listening 👍: ', process.env.PORT));
