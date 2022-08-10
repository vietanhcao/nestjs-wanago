import { Body, Controller, UseGuards, Post } from '@nestjs/common';
import JwtAuthenticationGuard from '../authentication/token/jwt-authentication.guard';
import EmailSchedulingService from './emailScheduling.service';
import EmailScheduleDto from './dto/emailSchedule.dto';
import Resolve from '../common/helpers/Resolve';

@Controller('email-scheduling')
export default class EmailSchedulingController {
  constructor(
    private readonly emailSchedulingService: EmailSchedulingService,
  ) {}

  @Post('schedule')
  @UseGuards(JwtAuthenticationGuard)
  async scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this.emailSchedulingService.scheduleEmail(emailSchedule);
    return Resolve.ok(0, 'Success');
  }

  @Post('cancle-all-schedule')
  @UseGuards(JwtAuthenticationGuard)
  async cancelAllScheduledEmails() {
    this.emailSchedulingService.cancelAllScheduledEmails();
    return Resolve.ok(0, 'Success');
  }
}
