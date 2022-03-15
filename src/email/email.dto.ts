import { IsString, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty({ message: 'The subject is required' })
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export default EmailDto;
