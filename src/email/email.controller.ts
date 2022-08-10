import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import Role from '../authentication/enum/role.enum';
import RoleGuard from '../authentication/guards/role.guard';
import Resolve from '../common/helpers/Resolve';
import EmailDto from './email.dto';
import { EmailService } from './email.service';

@Controller('email')
export class MailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-queue')
  @UseGuards(RoleGuard(Role.User))
  async sendConfirmationEmail(@Body() email: EmailDto) {
    // TODO: pass the email data
    this.emailService.sendConfirmationEmail(email);
    return Resolve.ok(0, 'Success');
  }
}
