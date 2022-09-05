import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailProcessor } from './email.processor';
import { MailController } from './email.controller';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync({
      name: 'mailsend', // mail queue name
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          transport: {
            service: configService.get('EMAIL_SERVICE'),
            host: 'smtp.gmail.com',
            secure: false,
            port: 587,
            pool: true,
            maxConnections: 20,
            maxMessages: Infinity,
            auth: {
              user: configService.get('EMAIL_USER'),
              pass: configService.get('EMAIL_PASSWORD'),
            },
          },
          defaults: {
            from: '"test" <noreply@test.com.vn>',
          },
          template: {
            /**
              process.cwd() returns the value of directory where we run the node process, whereas
              __dirname returns the value of directory where the current running file resides.
             * */
            dir: process.cwd() + '/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  controllers: [MailController],
  providers: [EmailService, MailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
