import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ClientQuery from 'src/common/client-query';
import { User } from '../users/schema/user.schema';
import { Comments, CommentsDocument } from './comment.schema';
import CommentDto from './dto/comment.dto';

@Injectable()
export class CommentService {
  public commentClientQuery: ClientQuery<CommentsDocument>;
  constructor(
    @InjectModel(Comments.name) private commentsModel: Model<CommentsDocument>,
  ) {
    this.commentClientQuery = new ClientQuery(this.commentsModel);
  }

  async findAllByPostId(
    postId: string,
    documentsToSkip = 0,
    limitOfDocuments?: number,
  ) {
    const response = await this.commentClientQuery.findForQuery(
      {
        filter: { postId },
        limit: limitOfDocuments,
        offset: documentsToSkip,
        sort: { _id: 1 },
      },
      {
        queryMongoose: { postId },
        // populate: {
        //   path: 'roles department',
        //   select: 'name description',
        // },
        omit: ['owner', 'postId', 'createdAt', 'updatedAt'],
      },
    );
    return response;
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
