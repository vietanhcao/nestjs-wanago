import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Exclude, Transform, Type } from 'class-transformer';
import { Address, AddressSchema } from './address.schema';
import { Post } from '../posts/post.schema';
import { Files, FilesSchema } from '../files/files.schema';
import { PrivateFile, PrivateFileSchema } from 'src/files/privateFiles.schema';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ unique: true }) // unique
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  fullName: string;

  @Prop()
  @Exclude()
  password: string;

  @Prop({ type: AddressSchema }) // one to one relationship
  @Type(() => Address)
  address: Address;
  // to use getters: true
  @Prop({
    get: (creditCardNumber: string) => {
      if (!creditCardNumber) {
        return;
      }
      const lastFourDigits = creditCardNumber.slice(
        creditCardNumber.length - 4,
      );
      return `****-****-****-${lastFourDigits}`;
    },
  })
  creditCardNumber?: string;

  //Populating virtual properties query populate will show list (in jwt.strategy.ts) not save in UserSchema
  @Type(() => PrivateFile)
  files: PrivateFile[];

  //Populating virtual properties query populate will show list (in jwt.strategy.ts) not save in UserSchema
  @Type(() => Post)
  posts: Post[];

  @Prop({ type: FilesSchema }) // one to one relationship
  @Type(() => Files)
  avatar: Files;
}

const UserSchema = SchemaFactory.createForClass(User);
// index text search queries
UserSchema.index({ firstName: 'text', lastName: 'text' });
// UserSchema.index({ firstName: 1, lastName: 1 });//ascending index

//@Getters fullName not save in database and auto return when has request
UserSchema.virtual('fullName').get(function (this: User) {
  return `${this.firstName} ${this.lastName}`;
});
// .set(function (this: UserDocument, fullName: string) {
//   const [firstName, lastName] = fullName.split(' ');
//   this.set({ firstName, lastName });
// })

//Populating virtual properties

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
});

UserSchema.virtual('files', {
  ref: 'PrivateFile',
  localField: '_id',
  foreignField: 'owner',
});

export { UserSchema };
