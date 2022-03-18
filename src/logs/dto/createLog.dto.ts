import { IsEnum, IsString } from 'class-validator';
import LeverLog from '../leverLog.enum';

export class CreateLogDto {
  @IsString()
  bodyString: string;

  @IsString()
  method: string;

  @IsString()
  originalUrl: string;

  @IsString()
  statusCode: string;

  @IsString()
  responseTime: string;

  @IsString()
  userAgent: string;

  @IsString()
  statusMessage: string;

  @IsString()
  ip: string;

  @IsEnum(LeverLog)
  // @NotEquals(LeverLog[LeverLog.RUNNING])
  level: LeverLog;
}

export default CreateLogDto;
