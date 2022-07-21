import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from './schema/user.schema';
import PostsModule from '../posts/posts.module';
import UsersService from './users.service';
import FilesModule from 'src/files/files.module';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { LocalFilesModule } from 'src/local-files/local-files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PostsModule,
    FilesModule,
    ConfigModule,
    LocalFilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
