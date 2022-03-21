import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import Role from 'src/authentication/enum/role.enum';
import RoleGuard from 'src/authentication/guards/role.guard';
import EmailDto from './email.dto';
import { EmailService } from './email.service';
import Resolve from 'src/common/helpers/Resolve';
import RequestWithUser from '../authentication/requestWithUser.interface';

@Controller('email')
export class MailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-queue')
  @UseGuards(RoleGuard(Role.User))
  async sendConfirmationEmail(
    @Body() email: EmailDto,
    @Req() req: RequestWithUser,
  ) {
    // TODO: pass the email data
    this.emailService.sendConfirmationEmail(email);
    return Resolve.ok(0, 'Success');
  }
}
