import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform, Type } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { PrivateFile } from '../../files/privateFiles.schema';
import Permission from '../../authentication/enum/permission.enum';
import Role from '../../authentication/enum/role.enum';
import { Files, FilesSchema } from '../../files/files.schema';
import { Post } from '../../posts/post.schema';
import { Address, AddressSchema } from './address.schema';

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

  @Prop({ require: true, unique: true, lowercase: true }) // unique
  email: string;

  @Prop({ default: false })
  isEmailConfirmed: boolean;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  fullName: string;

  @Prop({ require: true })
  @Exclude()
  password: string;

  @Prop({ default: Role.User, enum: Role })
  role: Role;

  @Prop({ default: ['DeletePost', 'CreateCategory'], type: [String] })
  permissions: Permission[];

  // refreshToken
  @Prop()
  @Exclude()
  currentHashedRefreshToken?: string;

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

  @Prop()
  twoFactorAuthenticationSecret?: string;

  @Prop({ default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @Prop({ default: false })
  public isRegisteredWithGoogle: boolean;
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
