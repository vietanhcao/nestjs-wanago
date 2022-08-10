import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import LeverLog from '../logs/leverLog.enum';
import { LogsService } from '../logs/logs.service';

@Injectable()
class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  constructor(private readonly logsService: LogsService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startAt = process.hrtime();
    response.on('finish', async () => {
      const { ip, method, originalUrl, body } = request;
      const userAgent = request.get('user-agent') || '';
      const bodyString = JSON.stringify(body) || '';
      const { statusCode, statusMessage } = response;
      const contentLength = response.get('content-length');
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage} ${responseTime} ms ${contentLength} - ${userAgent} ${ip} `;

      // response took more than 10 seconds
      if (responseTime > 10000) {
        this.logsService.createLog({
          bodyString,
          method,
          originalUrl,
          statusCode: `${statusCode}`,
          responseTime: `${responseTime.toFixed(10)}`,
          userAgent,
          statusMessage,
          ip: `${ip}`,
          level: LeverLog.log,
        });
      }
      if (statusCode >= 500) {
        this.logsService.createLog({
          bodyString,
          method,
          originalUrl,
          statusCode: `${statusCode}`,
          responseTime: `${responseTime.toFixed(10)}`,
          userAgent,
          statusMessage,
          ip: `${ip}`,
          level: LeverLog.error,
        });
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        this.logsService.createLog({
          bodyString,
          method,
          originalUrl,
          statusCode: `${statusCode}`,
          responseTime: `${responseTime.toFixed(10)}`,
          userAgent,
          statusMessage,
          ip: `${ip}`,
          level: LeverLog.warn,
        });
        return this.logger.warn(message);
      }

      return this.logger.log(message);
    });

    next();
  }
}

export default LogsMiddleware;
