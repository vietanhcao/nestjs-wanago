import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from '../../users/schema/user.schema';
import { Exclude, Type } from 'class-transformer';
import { Category } from '../../categories/category.schema';
import { Series } from '../../series/series.schema';

export class UpdatePostDto {
  @IsOptional()
  @Exclude()
  _id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @Type(() => Category)
  @IsOptional()
  categories?: Category[];

  @Type(() => User)
  @IsOptional()
  @IsNotEmpty()
  author?: User;

  @Type(() => Series)
  @IsOptional()
  series?: Series;
}

export default UpdatePostDto;
