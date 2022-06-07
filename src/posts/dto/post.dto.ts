import { Type } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { Files } from 'src/files/files.schema';

export class PostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @Type(() => Files)
  file: Files;
}

export default PostDto;
