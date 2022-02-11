import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import PermissionGuard from 'src/authentication/guards/permission.guard';
import JwtAuthenticationGuard from 'src/authentication/token/jwt-authentication.guard';
import PostsPermission from 'src/posts/enum/postsPermission.enum';
import RequestWithUser from '../authentication/requestWithUser.interface';
import MongooseClassSerializerInterceptor from '../utils/mongooseClassSerializer.interceptor';
import ParamsWithId from '../utils/paramsWithId';
import { Comments } from './comment.schema';
import { CommentService } from './comment.service';
import CommentDto from './dto/comment.dto';

@Controller('comment')
@UseInterceptors(MongooseClassSerializerInterceptor(Comments))
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getAllComments(@Param() { id }: ParamsWithId) {
    return this.commentService.findAllByPostId(id);
  }

  // @Get(':id')
  // async getCategory(@Param() { id }: ParamsWithId) {
  //   return this.commentService.findOne(id);
  // }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createComment(
    @Body() comment: CommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentService.create(comment, req.user);
  }

  // @Delete(':id')
  // async deleteCategory(@Param() { id }: ParamsWithId) {
  //   return this.commentService.delete(id);
  // }

  // @Put(':id')
  // async updateCategory(
  //   @Param() { id }: ParamsWithId,
  //   @Body() category: CommentDto,
  // ) {
  //   return this.commentService.update(id, category);
  // }
}
