import { Type } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { Post } from '../../posts/post.schema';

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @Type(() => Post)
  @IsNotEmpty()
  postId: string;
}

export default CommentDto;
