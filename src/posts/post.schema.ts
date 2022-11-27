import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../users/schema/user.schema';
import { Transform, Type } from 'class-transformer';
import { Category } from '../categories/category.schema';
import { Series } from '../series/series.schema';
// import { PrivateFile } from '../files/privateFiles.schema';
import { Comments } from '../comment/comment.schema';
import { Files } from '../files/files.schema';
// import { Series } from '../series/series.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  title: string;

  // @Prop({ type: Date, default: Date.now, index: { expires: 20 } })
  // time: Date;

  @Prop({
    //can modify the data before saving it in the database.
    set: (content: string) => {
      return content.trim();
    },
  })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) // like many to one relationship User have many posts
  @Type(() => User)
  author: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // like many to many relationship Category have many posts
  })
  @Type(() => Category)
  categories: Category[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Files',
  })
  @Type(() => Files)
  file?: Files;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Series.name,
  })
  @Type(() => Series)
  series?: Series;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Comments.name }], // like many to many relationship Category have many posts
    ref: Comments.name,
  })
  @Type(() => Comments)
  comments?: Comments[];
}

const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', content: 'text' });

export { PostSchema };
