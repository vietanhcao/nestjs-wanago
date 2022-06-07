import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Files } from 'src/files/files.schema';

export class PostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  // @Type(() => Files)
  @IsMongoId()
  file: Files;
}

export default PostDto;
