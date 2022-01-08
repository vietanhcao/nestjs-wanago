import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import getLogLevels from './utils/getLogLevels';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //We don’t use the ConfigService above to read the environment variables because it isn’t initialized yet.
    logger: getLogLevels(process.env.NODE_ENV === 'production'),
  });
  app.use(morgan('tiny'));
  app.use(cookieParser());
  // await app.listen(3000);
  await app.listen(process.env.PORT, '0.0.0.0');
}

if (isNaN(parseInt(process.env.PORT))) {
  console.error('No port provided. 👏');
  process.exit(666);
}
bootstrap().then(() => console.log('Service listening 👍: ', process.env.PORT));
