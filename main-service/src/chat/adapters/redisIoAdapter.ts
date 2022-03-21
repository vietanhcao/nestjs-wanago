import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { RedisClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter } from 'socket.io-redis';

export class RedisIoAdapter extends IoAdapter {
  constructor(app, private readonly configService: ConfigService) {
    // Or simply get the ConfigService in here, since you have the `app` instance anyway
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    const pubClient = new RedisClient({
      host: this.configService.get('REDIS_HOST'),
      port: parseInt(this.configService.get('REDIS_PORT')),
    });
    const subClient = pubClient.duplicate();
    const redisAdapter = createAdapter({ pubClient, subClient });

    server.adapter(redisAdapter);
    return server;
  }
}
