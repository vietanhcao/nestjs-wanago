import { Exclude, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Post } from '../../posts/post.schema';

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
