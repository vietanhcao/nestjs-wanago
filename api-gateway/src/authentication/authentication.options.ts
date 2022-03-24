import { ClientOptions, Transport } from '@nestjs/microservices';

export const ExportAuthenticationNatClient: ClientOptions = {
  transport: Transport.NATS,
  options: {
    servers: 'nats://localhost:4222',
  },
};
