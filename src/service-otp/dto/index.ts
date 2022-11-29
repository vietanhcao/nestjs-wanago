import { IsString, IsNotEmpty } from 'class-validator';

export class CreateServiceOptDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export class VerifyServiceOptDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  secure: string;

  @IsString()
  @IsNotEmpty()
  subject: string;
}
