import { Exclude, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Post } from 'src/posts/post.schema';
import { User } from '../../users/schema/user.schema';

export class UpdateCommentDto {
  @IsOptional()
  @Exclude()
  _id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @Type(() => Post)
  @IsOptional()
  @IsNotEmpty()
  postId?: Post;
}

export default UpdateCommentDto;
