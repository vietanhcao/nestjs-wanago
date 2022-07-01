import { IsNotEmpty } from 'class-validator';

export class TwoFactorAuthenticationCodeDto {
  @IsNotEmpty()
  twoFactorAuthenticationCode: string;
}

export default TwoFactorAuthenticationCodeDto;
