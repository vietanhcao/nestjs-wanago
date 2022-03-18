import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import EmailDto from './email.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('mailsend')
    private mailQueue: Queue,
    private readonly mailerService: MailerService,
  ) {}

  async sendConfirmationEmail(email: EmailDto): Promise<boolean> {
    try {
      this.mailQueue.add('confirmation', email);
      return true;
    } catch (err) {
      console.log('Error queueing confirmation email to user.');
      return false;
    }
  }

  public async sendMail(data: EmailDto) {
    return this.mailerService
      .sendMail({
        to: data.recipient,
        from: 'jwy9724@gmail.com',
        subject: data.subject,
        text: data.content,
        html: `<b>${data.content}</b>`, // HTML body content
      })
      .then((success) => {
        console.log(success, 'Mail sent successfully.');
        return success;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

// import { Injectable } from '@nestjs/common';
// import { createTransport } from 'nodemailer';
// import * as Mail from 'nodemailer/lib/mailer';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export default class EmailService {
//   private nodemailerTransport: Mail;

//   constructor(private readonly configService: ConfigService) {
//     this.nodemailerTransport = createTransport({
//       service: configService.get('EMAIL_SERVICE'),
//       host: 'smtp.gmail.com',
//       secure: false,
//       auth: {
//         user: configService.get('EMAIL_USER'),
//         pass: configService.get('EMAIL_PASSWORD'),
//       },
//     });
//   }

//   sendMail(options: Mail.Options) {
//     return this.nodemailerTransport.sendMail(options);
//   }
// }
