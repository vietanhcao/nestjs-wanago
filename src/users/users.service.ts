import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    const user = await this.userModel.findById(id).populate([
      {
        path: 'posts',
        populate: {
          path: 'categories',
        },
      },
      'files',
    ]);

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

  async addPrivateFile(imageBuffer: Buffer, filename: string, userId: string) {
    // const userData = {
    //   avatar: null,
    // };
    // const user = await this.userModel.findByIdAndUpdate(
    //   { _id: userId },
    //   userData,
    //   {
    //     new: true,
    //   },
    // );
    // await user.populate('files');
    return this.filesService.uploadPrivateFile(imageBuffer, filename, userId);
  }

  async getPrivateFile(userId: string, fileId: string) {
    const file = await this.filesService.getPrivateFile(fileId, userId);
    if (file.info.owner._id.toString() === userId.toString()) {
      return file;
    }
    throw new UnauthorizedException();
  }

  async getAllPrivateFiles(userId: number) {
    const userWithFiles = await this.getById(userId);
    if (userWithFiles) {
      return Promise.all(
        userWithFiles.files.map(async (file) => {
          const url = await this.filesService.generatePresignedUrl(file.key);
          return {
            // ...file,
            id: file._id,
            key: file.key,
            url,
          };
        }),
      );
    }
    throw new NotFoundException('User with this id does not exist');
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
