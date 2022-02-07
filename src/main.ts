import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import getLogLevels from './utils/getLogLevels';
import * as morgan from 'morgan';
import { ExceptionsLoggerFilter } from './utils/exceptionsLogger.filter';
import { config } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { runInCluster } from './utils/runInCluster';
import { RedisIoAdapter } from './chat/adapters/redisIoAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //We don’t use the ConfigService above to read the environment variables because it isn’t initialized yet.
    logger: getLogLevels(process.env.NODE_ENV === 'production'),
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionsLoggerFilter(httpAdapter));

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

  await app.listen(process.env.PORT, '0.0.0.0');
  console.log(`SERVER (${process.pid}) IS RUNNING ON `, process.env.PORT);
}

if (isNaN(parseInt(process.env.PORT))) {
  console.error('No port provided. 👏');
  process.exit(666);
}
bootstrap().then(() => console.log('Service listening 👍: ', process.env.PORT));

// run cluster
// runInCluster(bootstrap);
