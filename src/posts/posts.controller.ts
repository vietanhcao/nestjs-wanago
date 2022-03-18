import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import Role from 'src/authentication/enum/role.enum';
import PermissionGuard from 'src/authentication/guards/permission.guard';
import RoleGuard from 'src/authentication/guards/role.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import JwtAuthenticationGuard from 'src/authentication/token/jwt-authentication.guard';
import Resolve from 'src/common/helpers/Resolve';
import { ExceptionsLoggerFilter } from 'src/utils/exceptionsLogger.filter';
import { PaginationParams } from 'src/utils/paginationParams';
import ParamsWithId from '../utils/paramsWithId';
import PostDto from './dto/post.dto';
import UpdatePostDto from './dto/updatePost.dto';
import PostsPermission from './enum/postsPermission.enum';
import PostsService from './posts.service';

@Controller('posts')
// @UseInterceptors(MongooseClassSerializerInterceptor(PostModel)) //enable to execute class-transformer
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Lấy ra danh sách các bài viết có trong cache
   * @public: có thể được xem bởi mọi người
   */
  @UseGuards(RoleGuard(Role.User))
  // @UseInterceptors(HttpCacheInterceptor)
  // @CacheKey(GET_POSTS_CACHE_KEY)
  // @CacheTTL(120)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true })) // transform: true to active @Type(() => Number)
  async getAllPosts(
    @Query() { skip, limit, startId }: PaginationParams,
    @Query('searchQuery') searchQuery: string,
    @Query('search') search: string,
    @Query() query,
  ) {
    if (search) {
      // hide elastic search
      // return this.postsService.searchForPosts(search, skip, limit);
    }
    console.log(query);
    const { result, pagination } = await this.postsService.findAll(
      skip,
      limit,
      startId,
      searchQuery,
    );
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  /**
   * @private: chỉ có thể được xem bởi người đó
   */
  @Get('me')
  @UseGuards(RoleGuard(Role.User))
  @UsePipes(new ValidationPipe({ transform: true })) // transform: true to active @Type(() => Number)
  async getAllPostsByUser(
    @Query() { skip, limit, startId }: PaginationParams,
    @Query('searchQuery') searchQuery: string,
    @Query('search') search: string,
    @Req() req: RequestWithUser,
  ) {
    if (search) {
      // hide elastic search
      // return this.postsService.searchForPosts(search, skip, limit);
    }
    const { result, pagination } = await this.postsService.findAll(
      skip,
      limit,
      startId,
      searchQuery,
      req.user,
    );
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  @Get(':id')
  @UseFilters(ExceptionsLoggerFilter) // catch all exception
  async getPost(@Param() { id }: ParamsWithId) {
    const response = await this.postsService.findOne(id);
    return Resolve.ok(0, 'Success', response);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createPost(@Body() post: PostDto, @Req() req: RequestWithUser) {
    await this.postsService.create(post, req.user);
    return Resolve.ok(0, 'Success');
  }

  @Delete(':id')
  @UseGuards(PermissionGuard(PostsPermission.DeletePost))
  async deletePost(@Param() { id }: ParamsWithId, @Req() req: RequestWithUser) {
    await this.postsService.delete(id, req.user);
    return Resolve.ok(0, 'Success');
  }

  @Put(':id') // meaning update all filed
  @UseGuards(JwtAuthenticationGuard)
  async updatePost(
    @Param() { id }: ParamsWithId,
    @Body() post: UpdatePostDto,
    @Req() req: RequestWithUser,
  ) {
    await this.postsService.update(id, post, req.user);
    return Resolve.ok(0, 'Success');
  }

  @Patch(':id') // meaning update partial filed
  @UseGuards(JwtAuthenticationGuard)
  async updatePostByPatch(
    @Param() { id }: ParamsWithId,
    @Body() post: UpdatePostDto,
    @Req() req: RequestWithUser,
  ) {
    await this.postsService.update(id, post, req.user);
    return Resolve.ok(0, 'Success');
  }
}
