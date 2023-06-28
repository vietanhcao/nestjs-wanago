import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import JwtAuthenticationGuard from '../authentication/token/jwt-authentication.guard';
import Resolve from '../common/helpers/Resolve';
import RequestWithUser from '../authentication/requestWithUser.interface';
import ParamsWithId from '../utils/paramsWithId';
import { CommentService } from './comment.service';
import CommentDto from './dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getAllComments(@Param() { id }: ParamsWithId, @Query() query) {
    // const { result, pagination } = await this.commentService.findAllByPostId(
    //   id,
    //   skip,
    //   limit,
    // );

    const { result, pagination } = await this.commentService.findAllByPostId(
      id,
      query,
    );
    return Resolve.ok(0, 'Success', result, { pagination });
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
    const response = await this.commentService.create(comment, req.user);
    console.log(response);
    return Resolve.ok(200, 'Success', { _id: response._id });
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
