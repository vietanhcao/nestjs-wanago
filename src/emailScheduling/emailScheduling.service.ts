import { Injectable, Logger } from '@nestjs/common';
import EmailService from '../email/email.service';
import EmailScheduleDto from './dto/emailSchedule.dto';
import {
  Cron,
  CronExpression,
  Interval,
  SchedulerRegistry,
} from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export default class EmailSchedulingService {
  private readonly logger = new Logger(EmailSchedulingService.name);
  constructor(
    private readonly emailService: EmailService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  scheduleEmail(emailSchedule: EmailScheduleDto) {
    const date = new Date(emailSchedule.date);
    const job = new CronJob(date, () => {
      this.emailService.sendMail({
        to: emailSchedule.recipient,
        subject: emailSchedule.subject,
        text: emailSchedule.content,
      });
    });

    this.schedulerRegistry.addCronJob(
      `${Date.now()}-${emailSchedule.subject}`,
      job,
    );
    job.start();
  }

  // ToDO create corn job do some thing

  // @Cron('* * * * *')
  // handleCron() {
  //   this.logger.debug('Called when the current second is *');
  // }

  // @Cron(CronExpression.EVERY_SECOND, {
  //   name: 'notifications',
  //   timeZone: 'Europe/Paris',
  // })
  // handleCron() {
  //   this.logger.debug('Called every seconds');
  // }

  // @Interval(1000)
  // handleInterval() {
  //   this.logger.debug('Called every 10 seconds');
  // }

  cancelAllScheduledEmails() {
    this.schedulerRegistry.getCronJobs().forEach((job) => {
      job.stop();
    });
  }

  cancelcheduledByName(name: string) {
    const job = this.schedulerRegistry.getCronJob(name); // getCronJob("notifications");

    job.stop();
    console.log(job.lastDate());
  }
  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
  }

  // @Interval(1000)
  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates().toDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      this.logger.log(`job: ${key} -> next: ${next}`);
    });
  }
}
