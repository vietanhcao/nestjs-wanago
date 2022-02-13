import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/schema/user.schema';
import CommentDto from './dto/comment.dto';
import UpdateCommentDto from './dto/updateComment.dto';
import { Comments, CommentsDocument } from './comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comments.name) private commentsModel: Model<CommentsDocument>,
  ) {}

  async findAllByPostId(postId: string) {
    return this.commentsModel.find({ postId }, { owner: 0, postId: 0 });
  }

  // async findOne(id: string) {
  //   const comments = await this.commentsModel.findById(id).populate('author');
  //   if (!comments) {
  //     throw new NotFoundException();
  //   }
  //   return comments;
  // }

  create(commentsData: CommentDto, owner: User) {
    const createdComments = new this.commentsModel({
      ...commentsData,
      owner,
    });
    return createdComments.save();
  }

  // async update(id: string, commentsData: UpdateCommentDto) {
  //   const comments = await this.commentsModel
  //     .findByIdAndUpdate(id, commentsData)
  //     .setOptions({ overwrite: true, new: true });
  //   if (!comments) {
  //     throw new NotFoundException();
  //   }
  //   return comments;
  // }

  // async delete(commentsId: string) {
  //   const result = await this.commentsModel.findByIdAndDelete(commentsId);
  //   if (!result) {
  //     throw new NotFoundException();
  //   }
  // }
}
