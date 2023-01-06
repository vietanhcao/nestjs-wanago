import {
  Inject,
  Injectable,
  CACHE_MANAGER,
  CacheStore,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import * as assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';
import { CreateServiceOptDto, VerifyServiceOptDto } from './dto';

@Injectable()
export class ServiceOtpService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheStore: CacheStore,

    private readonly emailService: EmailService,
  ) {}

  /**
   * Lưu thông tin xuống redis cùng thời hạn
   * @param otp
   * @returns
   */
  private async signalOtp() {
    const secure = uuidv4();
    const otp = this.makeOtp(6);
    return { secure, otp };
  }

  /**
   *Tạo mã otp ngẫu nhiên
   * @param otp
   * @returns
   */
  private makeOtp(length: number) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**x
   * Gửi mail để lấy mã otp
   * @returns section
   */
  async saveSectionOtpAndSentMail(dto: CreateServiceOptDto) {
    const { secure, otp } = await this.signalOtp();

    this.emailService.sendOtpEmail({
      email: dto.email,
      otp,
    });

    // dữ liệu lưu xuống redis có thể chứa thêm tên event để xử lý và payload đính kemf
    const dataStore = { otp };
    const cacheKey = `${dto.subject}: ${secure}`;
    const ttl = 60 * 60;
    await this.cacheStore.set<{ otp: string }>(cacheKey, dataStore, { ttl });
    return secure;
  }

  /**
   * xác thực otp
   * @param dto
   * @returns
   */
  async verifyOtp(dto: VerifyServiceOptDto) {
    const cacheKey = `${dto.subject}: ${dto.secure}`;
    const _cache = await this.cacheStore.get<{ otp: string }>(cacheKey);

    assert.ok(
      _cache,
      new HttpException('SECURE INVALID', HttpStatus.BAD_REQUEST),
    );

    const { otp } = _cache;
    // Kiểm tra OTP
    assert.ok(
      otp === dto.otp,
      new HttpException('OTP INVALID', HttpStatus.BAD_REQUEST),
    );

    // todo: xử lý event sau khi xác thực otp thành công
    return true;
  }
}
