import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    switch (exception.code) {
      case 11000:
        return {
          status: HttpStatus.CONFLICT,
          path: request.topic,
          timestamp: new Date().getTime(),
          mongoError: {
            code: exception.code,
            property: exception['keyValue'],
          },
        };
      default:
        return {
          status: HttpStatus.CONFLICT,
          path: request.topic,
          timestamp: new Date().getTime(),
          mongoError: { code: exception.code },
        };
    }
  }
}
