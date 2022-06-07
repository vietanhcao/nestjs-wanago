import { Exclude, Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Category } from '../../categories/category.schema';
import { Series } from '../../series/series.schema';
import { User } from '../../users/schema/user.schema';

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

  @IsMongoId()
  @ValidateIf((obj) => {
    /**
     * if the user is not sent property, I will be ignored check is mongoid
     */
    return 'file' in obj;
  })
  file: string;

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
