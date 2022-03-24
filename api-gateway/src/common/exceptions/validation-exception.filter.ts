import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends UnprocessableEntityException {
  constructor(public validationErrors: ValidationError[]) {
    super();
  }
}

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    return {
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      resCode: HttpStatus.UNPROCESSABLE_ENTITY,
      timestamp: new Date().getTime(),
      path: request.url,
      message: exception.message,
      validations: exception.validationErrors,
    };
  }
}
