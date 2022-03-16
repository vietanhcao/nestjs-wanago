import {
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import ConfirmEmailDto from './confirmEmail.dto';
import { EmailConfirmationService } from './email-confirmation.service';
import RequestWithUser from '../authentication/requestWithUser.interface';
import JwtAuthenticationGuard from 'src/authentication/token/jwt-authentication.guard';
import Resolve from 'src/common/helpers/Resolve';

@Controller('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('confirm')
  async confirm(@Body() confirmationData: ConfirmEmailDto) {
    const email = await this.emailConfirmationService.decodeConfirmationToken(
      confirmationData.token,
    );
    await this.emailConfirmationService.confirmEmail(email);
    return Resolve.ok(0, 'Success');
  }

  @Post('resend-confirmation-link')
  @UseGuards(JwtAuthenticationGuard)
  async resendConfirmationLink(@Req() request: RequestWithUser) {
    await this.emailConfirmationService.resendConfirmationLink(request.user.id);
    return Resolve.ok(0, 'Success');
  }
}
