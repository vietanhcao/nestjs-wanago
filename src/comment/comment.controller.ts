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
import JwtAuthenticationGuard from 'src/authentication/token/jwt-authentication.guard';
import Resolve from 'src/common/helpers/Resolve';
import { PaginationParams } from 'src/utils/paginationParams';
import RequestWithUser from '../authentication/requestWithUser.interface';
import ParamsWithId from '../utils/paramsWithId';
import { CommentService } from './comment.service';
import CommentDto from './dto/comment.dto';

@Controller('comment')
// @UseInterceptors(MongooseClassSerializerInterceptor(Comments))
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getAllComments(
    @Query() { skip, limit }: PaginationParams,
    @Param() { id }: ParamsWithId,
  ) {
    const { result, pagination } = await this.commentService.findAllByPostId(
      id,
      skip,
      limit,
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
    await this.commentService.create(comment, req.user);
    return Resolve.ok(200, 'Success');
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
