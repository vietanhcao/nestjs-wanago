import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const { ip, method, originalUrl, hostname } = request;
    const userAgent = request.get('user-agent') || '';
    const startAt = process.hrtime();

    response.on('finish', () => {
      const { statusCode, statusMessage } = response;
      const contentLength = response.get('content-length');
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;

      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage} ${responseTime} ms ${contentLength} - ${userAgent} ${ip} `;

      if (statusCode >= 500) {
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        return this.logger.warn(message);
      }

      return this.logger.log(message);
    });

    next();
  }
}

export default LogsMiddleware;
