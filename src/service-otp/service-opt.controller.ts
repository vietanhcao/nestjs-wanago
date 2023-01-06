import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import Resolve from 'src/common/helpers/Resolve';
import JwtAuthenticationGuard from '../authentication/token/jwt-authentication.guard';
import { CreateServiceOptDto, VerifyServiceOptDto } from './dto';
import { ServiceOtpService } from './service-otp.service';

@Controller('otp')
export class ServiceOtpController {
  constructor(private readonly serviceOtpService: ServiceOtpService) {}

  @Post('generate')
  @UseGuards(JwtAuthenticationGuard)
  async createOtp(@Body() dto: CreateServiceOptDto) {
    const secure = await this.serviceOtpService.saveSectionOtpAndSentMail(dto);
    return Resolve.ok(0, 'Success', secure);
  }

  @Post('verify')
  @UseGuards(JwtAuthenticationGuard)
  async verifyOtp(@Body() dto: VerifyServiceOptDto) {
    const secure = await this.serviceOtpService.verifyOtp(dto);
    return Resolve.ok(0, 'Success', secure);
  }

  // quy trình đăng ký otp chứa event vào db sau đó gửi mail -> verify otp -> xóa event trong db (hoặc đổi trạng thái) lấy event trong db ra để xử lý
}
