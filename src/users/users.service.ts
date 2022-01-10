import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User } from './user.schema';
import CreateUserDto from './dto/createUser.dto';
import PostsService from '../posts/posts.service';
import FilesService from '../files/files.service';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Injectable()
class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly postsService: PostsService,
    private readonly filesService: FilesService,
    @InjectConnection() private readonly connection: mongoose.Connection, // connection we’ve established
  ) {}

  async getByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).populate({
      path: 'posts',
      populate: {
        path: 'categories',
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getById(id: number) {
    // nested populate
    const user = await this.userModel.findById(id).populate({
      path: 'posts',
      populate: {
        path: 'categories',
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const avatar = await this.filesService.uploadPublicFile(
      imageBuffer,
      filename,
    );
    const userData = {
      avatar,
    };
    await this.userModel.findByIdAndUpdate({ _id: userId }, userData, {
      new: true,
    });
    return avatar;
  }

  async deleteAvatar(userId: number) {
    const user = await this.getById(userId);
    const fileId = user.avatar?._id;

    const userData = {
      avatar: null,
    };
    if (fileId) {
      await this.userModel.findByIdAndUpdate({ _id: userId }, userData, {
        new: true,
      });
      await this.filesService.deletePublicFile(fileId.toString());
    }
  }

  async create(userData: CreateUserDto) {
    const createdUser = new this.userModel(userData);
    // await createdUser.populate({
    //   path: 'posts',
    //   populate: {
    //     path: 'categories',
    //   },
    // });
    return createdUser.save();
  }

  async delete(userId: string) {
    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const user = await this.userModel
        .findByIdAndDelete(userId)
        .populate('posts')
        .session(session);

      if (!user) {
        throw new NotFoundException();
      }
      const posts = user.posts;

      await this.postsService.deleteMany(
        posts.map((post) => post._id.toString()),
        session,
      );
    });

    session.endSession();

    // start transaction
    // const session = await this.connection.startSession();

    // session.startTransaction();
    // try {
    //   debugger
    //   const user = await this.userModel
    //     .findByIdAndDelete(userId)
    //     .populate('posts')
    //     .session(session);

    //   if (!user) {
    //     throw new NotFoundException();
    //   }
    //   debugger
    //   throw new NotFoundException();
    //   const posts = user.posts;

    //   await this.postsService.deleteMany(
    //     posts.map((post) => post._id.toString()),
    //     session,
    //   );
    //   // everything work fine @commitTransaction
    //   await session.commitTransaction();
    // } catch (error) {
    //   // discard the operations
    //   await session.abortTransaction();
    //   throw error;
    // } finally {
    //   session.endSession();
    // }
  }
}

export default UsersService;
