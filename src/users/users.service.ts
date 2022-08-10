import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import LocalFileDto from '../local-files/local-files.dto';
import { LocalFilesService } from '../local-files/local-files.service';
import FilesService from '../files/files.service';
import PostsService from '../posts/posts.service';
import CreateUserDto from './dto/createUser.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly postsService: PostsService,
    private readonly localFilesService: LocalFilesService,
    private readonly filesService: FilesService,
    @InjectConnection() private readonly connection: mongoose.Connection, // connection we’ve established
  ) {}

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const user = await this.userModel.findByIdAndUpdate(
      { _id: userId },
      { currentHashedRefreshToken },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException();
    }
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(userId: number) {
    return this.userModel.findByIdAndUpdate(
      { _id: userId },
      {
        currentHashedRefreshToken: null,
      },
      { new: true },
    );
  }

  async getByEmail(email: string) {
    // const user = await this.userModel.findOne({ email }).populate({
    //   path: 'posts',
    //   populate: {
    //     path: 'categories',
    //   },
    // });
    const user = await this.userModel
      .findOne({ email })
      .select(
        'lastName firstName password avatar role isEmailConfirmed email isTwoFactorAuthenticationEnabled',
      );
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getById(id: string) {
    // nested populate
    // const user = await this.userModel.findById(id).populate([
    //   {
    //     path: 'posts',
    //     populate: {
    //       path: 'categories',
    //     },
    //   },
    //   'files',
    // ]);
    const user = await this.userModel
      .findById(id)
      .select(
        'lastName firstName avatar role currentHashedRefreshToken email twoFactorAuthenticationSecret isTwoFactorAuthenticationEnabled',
      );
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const avatar = await this.filesService.uploadPublicFile(
      imageBuffer,
      filename,
      `${userId}`,
    );
    const userData = {
      avatar,
    };
    await this.userModel.findByIdAndUpdate({ _id: userId }, userData, {
      new: true,
    });
    return avatar;
  }

  async addFileLocal(user: User, fileData: LocalFileDto) {
    await this.localFilesService.saveLocalFileData(fileData, user);

    // await this.usersRepository.update(userId, {
    //   avatarId: avatar.id,
    // });
  }
  async createWithGoogle(email: string, name: string) {
    // const stripeCustomer = await this.stripeService.createCustomer(name, email);

    const createdUser = new this.userModel({
      email,
      name,
      isRegisteredWithGoogle: true,
    });
    return createdUser.save();
  }

  async deleteAvatar(userId: string) {
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
    const file = await this.filesService.getPrivateFile(fileId);
    if (file.info.owner._id.toString() === userId.toString()) {
      return file;
    }
    throw new UnauthorizedException();
  }

  async getAllPrivateFiles(userId: string) {
    const userWithFiles = await this.getById(userId);
    if (userWithFiles.files) {
      return Promise.all(
        userWithFiles.files?.map(async (file) => {
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
  async markEmailAsConfirmed(email: string) {
    return this.userModel.findOneAndUpdate(
      { email },
      {
        isEmailConfirmed: true,
      },
      { new: true },
    );
  }
  async deleteWithoutTransactions(userId: string) {
    const user = await this.userModel
      .findByIdAndDelete(userId)
      .populate('posts');
    if (!user) {
      throw new NotFoundException();
    }
    const posts = user.posts;

    return this.postsService.deleteMany(
      posts.map((post) => post._id.toString()),
    );
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    return this.userModel.findOneAndUpdate(
      { _id: userId },
      {
        twoFactorAuthenticationSecret: secret,
      },
      { new: true },
    );
  }

  async turnOnTwoFactorAuthentication(userId: string) {
    return this.userModel.findByIdAndUpdate(
      { _id: userId },
      { isTwoFactorAuthenticationEnabled: true },
      {
        new: true,
      },
    );
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
