import { Transport, ClientOptions } from '@nestjs/microservices';

export const UserClientOptions: ClientOptions = {
  transport: Transport.NATS,
  options: {
    servers: 'nats://localhost:4222',
  },
};
