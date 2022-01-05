import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../users/user.schema';
import { Transform, Type } from 'class-transformer';
import { Category } from '../categories/category.schema';
// import { Series } from '../series/series.schema';

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  title: string;

  @Prop({
    //can modify the data before saving it in the database.
    set: (content: string) => {
      return content.trim();
    },
  })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name }) // like many to one relationship
  @Type(() => User)
  author: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Category.name }], // like many to many relationship
  })
  @Type(() => Category)
  categories: Category[];

  // @Prop({
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: Series.name,
  // })
  // @Type(() => Series)
  // series?: Series;
}

const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', content: 'text' });

export { PostSchema };
