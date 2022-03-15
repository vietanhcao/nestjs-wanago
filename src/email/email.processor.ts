import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from './email.service';

@Processor('mailsend')
export class MailProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly mailService: EmailService) {}

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processor:@OnQueueActive - Processing job ${job.id} of type ${
        job.name
      }. Data: ${JSON.stringify(job.data)}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    console.log(
      `Processor:@OnQueueCompleted - Completed job ${job.id} of type ${job.name}.`,
    );
    job.remove();
  }

  @OnQueueFailed()
  onError(job: Job<any>, error) {
    console.log(
      `Processor:@OnQueueFailed - Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process('confirmation')
  async sendWelcomeEmail(job: Job): Promise<any> {
    console.log('Processor:@Process - Sending confirmation email.');

    try {
      const result = await this.mailService.sendMail(job.data);
      return result;
    } catch (error) {
      this.logger.error('Failed to send confirmation email.', error.stack);
      throw error;
    }
  }
}
